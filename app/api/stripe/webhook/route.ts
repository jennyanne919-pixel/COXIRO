import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { processPayment } from "@/lib/payment-processing";
import { sendCreatePasswordEmail } from "@/lib/email/send";
import Stripe from "stripe";
import { feeDesdeTotal } from "@/lib/pricing";
import { aplicarReembolsoEnBD } from "@/lib/refunds";

// Devuelve la fila de `subscriptions` de una suscripción de Stripe y la crea
// si aún no existe. Stripe no garantiza el orden de los avisos: "invoice.paid"
// del primer cobro puede llegar ANTES que "checkout.session.completed", así
// que ambos pasan por aquí. También se asegura de que la fecha de fin
// (cancel_at) esté aplicada en Stripe.
async function asegurarSuscripcion(subscriptionId: string) {
  const supabase = createAdminClient();

  let { data: fila } = await supabase
    .from("subscriptions")
    .select("service_id, client_id, provider_id")
    .eq("stripe_subscription_id", subscriptionId)
    .limit(1)
    .maybeSingle();

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const meta = (sub.metadata ?? {}) as Record<string, string>;

  if (!fila) {
    if (!meta.service_id || !meta.client_id || !meta.provider_id) return null;
    await supabase.from("subscriptions").insert({
      service_id: meta.service_id,
      client_id: meta.client_id,
      provider_id: meta.provider_id,
      stripe_subscription_id: subscriptionId,
      status: "active",
    });
    fila = {
      service_id: meta.service_id,
      client_id: meta.client_id,
      provider_id: meta.provider_id,
    };
  }

  if (meta.cancel_at && !sub.cancel_at) {
    try {
      await stripe.subscriptions.update(subscriptionId, { cancel_at: Number(meta.cancel_at) });
    } catch (err: any) {
      console.error("[suscripcion] Error aplicando cancel_at:", err?.message);
    }
  }

  return fila;
}

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
        await asegurarSuscripcion(session.subscription as string);

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
      // El endpoint de Stripe envía los eventos con una versión de API más
      // moderna que la del SDK (donde la factura ya no trae "subscription" ni
      // "payment_intent" en el mismo sitio). Se vuelve a pedir la factura con
      // la versión del SDK para leer siempre los mismos campos.
      const invoiceEvento = event.data.object as Stripe.Invoice;
      const invoice = await stripe.invoices.retrieve(invoiceEvento.id);
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;

      if (!subscriptionId) {
        // Factura suelta, no asociada a una suscripción -- no es
        // nuestro caso, se ignora.
        break;
      }

      const subscription = await asegurarSuscripcion(subscriptionId);

      if (!subscription) {
        // Error (no "break"): Stripe reintentará el aviso en vez de darlo por
        // bueno y dejar al cliente sin acceso ni factura.
        console.error("[invoice.paid] No se pudo resolver la suscripcion:", subscriptionId);
        return NextResponse.json({ error: "subscription_not_found" }, { status: 500 });
      }

      const { data: provider } = await supabase
        .from("providers")
        .select("commission_rate")
        .eq("user_id", subscription.provider_id)
        .single();

      const amountTotal = (invoice.amount_paid ?? 0) / 100;
      const platformFee = feeDesdeTotal(
        amountTotal,
        Number(provider?.commission_rate ?? 0)
      );

      await processPayment({
        serviceId: subscription.service_id,
        clientId: subscription.client_id,
        providerId: subscription.provider_id,
        amountTotal,
        platformFee,
        avisarInterno: invoice.billing_reason === "subscription_create",
        stripePaymentIntentId:
          typeof invoice.payment_intent === "string"
            ? invoice.payment_intent
            : invoice.payment_intent?.id ?? null,
      });

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: cancelada } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", sub.id)
        .select("client_id, service_id")
        .maybeSingle();

      if (cancelada?.client_id && cancelada?.service_id) {
        const { data: servicio } = await supabase
          .from("services")
          .select("total_installments, billing_interval")
          .eq("id", cancelada.service_id)
          .maybeSingle();

        const { data: pagos } = await supabase
          .from("transactions")
          .select("created_at")
          .eq("client_id", cancelada.client_id)
          .eq("service_id", cancelada.service_id)
          .eq("status", "paid")
          .order("created_at", { ascending: false });

        const completada =
          !!servicio?.total_installments && (pagos?.length ?? 0) >= servicio.total_installments;

        if (completada && pagos?.[0]) {
          // Terminó todos sus pagos: conserva el acceso hasta el final del
          // último periodo ya pagado.
          const fin = new Date(pagos[0].created_at);
          if (servicio?.billing_interval === "year") fin.setFullYear(fin.getFullYear() + 1);
          else fin.setMonth(fin.getMonth() + 1);
          await supabase
            .from("content_access")
            .update({ expires_at: fin.toISOString() })
            .eq("client_id", cancelada.client_id)
            .eq("service_id", cancelada.service_id)
            .is("expires_at", null);
        } else {
          // Cancelada antes de tiempo (impago, baja...): se retira el acceso.
          await supabase
            .from("content_access")
            .delete()
            .eq("client_id", cancelada.client_id)
            .eq("service_id", cancelada.service_id);
        }
      }
      break;
    }

    // Reembolso TOTAL de un cobro: se marca la venta y se corta el acceso
    // al contenido de esa compra. Un reembolso parcial no corta nada.
    // (Las facturas no se tocan aquí: un reembolso requiere factura
    // rectificativa, pendiente de definir con el asesor.)
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (!charge.refunded) break;

      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (!paymentIntentId) break;

      const { data: tx } = await supabase
        .from("transactions")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();

      if (!tx) {
        console.error("[charge.refunded] No se encontro la venta:", paymentIntentId);
        break;
      }

      await aplicarReembolsoEnBD(tx.id);

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
