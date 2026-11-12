import { createClient } from "@/lib/supabase/server";
import { createService, toggleServiceActive, toggleServicePublic, deleteService, restoreService } from "./actions";
import NewServiceForm from "./NewServiceForm";
import DeleteServiceButton from "./DeleteServiceButton";
import CompartirServicio from "./CompartirServicio";
import { calcularPrecios } from "@/lib/pricing";
import ServiceCard from "@/components/dashboard/ServiceCard";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  Card,
  EmptyState,
  Icon,
  PageHeader,
} from "@/components/dashboard/ui";

export default async function ServiciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: providerProfile } = await supabase
    .from("providers")
    .select("slug, commission_rate")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  // Servicios con ventas: no se pueden borrar del todo, se archivan.
  const { data: ventas } = await supabase
    .from("transactions")
    .select("service_id")
    .eq("provider_id", user?.id ?? "");
  const conVentas = new Set((ventas ?? []).map((v: any) => v.service_id));

  const archivados = (services ?? []).filter((s: any) => s.archived_at);
  const activosYPausados = (services ?? []).filter((s: any) => !s.archived_at);

  const chip = (on: boolean, tono: string) =>
    `inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 transition hover:brightness-95 ${
      on ? tono : "bg-cx-hielo text-cx-texto-2"
    }`;

  return (
    <div>
      <PageHeader
        title="Mis servicios"
        subtitle="Lo que ofreces a tus clientes, con su precio"
        action={
          providerProfile?.slug ? (
            <a href={`/${providerProfile.slug}`} target="_blank" className={BTN_SECONDARY}>
              <Icon name="external" className="w-3.5 h-3.5" />
              Ver mi perfil público
            </a>
          ) : undefined
        }
      />

      <details className="group mb-6" open={!activosYPausados.length}>
        <summary className={`${BTN_PRIMARY} cursor-pointer list-none [&::-webkit-details-marker]:hidden w-fit`}>
          <Icon name="plus" />
          Nuevo servicio
        </summary>
        <Card className="mt-4 p-5">
          <NewServiceForm
            createService={createService}
            comision={Number(providerProfile?.commission_rate ?? 10)}
          />
        </Card>
      </details>

      {activosYPausados.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {activosYPausados.map((s: any) => (
            <ServiceCard
              key={s.id}
              s={s}
              precios={(() => {
                const p = calcularPrecios(Number(s.price) || 0, Number(providerProfile?.commission_rate ?? 10));
                return {
                  proveedor: p.netoProveedorCents / 100,
                  cliente: p.totalCents / 100,
                  sufijo:
                    s.type === "membership"
                      ? s.billing_interval === "year"
                        ? "/ año"
                        : "/ mes"
                      : undefined,
                };
              })()}
              estado={
                <form action={toggleServiceActive}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="is_active" value={String(s.is_active)} />
                  <button
                    title={s.is_active ? "Pulsa para pausarlo" : "Pulsa para activarlo"}
                    className={chip(s.is_active, "bg-emerald-50 text-emerald-700")}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {s.is_active ? "Activo" : "Pausado"}
                  </button>
                </form>
              }
              visibilidad={
                <form action={toggleServicePublic}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="is_public" value={String(s.is_public)} />
                  <button
                    title={
                      s.is_public
                        ? "Aparece en el catálogo. Pulsa para hacerlo privado"
                        : "Solo con enlace directo. Pulsa para publicarlo"
                    }
                    className={chip(s.is_public, "bg-cx-celeste/15 text-cx-prof")}
                  >
                    <Icon name={s.is_public ? "globe" : "lock"} className="w-3 h-3" />
                    {s.is_public ? "Público" : "Privado"}
                  </button>
                </form>
              }
              acciones={
                <>
                  <a href={`/dashboard/servicios/${s.id}/contenido`} className={BTN_SECONDARY}>
                    <Icon name="folder" className="w-3.5 h-3.5" />
                    Contenido
                  </a>
                  <a href={`/dashboard/servicios/${s.id}/editar`} className={BTN_SECONDARY}>
                    <Icon name="pencil" className="w-3.5 h-3.5" />
                    Editar
                  </a>
                  <CompartirServicio id={s.id} title={s.title} />
                  <div className="ml-auto">
                    <DeleteServiceButton id={s.id} deleteService={deleteService} tieneVentas={conVentas.has(s.id)} />
                  </div>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="servicios"
            title="Todavía no has publicado ningún servicio"
            text="Crea el primero con el botón de arriba y comparte su enlace."
          />
        </Card>
      )}

      {archivados.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-cx-texto-2">
            Servicios archivados ({archivados.length})
          </summary>
          <p className="text-xs text-cx-texto-2 mt-2 mb-3">
            Ya no se venden ni aparecen en ningún sitio, pero quienes los compraron conservan su acceso.
          </p>
          <Card>
            <ul>
              {archivados.map((s: any) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-cx-borde last:border-0">
                  <span className="text-sm text-cx-noche truncate">{s.title}</span>
                  <form action={restoreService}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className={BTN_SECONDARY}>Restaurar</button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        </details>
      )}
    </div>
  );
}
