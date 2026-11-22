import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader, Card, Badge, BTN_SECONDARY } from "@/components/dashboard/ui";
import { CATEGORIAS, type Categoria } from "@/lib/categorias";
import { aprobarServicio, reclasificarProfesional } from "./actions";

const INPUT = "rounded-lg border border-cx-borde bg-white px-3 py-1.5 text-sm";

export default async function AdminFichasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const admin = createAdminClient();

  const [{ data: pendientes }, { data: profesionales }, { data: servicios }, { data: cambios }] = await Promise.all([
    admin
      .from("services")
      .select("id, title, description, type, price, created_at, providers ( business_name, legal_name )")
      .eq("review_status", "pending")
      .order("created_at", { ascending: true }),
    admin
      .from("providers")
      .select("user_id, business_name, legal_name, fiscal_category")
      .order("business_name", { ascending: true }),
    admin.from("services").select("provider_id"),
    admin
      .from("category_changes")
      .select("id, provider_id, old_value, new_value, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const nServicios = new Map<string, number>();
  (servicios ?? []).forEach((s: any) => nServicios.set(s.provider_id, (nServicios.get(s.provider_id) ?? 0) + 1));
  const nombreProv = new Map<string, string>(
    (profesionales ?? []).map((p: any) => [p.user_id, p.business_name || p.legal_name || p.user_id])
  );

  return (
    <div>
      <PageHeader
        title="Fichas y categorías"
        subtitle="Aprueba los servicios de Mentoría y consultoría antes de que se vendan, y cambia la categoría de un profesional si hace falta."
      />

      {sp.ok && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4">Hecho.</p>}
      {sp.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {sp.error === "motivo" ? "Escribe el motivo del cambio (mínimo 5 caracteres)." : "Datos no válidos."}
        </p>
      )}

      <h2 className="font-display font-bold text-cx-noche mb-2">Servicios pendientes de revisión ({pendientes?.length ?? 0})</h2>
      <Card className="mb-8">
        {pendientes?.length ? (
          <ul className="divide-y divide-cx-borde">
            {pendientes.map((s: any) => (
              <li key={s.id} className="px-5 py-4 flex items-start gap-3 flex-wrap">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="font-medium text-cx-noche">{s.title}</p>
                  <p className="text-xs text-cx-texto-2">
                    {s.providers?.business_name || s.providers?.legal_name} · {s.type} · {Number(s.price).toFixed(2)} €
                  </p>
                  {s.description && <p className="text-sm text-cx-texto-2 mt-1 whitespace-pre-wrap">{s.description}</p>}
                  <p className="text-xs text-cx-texto-2 mt-1">
                    Comprueba que no tiene temario, programa ni módulos, ni consiste en dar clases. Si los tiene, reclasifica al profesional a Formación.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/servicio/${s.id}`} target="_blank" className={BTN_SECONDARY}>
                    Ver ficha
                  </a>
                  <form action={aprobarServicio}>
                    <input type="hidden" name="service_id" value={s.id} />
                    <button className="rounded-full bg-cx-celeste text-cx-noche text-xs font-semibold px-4 py-1.5 hover:brightness-105 transition">
                      Aprobar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-cx-texto-2 px-5 py-5">No hay servicios pendientes.</p>
        )}
      </Card>

      <h2 className="font-display font-bold text-cx-noche mb-2">Profesionales y su categoría</h2>
      <Card className="mb-8">
        <ul className="divide-y divide-cx-borde">
          {(profesionales ?? []).map((p: any) => {
            const actual = (p.fiscal_category === "mentoria" ? "mentoria" : "formacion") as Categoria;
            const otra: Categoria = actual === "formacion" ? "mentoria" : "formacion";
            return (
              <li key={p.user_id} className="px-5 py-3 flex items-center gap-3 flex-wrap">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="text-sm font-medium text-cx-noche">{p.business_name || p.legal_name}</p>
                  <p className="text-xs text-cx-texto-2">{nServicios.get(p.user_id) ?? 0} servicios</p>
                </div>
                <Badge tone={actual === "mentoria" ? "celeste" : "gris"}>{CATEGORIAS[actual].nombre}</Badge>
                <form action={reclasificarProfesional} className="flex items-center gap-2 flex-wrap">
                  <input type="hidden" name="provider_id" value={p.user_id} />
                  <input type="hidden" name="categoria" value={otra} />
                  <input name="motivo" required minLength={5} maxLength={500} placeholder={`Motivo para pasar a ${CATEGORIAS[otra].corto}`} className={`${INPUT} w-64`} />
                  <button className={BTN_SECONDARY}>Pasar a {CATEGORIAS[otra].corto}</button>
                </form>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-cx-texto-2 px-5 pb-4">
          Antes de reclasificar, avisa al profesional por email: tiene 15 días para alegar (cláusula 8.4 de sus condiciones).
          Al reclasificar tendrá que aceptar las condiciones de la nueva categoría al entrar en su panel.
        </p>
      </Card>

      {(cambios?.length ?? 0) > 0 && (
        <>
          <h2 className="font-display font-bold text-cx-noche mb-2">Últimos cambios de categoría</h2>
          <Card>
            <ul className="divide-y divide-cx-borde">
              {cambios!.map((c: any) => (
                <li key={c.id} className="px-5 py-3 text-sm">
                  <span className="font-medium text-cx-noche">{nombreProv.get(c.provider_id) ?? c.provider_id}</span>:{" "}
                  {c.old_value} → {c.new_value}
                  <span className="block text-xs text-cx-texto-2">
                    {new Date(c.created_at).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })} · {c.reason}
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
