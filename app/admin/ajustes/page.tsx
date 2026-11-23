import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader, Card, Badge, BTN_SECONDARY } from "@/components/dashboard/ui";
import { CATEGORIAS, ORDEN_CATEGORIAS, type Categoria } from "@/lib/categorias";
import { cargarAjustes, comisionEquivalente, proporcionProveedor } from "@/lib/ajustes";
import { guardarAjuste, pedirAceptacion } from "./actions";

const INPUT = "rounded-lg border border-cx-borde bg-white px-3 py-1.5 text-sm";
const eur = (n: number) => n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

const ERRORES: Record<string, string> = {
  datos: "Datos no válidos.",
  rango: "Los porcentajes deben estar entre 0 y 30.",
  motivo: "Escribe el motivo del cambio (mínimo 5 caracteres).",
  "sin-cambios": "No has cambiado ningún valor.",
  guardar: "No se pudo guardar. Inténtalo de nuevo.",
};

export default async function AjustesPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const admin = createAdminClient();
  const ajustes = await cargarAjustes(admin);

  const [{ data: profesionales }, { data: aceptaciones }, { data: historial }] = await Promise.all([
    admin
      .from("providers")
      .select("user_id, business_name, legal_name, fiscal_category, commission_rate, pending_new_conditions")
      .order("business_name", { ascending: true }),
    admin.from("provider_acceptances").select("user_id, document"),
    admin
      .from("category_settings_log")
      .select("id, category, antes, despues, motivo, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const aceptaron = new Set((aceptaciones ?? []).map((a: any) => `${a.user_id}|${a.document}`));

  return (
    <div>
      <PageHeader
        title="Ajustes de comisiones"
        subtitle="Porcentajes de cada categoría. Se aplican solo a ventas futuras de quien ya aceptó las condiciones de su categoría."
      />

      {sp.ok && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4">Hecho.</p>}
      {sp.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {ERRORES[sp.error] ?? "Algo ha fallado."}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {ORDEN_CATEGORIAS.map((k) => {
          const a = ajustes[k];
          const recibe = 1000 * proporcionProveedor(a);
          return (
            <Card key={k} className="p-5">
              <h2 className="font-display font-bold text-cx-noche">{CATEGORIAS[k].nombre}</h2>
              <p className="text-xs text-cx-texto-2 mb-3">
                Ejemplo con 1.000 € sin impuestos: el cliente paga 1.210 €, el profesional recibe {eur(recibe)}.
                Equivale a una comisión de {comisionEquivalente(a)} % en el cálculo interno.
              </p>
              <form action={guardarAjuste} className="grid gap-2 text-sm">
                <input type="hidden" name="categoria" value={k} />
                <label className="grid gap-1">
                  <span className="text-xs text-cx-texto-2">Tipo</span>
                  <select name="modo" defaultValue={a.modo} className={INPUT}>
                    <option value="gancho">Gancho: el profesional recibe el precio sin impuestos MÁS el %</option>
                    <option value="comision">Comisión: el profesional recibe el precio sin impuestos MENOS el %</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-cx-texto-2">Porcentaje</span>
                  <input name="porcentaje" type="number" step="0.01" min="0" max="30" defaultValue={a.porcentaje} required className={INPUT} />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-cx-texto-2">Impuesto de la venta</span>
                    <select name="impuesto_tipo" defaultValue={a.impuesto_tipo} className={INPUT}>
                      <option value="IPSI">IPSI</option>
                      <option value="IVA">IVA</option>
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-cx-texto-2">Tipo impositivo (%)</span>
                    <input name="impuesto_pct" type="number" step="0.01" min="0" max="30" defaultValue={a.impuesto_pct} required className={INPUT} />
                  </label>
                </div>
                <label className="grid gap-1">
                  <span className="text-xs text-cx-texto-2">Motivo del cambio</span>
                  <input name="motivo" required minLength={5} maxLength={500} placeholder="Ej.: acordado con el asesor" className={INPUT} />
                </label>
                <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-4 py-2 hover:brightness-105 transition mt-1">
                  Guardar ajuste
                </button>
              </form>
              <p className="text-[11px] text-cx-texto-2 mt-2">
                El tipo impositivo se guarda para la contabilidad y las facturas de la fase siguiente: hoy no cambia el cobro.
                Cambiar un porcentaje exige avisar antes a los profesionales (15 días) y actualizar la versión de las condiciones.
              </p>
            </Card>
          );
        })}
      </div>

      <h2 className="font-display font-bold text-cx-noche mb-2">Qué condiciones aplica cada profesional</h2>
      <Card className="mb-8">
        <ul className="divide-y divide-cx-borde">
          {(profesionales ?? []).map((p: any) => {
            const cat: Categoria = p.fiscal_category === "mentoria" ? "mentoria" : "formacion";
            const acepto = aceptaron.has(`${p.user_id}|${CATEGORIAS[cat].documento}`);
            return (
              <li key={p.user_id} className="px-5 py-3 flex items-center gap-3 flex-wrap">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="text-sm font-medium text-cx-noche">{p.business_name || p.legal_name}</p>
                  <p className="text-xs text-cx-texto-2">{CATEGORIAS[cat].nombre}</p>
                </div>
                {acepto ? (
                  <Badge tone="verde">Condiciones de categoría</Badge>
                ) : (
                  <Badge tone="ambar">Condiciones anteriores (base + {Number(p.commission_rate)} %)</Badge>
                )}
                {!acepto &&
                  (p.pending_new_conditions ? (
                    <Badge tone="celeste">Aceptación solicitada</Badge>
                  ) : (
                    <form action={pedirAceptacion}>
                      <input type="hidden" name="provider_id" value={p.user_id} />
                      <button className={BTN_SECONDARY}>Pedir que acepte las nuevas</button>
                    </form>
                  ))}
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-cx-texto-2 px-5 pb-4">
          «Pedir que acepte las nuevas» le obliga a aceptar las condiciones de su categoría la próxima vez que entre en
          su panel; hasta entonces sigue como estaba. Avísale antes por email con 15 días de antelación.
        </p>
      </Card>

      {(historial?.length ?? 0) > 0 && (
        <>
          <h2 className="font-display font-bold text-cx-noche mb-2">Últimos cambios de ajustes</h2>
          <Card>
            <ul className="divide-y divide-cx-borde">
              {historial!.map((h: any) => (
                <li key={h.id} className="px-5 py-3 text-sm">
                  <span className="font-medium text-cx-noche">{CATEGORIAS[h.category as Categoria]?.corto ?? h.category}</span>:{" "}
                  {h.antes?.modo} {h.antes?.porcentaje} % → {h.despues?.modo} {h.despues?.porcentaje} %
                  <span className="block text-xs text-cx-texto-2">
                    {new Date(h.created_at).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })} · {h.motivo}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
