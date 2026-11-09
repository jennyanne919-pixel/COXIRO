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

  // Cliente admin: necesitamos leer content_items de servicios que
  // no son "nuestros" en el sentido de RLS estándar -- la
  // autorización real ya se comprobó al conceder content_access, y
  // el archivo en sí solo se sirve a través de /api/access, nunca
  // aquí directamente.
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

  const { data: progresoRows } = allItems?.length
    ? await admin
        .from("content_progress")
        .select("content_item_id, position_seconds")
        .eq("client_id", user?.id ?? "")
        .in("content_item_id", allItems.map((i) => i.id))
    : { data: [] };
  const progreso = new Map<string, number>(
    (progresoRows ?? []).map((r) => [r.content_item_id, Number(r.position_seconds)])
  );

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
        <p className="text-sm text-cx-texto-2 mt-0.5">
          Todo lo que has comprado, en un solo lugar
        </p>
      </div>

      <div className="grid gap-6">
        {[...serviciosUnicos.entries()].map(([serviceId, service]) => {
          const items = allItems?.filter((i) => i.service_id === serviceId) ?? [];
          return (
            <div key={serviceId} className="rounded-lg bg-cx-hielo p-5">
              <p className="font-medium mb-0.5">{service?.title}</p>
              <p className="text-xs text-cx-texto-2 mb-4">
                {service?.providers?.business_name ?? "Profesional en Coxiro"}
              </p>

              {items.length ? (
                <div className="grid gap-2">
                  {items.map((item) => {
                    const esReproducible = ["video", "audio"].includes(item.content_type);
                    const href = esReproducible
                      ? `/contenido/${item.id}`
                      : `/api/access/${item.id}`;
                    const pos = progreso.get(item.id) ?? 0;
                    const dur = Number(item.duration_seconds ?? 0);
                    const visto = esReproducible && dur > 0 && pos >= dur - 10;
                    const pct = dur > 0 ? Math.min(100, Math.round((pos / dur) * 100)) : 0;
                    return (
                      <a
                        key={item.id}
                        href={href}
                        target={esReproducible ? "_self" : "_blank"}
                        className="flex items-center justify-between rounded-lg bg-white border border-cx-borde px-4 py-3 hover:border-cx-celeste transition"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="text-sm block">{item.title}</span>
                          {esReproducible && pos > 5 && (
                            <span className="flex items-center gap-2 mt-1.5">
                              {dur > 0 && (
                                <span className="h-1 w-24 rounded-full bg-cx-borde overflow-hidden">
                                  <span
                                    className="block h-full bg-cx-celeste"
                                    style={{ width: `${visto ? 100 : pct}%` }}
                                  />
                                </span>
                              )}
                              <span className="text-[11px] text-cx-texto-2">
                                {visto ? "Visto" : dur > 0 ? `${pct} % · continuar` : "Continuar"}
                              </span>
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-cx-prof font-medium shrink-0 ml-3">
                          {TYPE_LABELS[item.content_type] ?? item.content_type} →
                        </span>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-cx-texto-2">
                  El profesional todavía no ha subido contenido para esto.
                </p>
              )}
            </div>
          );
        })}
        {!serviciosUnicos.size && (
          <p className="text-sm text-cx-texto-2 bg-cx-hielo rounded-lg p-4">
            Todavía no has comprado ningún servicio con contenido.
          </p>
        )}
      </div>
    </div>
  );
}
