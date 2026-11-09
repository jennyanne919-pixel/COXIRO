import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge, BTN_SECONDARY, Card, EmptyState, Icon, PageHeader } from "@/components/dashboard/ui";

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: misServicios } = await supabase
    .from("services")
    .select("id")
    .eq("provider_id", user?.id ?? "")
    .eq("requires_inquiry", true);

  const serviceIds = misServicios?.map((s) => s.id) ?? [];

  const { data: solicitudes } = serviceIds.length
    ? await supabase
        .from("service_inquiries")
        .select("id, name, email, message, created_at, services ( title )")
        .in("service_id", serviceIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        subtitle="Personas interesadas en tus servicios a medida"
      />

      {solicitudes?.length ? (
        <div className="grid gap-3">
          {solicitudes.map((s: any) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                <Avatar name={s.name} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-medium text-cx-noche">{s.name}</p>
                  <p className="text-xs text-cx-texto-2 break-all">{s.email}</p>
                </div>
                <Badge tone="celeste">{s.services?.title}</Badge>
                <span className="text-xs text-cx-texto-2 whitespace-nowrap">
                  {new Date(s.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              </div>
              {s.message && (
                <p className="text-sm text-cx-noche bg-cx-hielo/60 rounded-xl p-3.5 mt-4">{s.message}</p>
              )}
              <div className="mt-4">
                <a href={`mailto:${s.email}`} className={BTN_SECONDARY}>
                  <Icon name="inbox" className="w-3.5 h-3.5" />
                  Responder por email
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="inbox"
            title="Todavía no has recibido ninguna solicitud"
            text="Las verás aquí cuando alguien te escriba desde un servicio a medida."
          />
        </Card>
      )}
    </div>
  );
}
