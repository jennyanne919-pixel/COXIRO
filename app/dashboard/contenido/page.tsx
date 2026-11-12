import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { filtroAccesoVigente } from "@/lib/content-access";
import ContenidoView, { type ContenidoGrupo } from "@/components/dashboard/ContenidoView";

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
    .eq("client_id", user?.id ?? "")
    .or(filtroAccesoVigente());

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

  const grupos: ContenidoGrupo[] = [...serviciosUnicos.entries()].map(([serviceId, service]) => ({
    id: serviceId,
    titulo: service?.title ?? "Servicio",
    profesional: service?.providers?.business_name ?? "Profesional en Coxiro",
    items: (allItems ?? [])
      .filter((i) => i.service_id === serviceId)
      .map((item) => {
        const reproducible = ["video", "audio"].includes(item.content_type);
        return {
          id: item.id,
          titulo: item.title,
          tipo: item.content_type,
          href: reproducible ? `/contenido/${item.id}` : `/api/access/${item.id}`,
          reproducible,
          pos: progreso.get(item.id) ?? 0,
          dur: Number(item.duration_seconds ?? 0),
        };
      }),
  }));

  return <ContenidoView grupos={grupos} />;
}
