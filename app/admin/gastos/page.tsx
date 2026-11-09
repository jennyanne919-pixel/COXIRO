import { requireAdmin } from "@/lib/admin/auth";
import { cargarAnio, enTrimestre, leerPeriodo, hoyMadrid, CATEGORIAS } from "@/lib/admin/contabilidad";
import { PageHeader, Card, EmptyState, Icon, Badge, BTN_PRIMARY, BTN_SECONDARY, BTN_ICON, fmtEur } from "@/components/dashboard/ui";
import SelectorPeriodo from "@/components/dashboard/SelectorPeriodo";
import { crearGasto, borrarGasto } from "./actions";

const input = "w-full rounded-lg border border-cx-borde bg-white px-3 py-2 text-sm";

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; t?: string; ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { anio, trimestre } = leerPeriodo(sp);
  const datos = await cargarAnio(anio);
  const hoy = hoyMadrid();
  const anios = [...new Set([2026, Number(hoy.slice(0, 4))])].sort();

  const gastos = datos.gastos
    .filter((g) => enTrimestre(g.fecha, anio, trimestre))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const total = gastos.filter((g) => g.deducible).reduce((s, g) => s + g.total, 0);

  return (
    <>
      <PageHeader
        title="Gastos"
        subtitle="Todo lo que paga Coxiro para funcionar: comisiones, hosting, cuota de autónomos, asesoría…"
        action={
          <a href={`/admin/exportar?tipo=gastos&a=${anio}&t=${trimestre}`} className={BTN_SECONDARY}>
            <Icon name="download" /> Descargar CSV
          </a>
        }
      />

      {sp.ok && (
        <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Gasto guardado.
        </p>
      )}
      {sp.error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {sp.error === "1" ? "Revisa los campos: faltan datos o algún importe no es válido." : "No se ha podido guardar el gasto."}
        </p>
      )}

      <details className="mb-6 rounded-2xl bg-white border border-cx-borde group" open={!!sp.error}>
        <summary className="cursor-pointer list-none flex items-center gap-2 px-5 py-4 text-sm font-semibold text-cx-noche">
          <Icon name="plus" /> Añadir un gasto
        </summary>
        <form action={crearGasto} className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-cx-texto-2">
            Fecha
            <input type="date" name="fecha" required defaultValue={hoy} className={`${input} mt-1`} />
          </label>
          <label className="text-xs text-cx-texto-2">
            Categoría
            <select name="categoria" required className={`${input} mt-1`}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-cx-texto-2 sm:col-span-2">
            Concepto
            <input name="concepto" required maxLength={200} placeholder="Ej.: Plan Pro de Vercel, noviembre" className={`${input} mt-1`} />
          </label>
          <label className="text-xs text-cx-texto-2 sm:col-span-2">
            Proveedor (opcional)
            <input name="proveedor" maxLength={120} placeholder="Ej.: Vercel Inc." className={`${input} mt-1`} />
          </label>
          <label className="text-xs text-cx-texto-2">
            Base (€)
            <input name="base" required inputMode="decimal" placeholder="0,00" className={`${input} mt-1`} />
          </label>
          <label className="text-xs text-cx-texto-2">
            Impuesto (€, si lo hay)
            <input name="cuota" inputMode="decimal" placeholder="0,00" className={`${input} mt-1`} />
          </label>
          <label className="text-xs text-cx-texto-2 sm:col-span-2">
            Notas (opcional)
            <input name="notas" maxLength={500} className={`${input} mt-1`} />
          </label>
          <label className="flex items-center gap-2 text-sm text-cx-noche sm:col-span-2">
            <input type="checkbox" name="deducible" defaultChecked /> Es un gasto deducible
          </label>
          <div className="sm:col-span-2">
            <button className={BTN_PRIMARY}>Guardar gasto</button>
          </div>
        </form>
      </details>

      <SelectorPeriodo base="/admin/gastos" anio={anio} trimestre={trimestre} anios={anios} />

      <Card>
        {gastos.length === 0 ? (
          <EmptyState icon="bag" title="Sin gastos en este periodo" text="Añade el primero con el botón de arriba." />
        ) : (
          <>
            <ul>
              {gastos.map((g) => (
                <li key={g.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-cx-borde last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-cx-noche truncate">{g.concepto}</p>
                    <p className="text-xs text-cx-texto-2 truncate">
                      {g.fecha} · {g.categoria}
                      {g.proveedor ? ` · ${g.proveedor}` : ""}
                    </p>
                  </div>
                  {!g.deducible && <Badge tone="ambar">No deducible</Badge>}
                  <span className="text-sm font-semibold text-cx-noche whitespace-nowrap">{fmtEur(g.total)}</span>
                  <form action={borrarGasto}>
                    <input type="hidden" name="id" value={g.id} />
                    <button className={BTN_ICON} title="Eliminar gasto" aria-label="Eliminar gasto">
                      <Icon name="trash" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 text-sm text-right text-cx-texto-2 border-t border-cx-borde">
              Total deducible: <strong className="text-cx-noche">{fmtEur(total)}</strong>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
