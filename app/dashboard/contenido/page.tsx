import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  pdf: "PDF",
  audio: "Audio",
  link: "Enlace",
  document: "Documento",
};

export default async function MiContenidoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const { data: accessRows } = await admin
    .from("content_access")
    .select(
      `
      service_id,
      services ( title, provider_id, providers ( business_name ) )
    `
    )
    .eq("client_id", user?.id ?? "");

  const serviceIds = [...new Set(accessRows?.map((a) => a.service_id) ?? [])];

  const { data: allItems } = serviceIds.length
    ? await admin
        .from("content_items")
        .select("*")
        .in("service_id", serviceIds)
        .order("sort_order", { ascending: true })
    : { data: [] };

  const serviciosUnicos = new Map<string, any>();
  accessRows?.forEach((a) => {
    if (!serviciosUnicos.has(a.service_id)) {
      serviciosUnicos.set(a.service_id, a.services);
    }
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Mi contenido</h1>
        <p className="text-sm text-stone mt-0.5">
          Todo lo que has comprado, en un solo lugar
        </p>
      </div>

      <div className="grid gap-6">
        {[...serviciosUnicos.entries()].map(([serviceId, service]) => {
          const items = allItems?.filter((i) => i.service_id === serviceId) ?? [];
          return (
            <div key={serviceId} className="rounded-lg bg-paper p-5">
              <p className="font-medium mb-0.5">{service?.title}</p>
              <p className="text-xs text-stone mb-4">
                {service?.providers?.business_name ?? "Profesional en Coxiro"}
              </p>

              {items.length ? (
                <div className="grid gap-2">
                  {items.map((item) => (
                    
                      key={item.id}
                      href={`/api/access/${item.id}`}
                      target="_blank"
                      className="flex items-center justify-between rounded-lg bg-white border border-stone/20 px-4 py-3 hover:border-copper transition"
                    >
                      <span className="text-sm">{item.title}</span>
                      <span className="text-xs text-copper font-medium">
                        {TYPE_LABELS[item.content_type] ?? item.content_type} →
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
          );
        })}
        {!serviciosUnicos.size && (
          <p className="text-sm text-stone bg-paper rounded-lg p-4">
            Todavía no has comprado ningún servicio con contenido.
          </p>
        )}
      </div>
    </div>
  );
}