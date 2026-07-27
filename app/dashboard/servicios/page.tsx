import { createClient } from "@/lib/supabase/server";
import { createService, toggleServiceActive } from "./actions";

const TYPE_LABELS: Record<string, string> = {
  content: "Contenido",
  consult: "Consulta",
  course: "Curso",
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

      {/* Alta de nuevo servicio */}
      <form
        action={createService}
        className="rounded-lg bg-paper p-5 mb-8 grid gap-3 max-w-lg"
      >
        <div>
          <label className="text-xs text-stone block mb-1">Título</label>
          <input
            name="title"
            required
            placeholder="Ej. Consulta laboral inicial"
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-stone block mb-1">Descripción</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Qué incluye este servicio"
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-stone block mb-1">Precio (€)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="90.00"
              className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-stone block mb-1">Tipo</label>
            <select
              name="type"
              className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
            >
              <option value="consult">Consulta</option>
              <option value="content">Contenido</option>
              <option value="course">Curso</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_public" />
          Mostrar en el catálogo público de Coxiro
        </label>
        <button className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 mt-1 hover:bg-copper-dark transition">
          Publicar servicio
        </button>
      </form>

      {/* Listado de servicios ya creados */}
      <div className="rounded-lg bg-paper overflow-hidden">
        <div className="grid grid-cols-6 px-3.5 py-2.5 text-xs text-stone border-b border-stone/20">
          <span className="col-span-2">Servicio</span>
          <span>Tipo</span>
          <span>Precio</span>
          <span>Estado</span>
          <span>Contenido</span>
        </div>
        {services?.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-6 px-3.5 py-3 text-sm items-center border-b border-stone/20 last:border-0"
          >
            <span className="col-span-2">{s.title}</span>
            <span className="text-stone">{TYPE_LABELS[s.type] ?? s.type}</span>
            <span>{Number(s.price).toFixed(2)} €</span>
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
    </div>
  );
}
