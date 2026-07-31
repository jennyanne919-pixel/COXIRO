import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { processPayment } from "@/lib/payment-processing";
import { sendCreatePasswordEmail } from "@/lib/email/send";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event | undefined;
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET!,
    process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
  ].filter(Boolean) as string[];

  for (const secret of secrets) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
      break;
    } catch {
      // Prueba con el siguiente secreto
    }
  }

  if (!event) {
    console.error("Firma de webhook invalida con todos los secretos disponibles");
    return NextResponse.json({ error: "Firma invalida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const kyc_status = account.charges_enabled ? "verified" : "pending";

      await supabase
        .from("providers")
        .update({ kyc_status })
        .eq("stripe_account_id", account.id);

      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { service_id, provider_id, platform_fee } =
        session.metadata as Record<string, string>;
      let client_id = (session.metadata as Record<string, string>).client_id;

      if (!client_id) {
        const email = session.customer_details?.email ?? session.customer_email;
        const name = session.customer_details?.name ?? email ?? "Cliente";

        if (!email) {
          console.error("No se pudo resolver el cliente: falta el email de Stripe");
          break;
        }

        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existingUser) {
          client_id = existingUser.id;
        } else {
          const randomPassword = randomBytes(24).toString("hex");

          const { data: newAuthUser, error: createError } =
            await supabase.auth.admin.createUser({
              email,
              password: randomPassword,
              email_confirm: true,
            });

          if (createError || !newAuthUser.user) {
            console.error("Error creando la cuenta del cliente:", createError);
            break;
          }

          client_id = newAuthUser.user.id;

          await supabase.from("users").insert({
            id: client_id,
            email,
            password_hash: "managed_by_supabase_auth",
            role: "client",
            full_name: name,
          });

          await supabase.from("clients").insert({
            user_id: client_id,
            billing_name: name,
            client_type: "particular",
          });

          const resultado = await sendCreatePasswordEmail({ to: email, nombre: name });
          if (!resultado.success) {
            console.error("Error enviando el email de crear contrasena");
          }
        }
      }

      // Suscripción (membresía): NO se genera factura aquí -- eso lo
      // hace "invoice.paid", que se dispara también para este primer
      // cobro y para todos los siguientes, así todo pasa por el mismo
      // camino sin duplicar lógica. Aquí solo registramos que existe.
      if (session.mode === "subscription" && session.subscription) {
        await supabase.from("subscriptions").insert({
          service_id,
          client_id,
          provider_id,
          stripe_subscription_id: session.subscription as string,
          status: "active",
        });
        break;
      }

      // Pago único: se procesa entero aquí mismo.
      await processPayment({
        serviceId: service_id,
        clientId: client_id,
        providerId: provider_id,
        amountTotal: (session.amount_total ?? 0) / 100,
        platformFee: Number(platform_fee),
        stripePaymentIntentId: session.payment_intent as string,
      });

      break;
    }

    // Cada cobro de una suscripción (el primero y todos los
    // siguientes, mes a mes o año a año) dispara este evento.
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;

      if (!subscriptionId) {
        // Factura suelta, no asociada a una suscripción -- no es
        // nuestro caso, se ignora.
        break;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("service_id, client_id, provider_id")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (!subscription) {
        console.error("[invoice.paid] No se encontro la suscripcion:", subscriptionId);
        break;
      }

      const { data: provider } = await supabase
        .from("providers")
        .select("commission_rate")
        .eq("user_id", subscription.provider_id)
        .single();

      const amountTotal = (invoice.amount_paid ?? 0) / 100;
      const platformFee = Number(
        ((amountTotal * Number(provider?.commission_rate ?? 0)) / 100).toFixed(2)
      );

      await processPayment({
        serviceId: subscription.service_id,
        clientId: subscription.client_id,
        providerId: subscription.provider_id,
        amountTotal,
        platformFee,
        stripePaymentIntentId: (invoice.payment_intent as string) ?? null,
      });

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
