import { createClient } from "@/lib/supabase/server";
import { createService, toggleServiceActive, toggleServicePublic } from "./actions";
import NewServiceForm from "./NewServiceForm";

const TYPE_LABELS: Record<string, string> = {
  content: "Contenido",
  consult: "Consulta",
  course: "Curso",
<<<<<<< HEAD
  custom: "Servicios IA",
  membership: "Membresía / Suscripción",
=======
  custom: "Servicios a medida",
>>>>>>> 528f0a2c63b3c1b7d8ad12c8a1893c1bf0763791
};

export default async function ServiciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: providerProfile } = await supabase
    .from("providers")
    .select("slug")
    .eq("user_id", user?.id ?? "")
    .single();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Mis servicios</h1>
        <p className="text-sm text-stone mt-0.5">
          Lo que ofreces a tus clientes, con su precio
        </p>
        {providerProfile?.slug && (
          <a
            href={`/${providerProfile.slug}`}
            target="_blank"
            className="inline-block text-sm text-copper hover:underline mt-2"
          >
            Ver mi perfil público →
          </a>
        )}
      </div>

      <NewServiceForm createService={createService} />


      <div className="rounded-lg bg-paper overflow-hidden hidden md:block">
        <div className="grid grid-cols-7 px-3.5 py-2.5 text-xs text-stone border-b border-stone/20">
          <span className="col-span-2">Servicio</span>
          <span>Tipo</span>
          <span>Precio</span>
          <span>Estado</span>
          <span>Catálogo</span>
          <span>Contenido</span>
        </div>
        {services?.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-7 px-3.5 py-3 text-sm items-center border-b border-stone/20 last:border-0"
          >
            <span className="col-span-2">{s.title}</span>
            <span className="text-stone">{TYPE_LABELS[s.type] ?? s.type}</span>
            <span>{s.requires_inquiry ? "A medida" : `${Number(s.price).toFixed(2)} €`}</span>
            <form action={toggleServiceActive}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="is_active" value={String(s.is_active)} />
              <button
                className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                  s.is_active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-stone/10 text-stone"
                }`}
              >
                {s.is_active ? "Activo" : "Pausado"}
              </button>
            </form>
            <form action={toggleServicePublic}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="is_public" value={String(s.is_public)} />
              <button
                className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                  s.is_public
                    ? "bg-copper/10 text-copper"
                    : "bg-stone/10 text-stone"
                }`}
              >
                {s.is_public ? "Público" : "Privado"}
              </button>
            </form>
            <a
              href={`/dashboard/servicios/${s.id}/contenido`}
              className="text-xs text-copper hover:underline"
            >
              Gestionar →
            </a>
          </div>
        ))}
        {!services?.length && (
          <p className="text-sm text-stone p-4">
            Todavía no has publicado ningún servicio. Crea el primero arriba.
          </p>
        )}
      </div>

      <div className="grid gap-3 md:hidden">
        {services?.map((s) => (
          <div key={s.id} className="rounded-lg bg-paper p-4 text-sm">
            <div className="flex items-start justify-between mb-2 gap-2">
              <p className="font-medium">{s.title}</p>
              <p className="font-display font-semibold whitespace-nowrap">
                {s.requires_inquiry ? "A medida" : `${Number(s.price).toFixed(2)} €`}
              </p>
            </div>
            <p className="text-stone text-xs mb-3">{TYPE_LABELS[s.type] ?? s.type}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <form action={toggleServiceActive}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="is_active" value={String(s.is_active)} />
                <button
                  className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                    s.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-stone/10 text-stone"
                  }`}
                >
                  {s.is_active ? "Activo" : "Pausado"}
                </button>
              </form>
              <form action={toggleServicePublic}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="is_public" value={String(s.is_public)} />
                <button
                  className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                    s.is_public
                      ? "bg-copper/10 text-copper"
                      : "bg-stone/10 text-stone"
                  }`}
                >
                  {s.is_public ? "Público" : "Privado"}
                </button>
              </form>
              <a
                href={`/dashboard/servicios/${s.id}/contenido`}
                className="text-xs text-copper font-medium ml-auto"
              >
                Gestionar →
              </a>
            </div>
          </div>
        ))}
        {!services?.length && (
          <p className="text-sm text-stone bg-paper rounded-lg p-4">
            Todavía no has publicado ningún servicio. Crea el primero arriba.
          </p>
        )}
      </div>
    </div>
  );
}
