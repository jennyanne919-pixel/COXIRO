import { createAdminClient } from "@/lib/supabase/admin";

const COMISION_PARTNER = 0.01; // 1%
const MESES_VALIDEZ = 12;

export type ReferidoDetalle = {
  id: string;
  nombre: string;
  desde: string;
  hasta: string;
  facturacion: number;
  ganancia: number;
  vigente: boolean;
};

export async function calcularGananciasPartner(partnerId: string) {
  const admin = createAdminClient();

  const { data: referidos } = await admin
    .from("providers")
    .select("user_id, business_name, created_at")
    .eq("referred_by", partnerId);

  const filas: ReferidoDetalle[] = await Promise.all(
    (referidos ?? []).map(async (r) => {
      const cutoff = new Date(r.created_at);
      cutoff.setMonth(cutoff.getMonth() + MESES_VALIDEZ);

      const { data: txs } = await admin
        .from("transactions")
        .select("amount_total")
        .eq("provider_id", r.user_id)
        .eq("status", "paid")
        .lte("created_at", cutoff.toISOString());

      const facturacion =
        txs?.reduce((sum, t) => sum + Number(t.amount_total), 0) ?? 0;

      return {
        id: r.user_id,
        nombre: r.business_name,
        desde: new Date(r.created_at).toLocaleDateString("es-ES"),
        hasta: cutoff.toLocaleDateString("es-ES"),
        facturacion,
        ganancia: facturacion * COMISION_PARTNER,
        vigente: new Date() <= cutoff,
      };
    })
  );

  const totalGanado = filas.reduce((sum, f) => sum + f.ganancia, 0);

  const { data: pagos } = await admin
    .from("referral_payouts")
    .select("amount")
    .eq("partner_id", partnerId);

  const totalPagado = pagos?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const pendiente = Math.max(0, totalGanado - totalPagado);

  return { filas, totalGanado, totalPagado, pendiente };
}
