import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { fechaMadrid } from "@/lib/admin/contabilidad";
import { PageHeader, Card, Badge, EmptyState, BTN_SECONDARY, fmtEur } from "@/components/dashboard/ui";
import { reembolsarVenta } from "./actions";

const ERRORES: Record<string, string> = {
  datos: "Datos no válidos.",
  motivo: "Escribe el motivo del reembolso.",
  confirmar: "Marca la casilla de confirmación.",
  noexiste: "No se ha encontrado la venta.",
  estado: "Esa venta no se puede reembolsar (ya está reembolsada o no está pagada).",
  sinpago: "Esa venta no tiene un pago de Stripe asociado.",
  stripe: "Stripe no ha podido hacer el reembolso.",
};

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; detalle?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const admin = createAdminClient();

  const { data: txs } = await admin
    .from("transactions")
    .select("id, service_id, client_id, provider_id, amount_total, platform_fee, provider_net, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const lista = txs ?? [];
  const ids = (k: "service_id" | "client_id" | "provider_id") => [...new Set(lista.map((t: any) => t[k]).filter(Boolean))];

  const [{ data: servicios }, { data: clientes }, { data: proveedores }, { data: reembolsos }] = await Promise.all([
    admin.from("services").select("id, title, type").in("id", ids("service_id")),
    admin.from("users").select("id, email, full_name").in("id", ids("client_id")),
    admin.from("providers").select("user_id, business_name").in("user_id", ids("provider_id")),
    admin.from("admin_refunds").select("transaction_id, reason, created_at"),
  ]);

  const serv = new Map((servicios ?? []).map((s: any) => [s.id, s]));
  const cli = new Map((clientes ?? []).map((c: any) => [c.id, c]));
  const prov = new Map((proveedores ?? []).map((p: any) => [p.user_id, p]));
  const reem = new Map((reembolsos ?? []).map((r: any) => [r.transaction_id, r]));

  const tonoEstado = (s: string) => (s === "paid" ? "verde" : s === "refunded" ? "ambar" : "gris");
  const etiquetaEstado = (s: string) => (s === "paid" ? "Pagada" : s === "refunded" ? "Reembolsada" : s);

  return (
    <>
      <PageHeader
        title="Ventas y reembolsos"
        subtitle="Solo el administrador puede reembolsar. Los clientes y profesionales no tienen este botón."
      />

      {sp.ok && (
        <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Reembolso hecho. El acceso del cliente a ese contenido ya está cortado.
        </p>
      )}
      {sp.error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {ERRORES[sp.error] ?? "No se ha podido completar la acción."}
          {sp.detalle ? ` (${sp.detalle})` : ""}
        </p>
      )}

      <Card className="mb-4 p-4 text-xs text-cx-texto-2 space-y-1">
        <p>
          <strong className="text-cx-noche">Qué pasa al reembolsar:</strong> el cliente recibe el importe
          completo, se recupera del profesional su parte (si ya la cobró en su banco puede quedar saldo
          negativo en su cuenta de Stripe) y Coxiro devuelve su comisión. Stripe no devuelve su propia
          comisión de cobro: la asume Coxiro.
        </p>
        <p>
          <strong className="text-cx-noche">Pendiente fuera de aquí:</strong> la factura rectificativa
          (consúltalo con el asesor) y, si es una membresía, cancelar la suscripción en Stripe.
        </p>
      </Card>

      <Card>
        {lista.length === 0 ? (
          <EmptyState icon="cobros" title="Aún no hay ventas" />
        ) : (
          <ul>
            {lista.map((t: any) => {
              const s = serv.get(t.service_id) as any;
              const c = cli.get(t.client_id) as any;
              const p = prov.get(t.provider_id) as any;
              const r = reem.get(t.id) as any;
              return (
                <li key={t.id} className="px-4 sm:px-5 py-3 border-b border-cx-borde last:border-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-cx-noche truncate">{s?.title ?? "Servicio"}</p>
                      <p className="text-xs text-cx-texto-2 truncate">
                        {fechaMadrid(t.created_at)} · {c?.email ?? "cliente"} · {p?.business_name ?? "profesional"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={tonoEstado(t.status)}>{etiquetaEstado(t.status)}</Badge>
                      <span className="text-sm font-semibold text-cx-noche whitespace-nowrap">{fmtEur(Number(t.amount_total))}</span>
                    </div>
                  </div>

                  {r && (
                    <p className="mt-1 text-xs text-cx-texto-2">Motivo del reembolso: {r.reason}</p>
                  )}

                  {t.status === "paid" && (
                    <details className="mt-2">
                      <summary className={`${BTN_SECONDARY} cursor-pointer list-none inline-flex`}>Reembolsar</summary>
                      <form action={reembolsarVenta} className="mt-3 rounded-xl bg-cx-hielo/60 border border-cx-borde p-3 flex flex-col gap-2">
                        <input type="hidden" name="transaction_id" value={t.id} />
                        <label className="text-xs text-cx-texto-2">
                          Motivo (queda registrado)
                          <input name="motivo" required minLength={3} maxLength={500} className="mt-1 w-full rounded-lg border border-cx-borde bg-white px-3 py-2 text-sm" />
                        </label>
                        <label className="flex items-start gap-2 text-xs text-cx-noche">
                          <input type="checkbox" name="confirmar" className="mt-0.5" />
                          Confirmo que quiero reembolsar {fmtEur(Number(t.amount_total))} al cliente y cortar su acceso. No se puede deshacer.
                        </label>
                        <div>
                          <button className="rounded-full bg-red-600 text-white text-xs font-medium px-4 py-2 hover:bg-red-700">
                            Reembolsar ahora
                          </button>
                        </div>
                      </form>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
