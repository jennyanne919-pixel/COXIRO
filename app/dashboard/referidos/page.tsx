import { PageHeader } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/server";
import { calcularGananciasPartner } from "@/lib/referrals";

export default async function ReferidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("providers")
    .select("referral_code")
    .eq("user_id", user?.id ?? "")
    .single();

  const { filas, totalGanado, totalPagado, pendiente } =
    await calcularGananciasPartner(user?.id ?? "");

  const referralUrl = me?.referral_code
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/registro?ref=${me.referral_code}`
    : null;

  return (
    <div>
      <PageHeader title="Mis partners" subtitle="Gana un 1% de la facturación de cada profesional que traigas a Coxiro, durante sus primeros 12 meses. Se paga automáticamente el día 1 de cada mes a tu cuenta de Stripe." />

      <div className="rounded-2xl bg-white border border-cx-borde p-5 mb-8">
        <p className="text-xs text-cx-texto-2 mb-2">Tu enlace para compartir</p>
        {referralUrl ? (
          <code className="text-sm bg-white border border-cx-borde rounded-lg px-3 py-2 break-all inline-block">
            {referralUrl}
          </code>
        ) : (
          <p className="text-sm text-cx-texto-2">
            No se pudo generar tu enlace todavía.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl bg-white border border-cx-borde p-4">
          <p className="text-sm text-cx-texto-2 mb-1">Ganado en total</p>
          <p className="text-2xl font-medium">{totalGanado.toFixed(2)} €</p>
        </div>
        <div className="rounded-2xl bg-white border border-cx-borde p-4">
          <p className="text-sm text-cx-texto-2 mb-1">Ya pagado</p>
          <p className="text-2xl font-medium">{totalPagado.toFixed(2)} €</p>
        </div>
        <div className="rounded-2xl bg-cx-celeste/10 border border-cx-celeste/30 p-4">
          <p className="text-sm text-cx-texto-2 mb-1">Pendiente (próximo pago día 1)</p>
          <p className="text-2xl font-medium text-cx-prof">{pendiente.toFixed(2)} €</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-cx-borde overflow-hidden hidden md:block">
        <div className="grid grid-cols-5 px-3.5 py-2.5 text-xs text-cx-texto-2 border-b border-cx-borde">
          <span>Profesional</span>
          <span>Referido desde</span>
          <span>Válido hasta</span>
          <span>Facturación</span>
          <span>Tu 1%</span>
        </div>
        {filas.map((f) => (
          <div
            key={f.id}
            className="grid grid-cols-5 px-3.5 py-3 text-sm items-center border-b border-cx-borde last:border-0"
          >
            <span>{f.nombre}</span>
            <span className="text-cx-texto-2">{f.desde}</span>
            <span className={f.vigente ? "text-cx-texto-2" : "text-cx-texto-2/70"}>
              {f.hasta} {!f.vigente && "(vencido)"}
            </span>
            <span>{f.facturacion.toFixed(2)} €</span>
            <span className="font-medium">{f.ganancia.toFixed(2)} €</span>
          </div>
        ))}
        {!filas.length && (
          <p className="text-sm text-cx-texto-2 p-4">
            Todavía no has traído a ningún profesional. Comparte tu enlace
            para empezar a ganar.
          </p>
        )}
      </div>

      <div className="grid gap-3 md:hidden">
        {filas.map((f) => (
          <div key={f.id} className="rounded-2xl bg-white border border-cx-borde p-4 text-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="font-medium">{f.nombre}</p>
              <p className="font-display font-semibold">{f.ganancia.toFixed(2)} €</p>
            </div>
            <p className="text-cx-texto-2 text-xs">
              Facturación: {f.facturacion.toFixed(2)} € · Válido hasta {f.hasta}
              {!f.vigente && " (vencido)"}
            </p>
          </div>
        ))}
        {!filas.length && (
          <p className="text-sm text-cx-texto-2 bg-white border border-cx-borde rounded-2xl p-4">
            Todavía no has traído a ningún profesional. Comparte tu enlace
            para empezar a ganar.
          </p>
        )}
      </div>
    </div>
  );
}
