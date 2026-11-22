import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { filtroAccesoVigente } from "@/lib/content-access";
import { notFound, redirect } from "next/navigation";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

// Alumnos de un servicio: quién tiene acceso, cuánto lleva y cuándo entró por última vez.
export default async function AlumnosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: service } = await supabase
    .from("services")
    .select("id, title, provider_id")
    .eq("id", id)
    .single();
  if (!service || service.provider_id !== user.id) notFound();

  const admin = createAdminClient();

  const [{ data: lecciones }, { data: accesos }] = await Promise.all([
    admin.from("content_items").select("id").eq("service_id", id).eq("status", "published"),
    admin
      .from("content_access")
      .select("client_id, granted_at, expires_at")
      .eq("service_id", id)
      .or(filtroAccesoVigente())
      .order("granted_at", { ascending: false }),
  ]);

  const leccionIds = (lecciones ?? []).map((l) => l.id);
  const total = leccionIds.length;

  // Un alumno puede tener varios accesos (recompras): se queda el más antiguo.
  const desde = new Map<string, string>();
  for (const a of accesos ?? []) desde.set(a.client_id, a.granted_at);
  const alumnos = [...desde.keys()];

  const [{ data: clientes }, { data: progreso }] = await Promise.all([
    alumnos.length
      ? admin.from("clients").select("user_id, billing_name").in("user_id", alumnos)
      : Promise.resolve({ data: [] as any[] }),
    alumnos.length && leccionIds.length
      ? admin
          .from("content_progress")
          .select("client_id, content_item_id, completed_at, updated_at")
          .in("client_id", alumnos)
          .in("content_item_id", leccionIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const nombre = new Map((clientes ?? []).map((c: any) => [c.user_id, c.billing_name]));
  const hechas = new Map<string, number>();
  const ultima = new Map<string, string>();
  for (const p of progreso ?? []) {
    if (p.completed_at) hechas.set(p.client_id, (hechas.get(p.client_id) ?? 0) + 1);
    const t = p.updated_at ?? p.completed_at;
    if (t && (!ultima.get(p.client_id) || t > ultima.get(p.client_id)!)) ultima.set(p.client_id, t);
  }

  const emails = new Map<string, string>();
  await Promise.all(
    alumnos.map(async (cid) => {
      const { data } = await admin.auth.admin.getUserById(cid);
      if (data?.user?.email) emails.set(cid, data.user.email);
    })
  );

  const filas = alumnos
    .map((cid) => {
      const h = hechas.get(cid) ?? 0;
      return {
        cid,
        nombre: nombre.get(cid) ?? "Alumno",
        email: emails.get(cid) ?? "",
        desde: desde.get(cid)!,
        hechas: h,
        pct: total ? Math.round((h / total) * 100) : 0,
        ultima: ultima.get(cid) ?? null,
      };
    })
    .sort((a, b) => (b.ultima ?? "").localeCompare(a.ultima ?? ""));

  const fecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  const media = filas.length ? Math.round(filas.reduce((t, f) => t + f.pct, 0) / filas.length) : 0;
  const sinEmpezar = filas.filter((f) => !f.ultima).length;

  return (
    <div>
      <a
        href={`/dashboard/servicios/${id}/contenido`}
        className="inline-flex items-center gap-1 text-xs text-cx-texto-2 hover:text-cx-prof mb-3"
      >
        ← Volver al contenido
      </a>
      <PageHeader
        title={`Alumnos de «${service.title}»`}
        subtitle={`${filas.length} con acceso · progreso medio ${media} % · ${sinEmpezar} sin empezar · ${total} lecciones publicadas`}
      />

      {filas.length ? (
        <div className="grid gap-3">
          {filas.map((f) => (
            <Card key={f.cid} className="p-5">
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <Avatar name={f.nombre} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-medium text-cx-noche">{f.nombre}</p>
                  <p className="text-xs text-cx-texto-2 break-all">{f.email}</p>
                  <p className="text-xs text-cx-texto-2 mt-0.5">
                    Desde {fecha(f.desde)} ·{" "}
                    {f.ultima ? `última actividad ${fecha(f.ultima)}` : "todavía no ha entrado"}
                  </p>
                </div>
                <div className="w-full sm:w-52">
                  <div className="h-2 rounded-full bg-cx-hielo overflow-hidden">
                    <div className="h-full bg-cx-celeste" style={{ width: `${f.pct}%` }} />
                  </div>
                  <p className="text-xs text-cx-texto-2 mt-1">
                    {f.hechas} de {total} lecciones · {f.pct} %
                  </p>
                </div>
                {total > 0 && f.pct === 100 && <Badge tone="verde">Completado</Badge>}
                {!f.ultima && <Badge tone="ambar">Sin empezar</Badge>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="users"
            title="Todavía no tienes alumnos"
            text="Cuando alguien compre este servicio aparecerá aquí con su progreso."
          />
        </Card>
      )}
    </div>
  );
}
