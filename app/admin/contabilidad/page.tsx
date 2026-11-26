import { requireAdmin } from "@/lib/admin/auth";
import { cargarAnio, enTrimestre, leerPeriodo, hoyMadrid } from "@/lib/admin/contabilidad";
import { PageHeader, Card, EmptyState, fmtEur } from "@/components/dashboard/ui";
import SelectorPeriodo from "@/components/dashboard/SelectorPeriodo";
import { CATEGORIAS, esCategoria } from "@/lib/categorias";

const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100;

export default async function ContabilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; t?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { anio, trimestre } = leerPeriodo(sp);
  const datos = await cargarAnio(anio);
  const anioHoy = Number(hoyMadrid().slice(0, 4));
  const anios = [...new Set([2026, anioHoy])].sort();

  const ventas = datos.ventasContables
    .filter((v) => enTrimestre(v.fecha, anio, trimestre))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const t = {
    cobrado: sum(ventas.map((v) => v.total)),
    profesionales: sum(ventas.map((v) => v.neto_proveedor)),
    impVenta: sum(ventas.map((v) => v.impuesto_cliente)),
    impCompra: sum(ventas.filter((v) => !v.compra_deducible).map((v) => v.cuota_compra)),
    stripe: sum(ventas.map((v) => v.stripe_fee)),
    margen: sum(ventas.map((v) => v.margen)),
    fueraUE: sum(ventas.filter((v) => v.zona === "fuera").map((v) => v.total)),
  };
  const nFueraUE = ventas.filter((v) => v.zona === "fuera").length;
  const hayEstimado = ventas.some((v) => !v.stripe_real);
  const hayProvisional = ventas.some((v) => v.provisional);

  const Resumen = ({ label, value, hint }: { label: string; value: number; hint?: string }) => (
    <Card className="p-4">
      <p className="text-xs text-cx-texto-2">{label}</p>
      <p className="font-display font-bold text-xl text-cx-noche mt-1">{fmtEur(value)}</p>
      {hint && <p className="text-[11px] text-cx-texto-2 mt-0.5">{hint}</p>}
    </Card>
  );

  return (
    <>
      <PageHeader
        title="Contabilidad por venta"
        subtitle="Qué pasa con cada euro: lo cobrado, lo pagado al profesional, el impuesto de las dos operaciones, Stripe y tu margen."
      />
      <SelectorPeriodo base="/admin/contabilidad" anio={anio} trimestre={trimestre} anios={anios} />

      {hayProvisional && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Cálculo provisional hasta que el asesor confirme el tipo del IPSI, su deducibilidad y el tratamiento del IVA en
          Formación.
        </p>
      )}

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 mb-6">
        <Resumen label="Cobrado a clientes" value={t.cobrado} />
        <Resumen label="Pagado a profesionales" value={t.profesionales} />
        <Resumen label="Impuesto de las ventas (2.ª operación)" value={t.impVenta} hint="Lo que declaras por lo cobrado" />
        <Resumen label="Impuesto de las compras (1.ª operación)" value={t.impCompra} hint="Sobre lo pagado al profesional; coste no recuperable" />
        <Resumen label="Stripe" value={t.stripe} hint={hayEstimado ? "Incluye partidas estimadas" : "Coste real"} />
        <Resumen label="Margen de Coxiro" value={t.margen} hint="Antes de gastos fijos e IRPF" />
        <Resumen label="Ventas a clientes fuera de la UE" value={t.fueraUE} hint={`${nFueraUE} ventas no sujetas: sin impuesto de venta`} />
      </div>

      <Card>
        {ventas.length === 0 ? (
          <EmptyState icon="cobros" title="Sin ventas con condiciones de categoría en este periodo" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-cx-texto-2 border-b border-cx-borde">
                  <th className="p-3 font-medium">Fecha</th>
                  <th className="p-3 font-medium">Categoría</th>
                  <th className="p-3 font-medium">Zona</th>
                  <th className="p-3 font-medium text-right">Cobrado</th>
                  <th className="p-3 font-medium text-right">Profesional</th>
                  <th className="p-3 font-medium text-right">Imp. venta</th>
                  <th className="p-3 font-medium text-right">Imp. compra</th>
                  <th className="p-3 font-medium text-right">Stripe</th>
                  <th className="p-3 font-medium text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.transaction_id} className="border-b border-cx-borde last:border-0">
                    <td className="p-3 whitespace-nowrap">{v.fecha}</td>
                    <td className="p-3 whitespace-nowrap">
                      {esCategoria(v.category) ? CATEGORIAS[v.category].corto : v.category}
                      <span className="block text-[11px] text-cx-texto-2">
                        {v.impuesto_tipo} {v.impuesto_pct} %
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {v.zona === "fuera" ? "Fuera de la UE" : v.zona === "ue" ? "UE" : "—"}
                      {v.zona === "fuera" && <span className="block text-[11px] text-cx-texto-2">no sujeta</span>}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">{fmtEur(v.total)}</td>
                    <td className="p-3 text-right whitespace-nowrap">{fmtEur(v.neto_proveedor)}</td>
                    <td className="p-3 text-right whitespace-nowrap">{fmtEur(v.impuesto_cliente)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {fmtEur(v.cuota_compra)}
                      {v.compra_deducible && <span className="block text-[11px] text-cx-texto-2">recuperable</span>}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {fmtEur(v.stripe_fee)}
                      {!v.stripe_real && <span className="block text-[11px] text-cx-texto-2">estimado</span>}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap font-medium">{fmtEur(v.margen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
