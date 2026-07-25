import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getNextInvoiceNumber,
  getLastHash,
  computeInvoiceHash,
  COXIRO_TAX_ID,
  COXIRO_LEGAL_NAME,
} from "@/lib/invoicing";
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
        }
      }

      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          service_id,
          client_id,
          provider_id,
          amount_total: (session.amount_total ?? 0) / 100,
          platform_fee: Number(platform_fee),
          currency: session.currency?.toUpperCase() ?? "EUR",
          stripe_payment_intent_id: session.payment_intent as string,
          status: "paid",
        })
        .select("id")
        .single();

      if (txError) {
        console.error("Error guardando la transaccion:", txError);
      }

      if (transaction) {
        const [{ data: service }, { data: client }, { data: provider }] =
          await Promise.all([
            supabase.from("services").select("title").eq("id", service_id).single(),
            supabase.from("clients").select("billing_name, tax_id").eq("user_id", client_id).single(),
            supabase.from("providers").select("business_name, tax_id").eq("user_id", provider_id).single(),
          ]);

        const totalCliente = (session.amount_total ?? 0) / 100;
        const totalComision = Number(platform_fee);

        const TAX_RATE_CLIENTE = 21;
        const TAX_RATE_PROVEEDOR = 0.5;

        try {
          const cliInvoiceNumber = await getNextInvoiceNumber("CLI");
          const cliPreviousHash = await getLastHash("CLI");
          const cliIssuedAt = new Date().toISOString();
          const cliBase = totalCliente / (1 + TAX_RATE_CLIENTE / 100);
          const cliTaxAmount = totalCliente - cliBase;
          const cliHash = computeInvoiceHash({
            invoiceNumber: cliInvoiceNumber,
            issuedAt: cliIssuedAt,
            issuerTaxId: COXIRO_TAX_ID,
            recipientTaxId: client?.tax_id ?? "NO-FACILITADO",
            total: totalCliente,
            previousHash: cliPreviousHash,
          });

          const provInvoiceNumber = await getNextInvoiceNumber("PROV");
          const provPreviousHash = await getLastHash("PROV");
          const provIssuedAt = new Date().toISOString();
          const provBase = totalComision / (1 + TAX_RATE_PROVEEDOR / 100);
          const provTaxAmount = totalComision - provBase;
          const provHash = computeInvoiceHash({
            invoiceNumber: provInvoiceNumber,
            issuedAt: provIssuedAt,
            issuerTaxId: COXIRO_TAX_ID,
            recipientTaxId: provider?.tax_id ?? "NO-FACILITADO",
            total: totalComision,
            previousHash: provPreviousHash,
          });

          await supabase.from("invoices").insert([
            {
              transaction_id: transaction.id,
              type: "client_invoice",
              invoice_number: cliInvoiceNumber,
              issued_at: cliIssuedAt,
              concept: service?.title ?? "Servicio contratado en Coxiro",
              tax_base: Number(cliBase.toFixed(2)),
              tax_rate: TAX_RATE_CLIENTE,
              tax_amount: Number(cliTaxAmount.toFixed(2)),
              total: totalCliente,
              issuer_name: COXIRO_LEGAL_NAME,
              issuer_tax_id: COXIRO_TAX_ID,
              recipient_name: client?.billing_name ?? "Cliente",
              recipient_tax_id: client?.tax_id ?? null,
              hash: cliHash,
              previous_hash: cliPreviousHash,
            },
            {
              transaction_id: transaction.id,
              type: "provider_settlement",
              invoice_number: provInvoiceNumber,
              issued_at: provIssuedAt,
              concept: `Comision de gestion - ${service?.title ?? "servicio"}`,
              tax_base: Number(provBase.toFixed(2)),
              tax_rate: TAX_RATE_PROVEEDOR,
              tax_amount: Number(provTaxAmount.toFixed(2)),
              total: totalComision,
              issuer_name: COXIRO_LEGAL_NAME,
              issuer_tax_id: COXIRO_TAX_ID,
              recipient_name: provider?.business_name ?? "Proveedor",
              recipient_tax_id: provider?.tax_id ?? null,
              hash: provHash,
              previous_hash: provPreviousHash,
            },
          ]);
        } catch (invoiceError) {
          console.error("Error generando las facturas:", invoiceError);
        }

        await supabase.from("content_access").insert({
          transaction_id: transaction.id,
          client_id,
          service_id,
        });
      }

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
