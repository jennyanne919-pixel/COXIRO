import { createClient } from "@/lib/supabase/server";

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
      <div className="mb-6">
        <h1 className="text-lg font-medium">Solicitudes</h1>
        <p className="text-sm text-stone mt-0.5">
          Personas interesadas en tus servicios a medida
        </p>
      </div>

      <div className="grid gap-3">
        {solicitudes?.map((s: any) => (
          <div key={s.id} className="rounded-lg bg-paper p-4 text-sm">
            <div className="flex items-start justify-between mb-1 gap-2 flex-wrap">
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-stone">
                {new Date(s.created_at).toLocaleDateString("es-ES")}
              </p>
            </div>
            <p className="text-xs text-copper mb-2">{s.services?.title}</p>
            <p className="text-stone text-xs mb-2 break-all">{s.email}</p>
            {s.message && <p className="text-sm">{s.message}</p>}
          </div>
        ))}
        {!solicitudes?.length && (
          <p className="text-sm text-stone bg-paper rounded-lg p-4">
            Todavía no has recibido ninguna solicitud.
          </p>
        )}
      </div>
    </div>
  );
}
