import { NextResponse } from "next/server";
import { headers } from "next/headers";
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

// Stripe llama a esta URL directamente (no es el navegador del
// usuario), así que aquí no hay sesión ni cookies -- se usa el
// cliente con la service role key para poder escribir en la BD.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Firma de webhook inválida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    // Se dispara cada vez que cambia algo en una cuenta conectada,
    // incluida la verificación de identidad (KYC).
    case "account.updated": {
      const account = event.data.object as Stripe.Account;

      const kyc_status = account.charges_enabled ? "verified" : "pending";

      await supabase
        .from("providers")
        .update({ kyc_status })
        .eq("stripe_account_id", account.id);

      break;
    }

    // Se añadirá aquí en el siguiente paso: "checkout.session.completed"
    // para registrar la transacción, generar las dos facturas y dar
    // acceso al contenido tras un pago real.

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { service_id, client_id, provider_id, platform_fee } =
        session.metadata as Record<string, string>;

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
        console.error("Error guardando la transacción:", txError);
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

        // NOTA: se asume que los precios ya incluyen IVA (21% por
        // defecto) para calcular la base imponible desglosada. El
        // tipo y régimen fiscal real (IVA vs IPSI, servicio exento,
        // etc.) debe confirmarse con el asesor fiscal antes de
        // facturar con clientes reales -- ver chat de contabilidad.
        const TAX_RATE = 21;

        try {
          // --- Factura al cliente final ---
          const cliInvoiceNumber = await getNextInvoiceNumber("CLI");
          const cliPreviousHash = await getLastHash("CLI");
          const cliIssuedAt = new Date().toISOString();
          const cliBase = totalCliente / (1 + TAX_RATE / 100);
          const cliTaxAmount = totalCliente - cliBase;
          const cliHash = computeInvoiceHash({
            invoiceNumber: cliInvoiceNumber,
            issuedAt: cliIssuedAt,
            issuerTaxId: COXIRO_TAX_ID,
            recipientTaxId: client?.tax_id ?? "NO-FACILITADO",
            total: totalCliente,
            previousHash: cliPreviousHash,
          });

          // --- Liquidación de comisión al proveedor ---
          const provInvoiceNumber = await getNextInvoiceNumber("PROV");
          const provPreviousHash = await getLastHash("PROV");
          const provIssuedAt = new Date().toISOString();
          const provBase = totalComision / (1 + TAX_RATE / 100);
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
              tax_rate: TAX_RATE,
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
              concept: `Comisión de gestión — ${service?.title ?? "servicio"}`,
              tax_base: Number(provBase.toFixed(2)),
              tax_rate: TAX_RATE,
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
