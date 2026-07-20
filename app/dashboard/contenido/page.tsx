import { createClient } from "@/lib/supabase/server";

const TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  pdf: "PDF",
  link: "Enlace",
  document: "Documento",
};

export default async function MiContenidoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Servicios a los que este cliente tiene acceso (ya pagados)
  const { data: access } = await supabase
    .from("content_access")
    .select(
      `
      service_id,
      services ( title, providers ( business_name ) )
    `
    )
    .eq("client_id", user?.id ?? "");

  const serviceIds = access?.map((a) => a.service_id) ?? [];

  const { data: items } = serviceIds.length
    ? await supabase
        .from("content_items")
        .select("*")
        .in("service_id", serviceIds)
        .order("sort_order", { ascending: true })
    : { data: [] };

  // Agrupamos el contenido por servicio para mostrarlo organizado
  const grouped = access?.map((a) => ({
    serviceId: a.service_id,
    title: (a.services as any)?.title ?? "Servicio",
    provider: (a.services as any)?.providers?.business_name ?? "Profesional",
    items: items?.filter((i) => i.service_id === a.service_id) ?? [],
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Mi contenido</h1>
        <p className="text-sm text-stone mt-0.5">
          Todo lo que has comprado, en un solo lugar
        </p>
      </div>

      {!grouped?.length && (
        <p className="text-sm text-stone">
          Todavía no has comprado ningún servicio con contenido.
        </p>
      )}

      <div className="grid gap-4">
        {grouped?.map((group) => (
          <div key={group.serviceId} className="rounded-lg bg-paper p-5">
            <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-1">
              {group.provider}
            </p>
            <h2 className="text-base font-medium mb-3">{group.title}</h2>

            {group.items.length ? (
              <div className="grid gap-2">
                {group.items.map((item) => (
                  <a
                    key={item.id}
                    href={`/api/access/${item.id}`}
                    className="flex items-center justify-between rounded-lg bg-white border border-stone/20 px-4 py-3 text-sm hover:border-copper transition"
                  >
                    <span>{item.title}</span>
                    <span className="text-xs text-stone">
                      {TYPE_LABELS[item.content_type] ?? item.content_type}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone">
                El profesional todavía no ha subido contenido para esto.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
