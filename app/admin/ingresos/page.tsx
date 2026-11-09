import { requireAdmin } from "@/lib/admin/auth";
import { cargarAnio, enTrimestre, leerPeriodo, hoyMadrid } from "@/lib/admin/contabilidad";
import { PageHeader, Card, EmptyState, Icon, BTN_SECONDARY, fmtEur } from "@/components/dashboard/ui";
import SelectorPeriodo from "@/components/dashboard/SelectorPeriodo";

export default async function IngresosPage({
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

  const fs = datos.facturas.filter((f) => enTrimestre(f.fecha, anio, trimestre));
  const liquidaciones = new Map(
    fs.filter((f) => f.type === "provider_settlement" && f.transaction_id).map((f) => [f.transaction_id!, f])
  );
  const ventas = fs.filter((f) => f.type === "client_invoice").sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      <PageHeader
        title="Libro de ingresos"
        subtitle="Cada venta con su factura al cliente y la liquidación al profesional."
        action={
          <a href={`/admin/exportar?tipo=ingresos&a=${anio}&t=${trimestre}`} className={BTN_SECONDARY}>
            <Icon name="download" /> Descargar CSV
          </a>
        }
      />
      <SelectorPeriodo base="/admin/ingresos" anio={anio} trimestre={trimestre} anios={anios} />

      <Card>
        {ventas.length === 0 ? (
          <EmptyState icon="cobros" title="Sin ventas en este periodo" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-cx-texto-2 border-b border-cx-borde">
                  <th className="p-3 font-medium">Fecha</th>
                  <th className="p-3 font-medium">Factura</th>
                  <th className="p-3 font-medium">Cliente</th>
                  <th className="p-3 font-medium text-right">Base</th>
                  <th className="p-3 font-medium text-right">IPSI</th>
                  <th className="p-3 font-medium text-right">Total</th>
                  <th className="p-3 font-medium text-right">Profesional</th>
                  <th className="p-3 font-medium text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => {
                  const liq = v.transaction_id ? liquidaciones.get(v.transaction_id) : undefined;
                  return (
                    <tr key={v.id} className="border-b border-cx-borde last:border-0">
                      <td className="p-3 whitespace-nowrap">{v.fecha}</td>
                      <td className="p-3 whitespace-nowrap">{v.invoice_number}</td>
                      <td className="p-3">{v.recipient_name ?? "—"}</td>
                      <td className="p-3 text-right whitespace-nowrap">{fmtEur(v.tax_base)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{fmtEur(v.tax_amount)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{fmtEur(v.total)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{liq ? fmtEur(liq.tax_base) : "—"}</td>
                      <td className="p-3 text-right whitespace-nowrap font-medium">
                        {liq ? fmtEur(v.tax_base - liq.tax_base) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
