"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { aplicarReembolsoEnBD } from "@/lib/refunds";

// Reembolso TOTAL de una venta. Solo el administrador de Coxiro puede hacerlo:
// ni el cliente ni el profesional tienen botón ni ruta para esto.
//
// Cómo se recupera el dinero:
//  - Cobro normal (destination charge): se reembolsa al cliente desde el
//    balance de Coxiro y se revierte la transferencia al profesional
//    (reverse_transfer), así que Coxiro devuelve solo lo que se quedó.
//    NO se usa refund_application_fee: eso devolvería nuestra comisión al
//    profesional en vez de al cliente.
//  - Reparto a tres partes: el cobro está entero en Coxiro y las
//    transferencias al profesional y al tercero se hicieron aparte; se
//    reembolsa y se revierte cada transferencia.
// Stripe no devuelve su comisión de procesamiento: la asume Coxiro.
export async function reembolsarVenta(formData: FormData) {
  const admin = await requireAdmin();
  const transactionId = String(formData.get("transaction_id") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim().slice(0, 500);
  const confirmar = formData.get("confirmar") === "on";

  const volver = (q: string) => redirect(`/admin/ventas?${q}`);

  if (!/^[0-9a-f-]{36}$/i.test(transactionId)) return volver("error=datos");
  if (motivo.length < 3) return volver("error=motivo");
  if (!confirmar) return volver("error=confirmar");

  const supabase = createAdminClient();
  const { data: tx } = await supabase
    .from("transactions")
    .select("id, status, stripe_payment_intent_id, amount_total")
    .eq("id", transactionId)
    .single();

  if (!tx) return volver("error=noexiste");
  if (tx.status !== "paid") return volver("error=estado");
  if (!tx.stripe_payment_intent_id) return volver("error=sinpago");

  let stripeRefundId: string | null = null;
  let tresPartes = false;

  try {
    // ¿Es un reparto a tres partes? Sus transferencias llevan nuestro grupo.
    const transfers = await stripe.transfers.list({
      transfer_group: `tx_${tx.id}`,
      limit: 10,
    });
    tresPartes = transfers.data.length > 0;

    const refund = await stripe.refunds.create(
      {
        payment_intent: tx.stripe_payment_intent_id,
        ...(tresPartes ? {} : { reverse_transfer: true }),
        reason: "requested_by_customer",
        metadata: { transaction_id: tx.id, reembolsado_por: admin.email ?? "admin" },
      },
      // Evita reembolsar dos veces si se pulsa el botón dos veces.
      { idempotencyKey: `coxiro_refund_${tx.id}` }
    );
    stripeRefundId = refund.id;

    if (tresPartes) {
      for (const t of transfers.data) {
        if (t.reversed) continue;
        try {
          await stripe.transfers.createReversal(t.id, undefined, {
            idempotencyKey: `coxiro_reversal_${t.id}`,
          });
        } catch (err: any) {
          // El cliente ya está reembolsado: se deja constancia para revertir a mano.
          console.error("[reembolso] No se pudo revertir la transferencia", t.id, err?.message);
        }
      }
    }
  } catch (err: any) {
    console.error("[reembolso] Error de Stripe:", err?.message);
    return volver(`error=stripe&detalle=${encodeURIComponent(String(err?.message ?? "").slice(0, 160))}`);
  }

  await supabase.from("admin_refunds").insert({
    transaction_id: tx.id,
    stripe_refund_id: stripeRefundId,
    amount: tx.amount_total,
    reason: motivo,
    tres_partes: tresPartes,
    created_by: admin.email ?? "admin",
  });

  await aplicarReembolsoEnBD(tx.id);

  revalidatePath("/admin", "layout");
  return volver("ok=1");
}
