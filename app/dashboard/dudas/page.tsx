import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Avatar, Badge, BTN_SECONDARY, Card, EmptyState, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

// Bandeja de dudas del profesional: lo que preguntan los alumnos en las lecciones.
export default async function DudasPage({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string }>;
}) {
  const { ver } = await searchParams;
  const todas = ver === "todas";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: servicios } = await admin
    .from("services")
    .select("id, title")
    .eq("provider_id", user?.id ?? "");
  const ids = (servicios ?? []).map((s) => s.id);

  const { data: comentarios } = ids.length
    ? await admin
        .from("lesson_comments")
        .select("id, item_id, service_id, author_id, parent_id, is_instructor, resolved, body, created_at, content_items ( title )")
        .in("service_id", ids)
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: [] };

  const lista = (comentarios ?? []) as any[];
  const raices = lista.filter((c) => !c.parent_id && !c.is_instructor);
  const conRespuesta = new Set(lista.filter((c) => c.parent_id && c.is_instructor).map((c) => c.parent_id));
  const pendientes = raices.filter((c) => !c.resolved && !conRespuesta.has(c.id));
  const visibles = (todas ? raices : pendientes).slice(0, 100);

  const autores = [...new Set(visibles.map((c) => c.author_id))];
  const { data: clientes } = autores.length
    ? await admin.from("clients").select("user_id, billing_name").in("user_id", autores)
    : { data: [] };
  const nombre = new Map((clientes ?? []).map((c: any) => [c.user_id, c.billing_name]));
  const titulo = new Map((servicios ?? []).map((s) => [s.id, s.title]));

  const fecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <PageHeader
        title="Dudas de alumnos"
        subtitle={`${pendientes.length} sin responder`}
        action={
          <a href={todas ? "/dashboard/dudas" : "/dashboard/dudas?ver=todas"} className={BTN_SECONDARY}>
            {todas ? "Ver solo pendientes" : "Ver todas"}
          </a>
        }
      />

      {visibles.length ? (
        <div className="grid gap-3">
          {visibles.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                <Avatar name={nombre.get(c.author_id) ?? "Alumno"} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-medium text-cx-noche">{nombre.get(c.author_id) ?? "Alumno"}</p>
                  <p className="text-xs text-cx-texto-2">
                    {titulo.get(c.service_id)} · {c.content_items?.title} · {fecha(c.created_at)}
                  </p>
                  <p className="text-sm text-cx-noche mt-2 whitespace-pre-wrap break-words line-clamp-4">{c.body}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.resolved ? (
                    <Badge tone="verde">Resuelta</Badge>
                  ) : conRespuesta.has(c.id) ? (
                    <Badge>Respondida</Badge>
                  ) : (
                    <Badge tone="ambar">Sin responder</Badge>
                  )}
                  <a href={`/curso/${c.service_id}?leccion=${c.item_id}#dudas`} className={BTN_SECONDARY}>
                    Responder
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="inbox"
            title={todas ? "Todavía no hay dudas" : "No tienes dudas pendientes"}
            text="Cuando un alumno escriba en una lección, aparecerá aquí y te llegará un email."
          />
        </Card>
      )}
    </div>
  );
}
