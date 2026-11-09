import { createClient } from "@/lib/supabase/server";
import { createService, toggleServiceActive, toggleServicePublic, deleteService } from "./actions";
import NewServiceForm from "./NewServiceForm";
import DeleteServiceButton from "./DeleteServiceButton";
import CopyLinkButton from "./CopyLinkButton";
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

      <details className="group mb-6" open={!services?.length}>
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

      {services?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              s={s}
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
                  <CopyLinkButton id={s.id} />
                  <div className="ml-auto">
                    <DeleteServiceButton id={s.id} deleteService={deleteService} />
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
    </div>
  );
}
