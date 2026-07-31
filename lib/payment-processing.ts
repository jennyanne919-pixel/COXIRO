import { createAdminClient } from "@/lib/supabase/admin";
import {
  getNextInvoiceNumber,
  getLastHash,
  computeInvoiceHash,
  COXIRO_TAX_ID,
  COXIRO_LEGAL_NAME,
} from "@/lib/invoicing";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import {
  sendPurchaseConfirmation,
  sendProviderSale,
  sendInternalSale,
} from "@/lib/email/send";

// Se llama tanto para un pago único como para cada cobro de una
// suscripción (mensual/anual) -- toda la lógica de facturación y
// avisos vive aquí, en un único sitio.
export async function processPayment(params: {
  serviceId: string;
  clientId: string;
  providerId: string;
  amountTotal: number; // en euros, no céntimos
  platformFee: number; // en euros
  stripePaymentIntentId: string | null;
}) {
  const supabase = createAdminClient();
  const { serviceId, clientId, providerId, amountTotal, platformFee, stripePaymentIntentId } = params;

  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      service_id: serviceId,
      client_id: clientId,
      provider_id: providerId,
      amount_total: amountTotal,
      platform_fee: platformFee,
      currency: "EUR",
      stripe_payment_intent_id: stripePaymentIntentId,
      status: "paid",
    })
    .select("id")
    .single();

  if (txError) {
    console.error("[processPayment] Error guardando la transaccion:", txError);
    return;
  }
  if (!transaction) return;

  const [
    { data: service },
    { data: client },
    { data: provider },
    { data: clientUser },
    { data: providerUser },
  ] = await Promise.all([
    supabase.from("services").select("title").eq("id", serviceId).single(),
    supabase.from("clients").select("billing_name, tax_id").eq("user_id", clientId).single(),
    supabase.from("providers").select("business_name, tax_id").eq("user_id", providerId).single(),
    supabase.from("users").select("email").eq("id", clientId).single(),
    supabase.from("users").select("email").eq("id", providerId).single(),
  ]);

  // PENDIENTE DE CONFIRMAR con el asesor fiscal -- IPSI 0.5% solo en
  // la factura al cliente; autofactura al proveedor sin impuesto,
  // por el neto (art. 5 RD 1619/2012, confirmado con el asesor).
  const TAX_RATE_CLIENTE = 0.5;
  const TAX_RATE_PROVEEDOR = 0;
  const netoProveedor = amountTotal - platformFee;

  let cliInvoiceId: string | null = null;
  let cliInvoicePdf: Buffer | undefined;
  let provInvoicePdf: Buffer | undefined;

  try {
    const cliInvoiceNumber = await getNextInvoiceNumber("CLI");
    const cliPreviousHash = await getLastHash("CLI");
    const cliIssuedAt = new Date().toISOString();
    const cliBase = amountTotal / (1 + TAX_RATE_CLIENTE / 100);
    const cliTaxAmount = amountTotal - cliBase;
    const cliHash = computeInvoiceHash({
      invoiceNumber: cliInvoiceNumber,
      issuedAt: cliIssuedAt,
      issuerTaxId: COXIRO_TAX_ID,
      recipientTaxId: client?.tax_id ?? "NO-FACILITADO",
      total: amountTotal,
      previousHash: cliPreviousHash,
    });

    const provInvoiceNumber = await getNextInvoiceNumber("PROV");
    const provPreviousHash = await getLastHash("PROV");
    const provIssuedAt = new Date().toISOString();
    const provBase = netoProveedor / (1 + TAX_RATE_PROVEEDOR / 100);
    const provTaxAmount = netoProveedor - provBase;
    const provHash = computeInvoiceHash({
      invoiceNumber: provInvoiceNumber,
      issuedAt: provIssuedAt,
      issuerTaxId: provider?.tax_id ?? "NO-FACILITADO",
      recipientTaxId: COXIRO_TAX_ID,
      total: netoProveedor,
      previousHash: provPreviousHash,
    });

    const { data: insertedInvoices } = await supabase
      .from("invoices")
      .insert([
        {
          transaction_id: transaction.id,
          type: "client_invoice",
          invoice_number: cliInvoiceNumber,
          issued_at: cliIssuedAt,
          concept: service?.title ?? "Servicio contratado en Coxiro",
          tax_base: Number(cliBase.toFixed(2)),
          tax_rate: TAX_RATE_CLIENTE,
          tax_amount: Number(cliTaxAmount.toFixed(2)),
          total: amountTotal,
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
          concept: `Autofactura — venta de servicio a Coxiro: ${service?.title ?? "servicio"} (emitida por Coxiro en nombre del proveedor, art. 5 RD 1619/2012)`,
          tax_base: Number(provBase.toFixed(2)),
          tax_rate: TAX_RATE_PROVEEDOR,
          tax_amount: Number(provTaxAmount.toFixed(2)),
          total: netoProveedor,
          issuer_name: provider?.business_name ?? "Proveedor",
          issuer_tax_id: provider?.tax_id ?? null,
          recipient_name: COXIRO_LEGAL_NAME,
          recipient_tax_id: COXIRO_TAX_ID,
          hash: provHash,
          previous_hash: provPreviousHash,
        },
      ])
      .select("*");

    const cliInvoiceRow = insertedInvoices?.find((i) => i.type === "client_invoice") ?? null;
    const provInvoiceRow = insertedInvoices?.find((i) => i.type === "provider_settlement") ?? null;
    cliInvoiceId = cliInvoiceRow?.id ?? null;

    if (cliInvoiceRow) {
      const verifyUrlCli = `${process.env.NEXT_PUBLIC_SITE_URL}/verificar-factura/${cliInvoiceRow.id}`;
      cliInvoicePdf = await generateInvoicePdf(cliInvoiceRow, verifyUrlCli);
    }
    if (provInvoiceRow) {
      const verifyUrlProv = `${process.env.NEXT_PUBLIC_SITE_URL}/verificar-factura/${provInvoiceRow.id}`;
      provInvoicePdf = await generateInvoicePdf(provInvoiceRow, verifyUrlProv);
    }
  } catch (invoiceError) {
    console.error("[processPayment] Error generando las facturas:", invoiceError);
  }

  await supabase.from("content_access").insert({
    transaction_id: transaction.id,
    client_id: clientId,
    service_id: serviceId,
  });

  const invoiceUrl = cliInvoiceId
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/invoices/${cliInvoiceId}/pdf`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`;

  await Promise.allSettled([
    clientUser?.email
      ? sendPurchaseConfirmation({
          to: clientUser.email,
          nombreCliente: client?.billing_name ?? "Cliente",
          servicio: service?.title ?? "Servicio",
          proveedor: provider?.business_name ?? "Profesional en Coxiro",
          importe: `${amountTotal.toFixed(2)} €`,
          invoiceUrl,
          invoicePdf: cliInvoicePdf,
        })
      : Promise.resolve(),
    providerUser?.email
      ? sendProviderSale({
          to: providerUser.email,
          nombreProveedor: provider?.business_name ?? "Profesional",
          cliente: client?.billing_name ?? "Cliente",
          servicio: service?.title ?? "Servicio",
          importeTotal: `${amountTotal.toFixed(2)} €`,
          neto: `${netoProveedor.toFixed(2)} €`,
          invoicePdf: provInvoicePdf,
        })
      : Promise.resolve(),
    sendInternalSale({
      cliente: client?.billing_name ?? "Cliente",
      clienteEmail: clientUser?.email ?? "No disponible",
      proveedor: provider?.business_name ?? "Profesional",
      servicio: service?.title ?? "Servicio",
      importe: `${amountTotal.toFixed(2)} €`,
      stripePaymentIntentId: stripePaymentIntentId ?? "N/A",
    }),
  ]);
}
