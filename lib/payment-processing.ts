import type { ConsentCompra } from "@/lib/consent";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import {
  getNextInvoiceNumber,
  getLastHash,
  computeInvoiceHash,
  COXIRO_TAX_ID,
  COXIRO_LEGAL_NAME,
} from "@/lib/invoicing";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { leyendaNoSujeta } from "@/lib/legal/leyendas-factura";
import { regimenProveedor } from "@/lib/ajustes";
import { STRIPE_FIJO, STRIPE_PORCENTAJE } from "@/lib/admin/contabilidad";
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
  // false en las renovaciones de una suscripción: no se avisa a Coxiro de
  // cada cuota (quedan en Ventas y en la contabilidad) para no llenar el buzón.
  avisarInterno?: boolean;
  // Aceptación de términos y elección de inicio anticipado (solo en la primera compra).
  consent?: ConsentCompra | null;
  // Zona de residencia declarada por el cliente (también en las renovaciones).
  zona?: "ue" | "fuera" | null;
  comprador?: "particular" | "empresa" | null;
}) {
  const supabase = createAdminClient();
  const { serviceId, clientId, providerId, amountTotal, platformFee, stripePaymentIntentId } = params;
  const avisarInterno = params.avisarInterno ?? true;

  // Idempotencia: si Stripe reenvía el aviso (reintentos del webhook), no
  // se duplica la venta, las facturas ni los correos.
  if (stripePaymentIntentId) {
    const { data: yaExiste } = await supabase
      .from("transactions")
      .select("id")
      .eq("stripe_payment_intent_id", stripePaymentIntentId)
      .limit(1)
      .maybeSingle();
    if (yaExiste) {
      console.log("[processPayment] Cobro ya procesado, se ignora:", stripePaymentIntentId);
      return;
    }
  }

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
      ...(params.consent
        ? {
            terms_version: params.consent.termsVersion,
            terms_accepted_at: params.consent.termsAt,
            early_start: params.consent.inicio,
            early_start_type: params.consent.tipo,
            zona_cliente: params.consent.zona,
            comprador_declarado: params.consent.comprador,
          }
        : {}),
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
    supabase
      .from("services")
      .select("title, secondary_transfer_account_id, secondary_transfer_percent")
      .eq("id", serviceId)
      .single(),
    supabase.from("clients").select("billing_name, tax_id").eq("user_id", clientId).single(),
    supabase
      .from("providers")
      .select("business_name, legal_name, tax_id, stripe_account_id")
      .eq("user_id", providerId)
      .single(),
    supabase.from("users").select("email").eq("id", clientId).single(),
    supabase.from("users").select("email").eq("id", providerId).single(),
  ]);

  // PENDIENTE DE CONFIRMAR con el asesor fiscal -- IPSI 0.5% solo en
  // la factura al cliente (sin mostrarlo en el PDF); autofactura al
  // proveedor sin impuesto, por el neto (art. 5 RD 1619/2012, confirmado
  // con el asesor). platformFee ya incluye comisión + IPSI + el punto con
  // el que Coxiro asume el IPSI (ver lib/pricing.ts), así que el neto del
  // proveedor sale como precio base + 10 % cuando la comisión es del 10 %.
  //
  // Desde la fase 45b, si el profesional ya aceptó las condiciones de su categoría,
  // la factura al cliente lleva el impuesto de su categoría (IPSI 4 % o IVA 21 %)
  // INCLUIDO en el total y desglosado. Los profesionales anteriores siguen igual.
  const regimen = await regimenProveedor(supabase, providerId);
  const TAX_RATE_CLIENTE = regimen.usaCategoria ? (params.zona === "fuera" ? 0 : regimen.ajuste.impuesto_pct) : 0.5;
  const TAX_TYPE_CLIENTE: string | null = regimen.usaCategoria ? regimen.ajuste.impuesto_tipo : null;
  // Cliente fuera de la UE (profesionales con condiciones de categoría): la factura
  // al cliente sale "no sujeta" con la leyenda aprobada por el asesor, sin impuesto.
  const fueraUE = regimen.usaCategoria && params.zona === "fuera";
  const LEYENDA_FUERA_UE = fueraUE ? leyendaNoSujeta(regimen.categoria, params.comprador ?? params.consent?.comprador ?? null) : null;
  const TAX_RATE_PROVEEDOR = 0;
  const netoProveedor = amountTotal - platformFee;

  // ---- Reparto a tres partes (ej. Natalie / José Luis y María Luisa) ----
  // Si el servicio tiene un tercero configurado, el pago completo entró
  // en el balance de Coxiro (ver checkout/route.ts, que omite el
  // destination charge automático para estos servicios). Aquí se hacen
  // las dos transferencias manuales, con el mismo transfer_group para
  // que queden ligadas en el dashboard de Stripe. Si no hay tercero
  // configurado, no se hace nada aquí -- Stripe ya transfirió al
  // proveedor automáticamente al cobrar.
  if (service?.secondary_transfer_account_id && service?.secondary_transfer_percent && provider?.stripe_account_id) {
    const transferGroup = `tx_${transaction.id}`;
    const secondaryShare = Number(
      ((netoProveedor * Number(service.secondary_transfer_percent)) / 100).toFixed(2)
    );
    const providerShare = Number((netoProveedor - secondaryShare).toFixed(2));

    try {
      await stripe.transfers.create({
        amount: Math.round(providerShare * 100),
        currency: "eur",
        destination: provider.stripe_account_id,
        transfer_group: transferGroup,
        metadata: { transaction_id: transaction.id, role: "provider" },
      });
      console.log(
        `[processPayment] Transfer proveedor OK: ${providerShare}€ -> ${provider.stripe_account_id}`
      );

      await stripe.transfers.create({
        amount: Math.round(secondaryShare * 100),
        currency: "eur",
        destination: service.secondary_transfer_account_id,
        transfer_group: transferGroup,
        metadata: { transaction_id: transaction.id, role: "secondary" },
      });
      console.log(
        `[processPayment] Transfer socio OK: ${secondaryShare}€ -> ${service.secondary_transfer_account_id}`
      );
    } catch (transferError: any) {
      // No se corta el resto del flujo (facturas, emails) si esto falla --
      // se deja constancia en el log para revisarlo y transferir a mano
      // si hiciera falta. El dinero sigue seguro en el balance de Coxiro.
      console.error(
        "[processPayment] ERROR en las transferencias del reparto a tres partes:",
        transferError?.message,
        transferError
      );
    }
  }

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
          tax_type: TAX_TYPE_CLIENTE,
          tax_rate: TAX_RATE_CLIENTE,
          tax_amount: Number(cliTaxAmount.toFixed(2)),
          ...(LEYENDA_FUERA_UE ? { legend: LEYENDA_FUERA_UE } : {}),
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
          // Incluye el servicio concreto, pero sin la cita legal larga
          // (art. 5 RD 1619/2012) -- esa ya aparece en el pie de página de
          // la autofactura. El wrapText de invoice-pdf.ts se encarga de
          // partir esto en varias líneas si el título del servicio es largo.
          concept: `Servicios de Coxiro — ${service?.title ?? "Servicio"}`,
          tax_base: Number(provBase.toFixed(2)),
          tax_rate: TAX_RATE_PROVEEDOR,
          tax_amount: Number(provTaxAmount.toFixed(2)),
          total: netoProveedor,
          issuer_name: provider?.legal_name || provider?.business_name || "Proveedor",
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

  // Contabilidad de la venta (solo con condiciones de categoría): qué pasó con cada euro.
  if (regimen.usaCategoria) {
    try {
      let stripeFee = amountTotal * STRIPE_PORCENTAJE + STRIPE_FIJO;
      let stripeReal = false;
      if (stripePaymentIntentId) {
        try {
          const pi: any = await stripe.paymentIntents.retrieve(stripePaymentIntentId, {
            expand: ["latest_charge.balance_transaction"],
          });
          const fee = pi?.latest_charge?.balance_transaction?.fee;
          if (typeof fee === "number") {
            stripeFee = fee / 100;
            stripeReal = true;
          }
        } catch (e) {
          console.error("[processPayment] No se pudo leer la comisión real de Stripe, se estima:", e);
        }
      }
      const a = regimen.ajuste;
      const r2 = (n: number) => Math.round(n * 100) / 100;
      const baseCli = fueraUE ? r2(amountTotal) : r2(amountTotal / (1 + a.impuesto_pct / 100));
      const impuestoCli = r2(amountTotal - baseCli);
      const cuotaCompra = r2((netoProveedor * a.impuesto_pct) / 100);
      const deducible = a.impuesto_tipo === "IVA";
      const margen = r2(amountTotal - netoProveedor - impuestoCli - (deducible ? 0 : cuotaCompra) - stripeFee);
      const { error: accError } = await supabase.from("sale_accounting").insert({
        transaction_id: transaction.id,
        category: regimen.categoria,
        modo: a.modo,
        porcentaje: a.porcentaje,
        impuesto_tipo: a.impuesto_tipo,
        impuesto_pct: a.impuesto_pct,
        total: r2(amountTotal),
        base_cliente: baseCli,
        impuesto_cliente: impuestoCli,
        neto_proveedor: r2(netoProveedor),
        cuota_compra: cuotaCompra,
        compra_deducible: deducible,
        stripe_fee: r2(stripeFee),
        stripe_real: stripeReal,
        margen,
      });
      if (accError) console.error("[processPayment] Error guardando la contabilidad de la venta:", accError);
    } catch (accErr) {
      console.error("[processPayment] Error en la contabilidad de la venta:", accErr);
    }
  }

  // Contenido grabado sin petición de inicio anticipado: el acceso empieza al
  // terminar el plazo de desistimiento (14 días naturales).
  const accessFrom =
    params.consent && params.consent.tipo === "contenido" && !params.consent.inicio
      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      : null;
  await supabase.from("content_access").insert({
    transaction_id: transaction.id,
    client_id: clientId,
    service_id: serviceId,
    ...(accessFrom ? { access_from: accessFrom } : {}),
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
    avisarInterno
      ? sendInternalSale({
      cliente: client?.billing_name ?? "Cliente",
      clienteEmail: clientUser?.email ?? "No disponible",
      proveedor: provider?.business_name ?? "Profesional",
      servicio: service?.title ?? "Servicio",
      importe: `${amountTotal.toFixed(2)} €`,
      stripePaymentIntentId: stripePaymentIntentId ?? "N/A",
    })
      : Promise.resolve(),
  ]);
}