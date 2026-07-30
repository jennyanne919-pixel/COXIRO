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
import {
  sendCreatePasswordEmail,
  sendPurchaseConfirmation,
  sendProviderSale,
  sendInternalSale,
} from "@/lib/email/send";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
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
      let esClienteNuevo = false;

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
          esClienteNuevo = true;

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

          // Email de "crea tu contraseña" -- ahora con nuestra propia
          // plantilla vía Resend, en vez del sistema por defecto de
          // Supabase (limitado en volumen de envíos).
          const resultado = await sendCreatePasswordEmail({ to: email, nombre: name });
          if (!resultado.success) {
            console.error("Error enviando el email de crear contrasena");
          }
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
        const [
          { data: service },
          { data: client },
          { data: provider },
          { data: clientUser },
          { data: providerUser },
        ] = await Promise.all([
          supabase.from("services").select("title").eq("id", service_id).single(),
          supabase.from("clients").select("billing_name, tax_id").eq("user_id", client_id).single(),
          supabase.from("providers").select("business_name, tax_id").eq("user_id", provider_id).single(),
          supabase.from("users").select("email").eq("id", client_id).single(),
          supabase.from("users").select("email").eq("id", provider_id).single(),
        ]);

        const totalCliente = (session.amount_total ?? 0) / 100;
        const totalComision = Number(platform_fee);

        // PENDIENTE DE CONFIRMAR con el asesor fiscal (martes) -- ajustado
        // según la factura real de Paygram que Bece revisó: el IPSI se
        // cobra UNA sola vez, en la factura al cliente final. La
        // autofactura al proveedor (art. 5 RD 1619/2012, confirmado con
        // el asesor) documenta la venta del proveedor a Coxiro por el
        // NETO que recibe (precio menos comisión de Coxiro) -- sin
        // impuesto en ese documento. Coxiro la emite en nombre del
        // proveedor, con su autorización aceptada en el registro.
        const TAX_RATE_CLIENTE = 0.5; // IPSI Melilla, único punto de cobro
        const TAX_RATE_PROVEEDOR = 0; // Sin impuesto en la autofactura
        const netoProveedor = totalCliente - totalComision;

        let cliInvoiceId: string | null = null;
        let cliInvoicePdf: Buffer | undefined;
        let provInvoicePdf: Buffer | undefined;

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

          // Autofactura: emisor real es el PROVEEDOR (Coxiro la emite
          // en su nombre), destinatario es COXIRO. El importe es el
          // neto que recibe el proveedor, no la comisión de Coxiro.
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
          console.error("Error generando las facturas:", invoiceError);
        }

        await supabase.from("content_access").insert({
          transaction_id: transaction.id,
          client_id,
          service_id,
        });

        // Los tres emails de la compra, en paralelo -- no se bloquea
        // la respuesta a Stripe por esto, y un fallo en uno no afecta
        // a los demás.
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
                importe: `${totalCliente.toFixed(2)} €`,
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
                importeTotal: `${totalCliente.toFixed(2)} €`,
                neto: `${netoProveedor.toFixed(2)} €`,
                invoicePdf: provInvoicePdf,
              })
            : Promise.resolve(),
          sendInternalSale({
            cliente: client?.billing_name ?? "Cliente",
            proveedor: provider?.business_name ?? "Profesional",
            servicio: service?.title ?? "Servicio",
            importe: `${totalCliente.toFixed(2)} €`,
            stripePaymentIntentId: session.payment_intent as string,
          }),
        ]);
      }

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
