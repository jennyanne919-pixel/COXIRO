import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaybackUrl } from "@/lib/r2";
import { tieneAcceso } from "@/lib/content-access";
import { notFound, redirect } from "next/navigation";
import Logo from "@/components/Logo";
import VideoPlayer from "@/app/contenido/[itemId]/VideoPlayer";
import { completarLeccion, desmarcarLeccion } from "./actions";
import { fechaMadrid } from "@/lib/fechas";
import Dudas, { type Comentario } from "@/components/curso/Dudas";

export const dynamic = "force-dynamic";

type Leccion = {
  id: string;
  title: string;
  content_type: string;
  status: string;
  is_free: boolean;
  section_id: string | null;
  sort_order: number;
  r2_key: string | null;
  file_url: string | null;
};

const Check = ({ on }: { on: boolean }) => (
  <span
    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${
      on ? "bg-cx-celeste border-cx-celeste text-cx-noche" : "border-cx-borde text-transparent"
    }`}
    aria-hidden="true"
  >
    ✓
  </span>
);

export default async function CursoPage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ leccion?: string; fin?: string; limite?: string; error?: string }>;
}) {
  const { serviceId } = await params;
  const { leccion: leccionId, fin, limite, error: errorCom } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/curso/${serviceId}${leccionId ? `?leccion=${leccionId}` : ""}`)}`
    );
  }

  const admin = createAdminClient();
  const { data: service } = await admin
    .from("services")
    .select("id, title, provider_id, comments_enabled, providers ( business_name )")
    .eq("id", serviceId)
    .maybeSingle();
  if (!service) notFound();

  const esDueno = service.provider_id === user.id;
  const acceso = esDueno || (await tieneAcceso(admin, user.id, serviceId));

  const [{ data: secciones }, { data: todas }] = await Promise.all([
    admin
      .from("course_sections")
      .select("id, title, sort_order")
      .eq("service_id", serviceId)
      .order("sort_order", { ascending: true }),
    admin
      .from("content_items")
      .select("id, title, content_type, status, is_free, section_id, sort_order, r2_key, file_url")
      .eq("service_id", serviceId)
      .order("sort_order", { ascending: true }),
  ]);

  // El dueño ve también los borradores (para comprobar cómo queda).
  const lecciones = ((todas ?? []) as Leccion[]).filter((l) => esDueno || l.status === "published");

  // Orden del curso: primero las lecciones sin sección, luego cada sección.
  const grupos = [
    { id: null as string | null, titulo: "", items: lecciones.filter((l) => !l.section_id) },
    ...(secciones ?? []).map((s) => ({
      id: s.id as string | null,
      titulo: s.title as string,
      items: lecciones.filter((l) => l.section_id === s.id),
    })),
  ].filter((g) => g.items.length);
  const orden = grupos.flatMap((g) => g.items);

  const actual = orden.find((l) => l.id === leccionId) ?? orden[0] ?? null;

  const { data: progreso } = orden.length
    ? await admin
        .from("content_progress")
        .select("content_item_id, position_seconds, completed_at")
        .eq("client_id", user.id)
        .in(
          "content_item_id",
          orden.map((l) => l.id)
        )
    : { data: [] };
  const completadas = new Set(
    (progreso ?? []).filter((p) => p.completed_at).map((p) => p.content_item_id)
  );
  const pct = orden.length ? Math.round((completadas.size / orden.length) * 100) : 0;

  const volver = esDueno ? `/dashboard/servicios/${serviceId}/contenido` : "/dashboard/contenido";

  // ¿Puede ver la lección actual?
  const puedeVer = !!actual && (acceso || actual.is_free);

  let bloques: any[] = [];
  let urlLegacy: string | null = null;
  let resumeAt = 0;
  if (actual && puedeVer) {
    const { data } = await admin
      .from("lesson_blocks")
      .select("id, type, title, text_content, url, r2_key, position")
      .eq("item_id", actual.id)
      .order("position", { ascending: true });
    bloques = data ?? [];
    if (actual.r2_key && ["video", "audio"].includes(actual.content_type)) {
      urlLegacy = await getPlaybackUrl(actual.r2_key);
    }
    resumeAt = Number(
      (progreso ?? []).find((p) => p.content_item_id === actual.id)?.position_seconds ?? 0
    );
  }

  // Próximas sesiones en directo (el enlace solo lo ven quienes tienen acceso)
  const { data: directos } = await admin
    .from("live_sessions")
    .select("id, title, starts_at, join_url, notes")
    .eq("service_id", serviceId)
    .gte("starts_at", new Date(Date.now() - 2 * 3600_000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(5);

  // Dudas de la lección (solo quien ha comprado o el dueño)
  let comentarios: Comentario[] = [];
  const nombres: Record<string, string> = {};
  const puedeComentar =
    !!actual && puedeVer && (esDueno || acceso) && !!(service as any).comments_enabled;
  if (actual && puedeComentar) {
    const { data } = await admin
      .from("lesson_comments")
      .select("id, author_id, parent_id, body, is_instructor, resolved, created_at")
      .eq("item_id", actual.id)
      .order("created_at", { ascending: true });
    comentarios = (data ?? []) as Comentario[];
    const autores = [...new Set(comentarios.map((c) => c.author_id))];
    if (autores.length) {
      const [{ data: ps }, { data: cs }] = await Promise.all([
        admin.from("providers").select("user_id, business_name").in("user_id", autores),
        admin.from("clients").select("user_id, billing_name").in("user_id", autores),
      ]);
      for (const c of cs ?? []) nombres[(c as any).user_id] = (c as any).billing_name;
      for (const p of ps ?? []) nombres[(p as any).user_id] = (p as any).business_name;
    }
  }

  // Los vídeos de bloques llevan su URL firmada
  const urls = new Map<string, string>();
  for (const b of bloques) {
    if (b.r2_key && ["video", "audio"].includes(b.type)) urls.set(b.id, await getPlaybackUrl(b.r2_key));
  }
  // El progreso de reproducción se guarda solo para el primer vídeo/audio de la lección.
  let progresoAsignado = !!urlLegacy;

  const idx = actual ? orden.findIndex((l) => l.id === actual.id) : -1;
  const anterior = idx > 0 ? orden[idx - 1] : null;
  const siguiente = idx >= 0 && idx < orden.length - 1 ? orden[idx + 1] : null;
  const hecha = actual ? completadas.has(actual.id) : false;
  const href = (id: string) => `/curso/${serviceId}?leccion=${id}`;

  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="bg-cx-noche px-5 py-3 flex items-center justify-between gap-3">
        <a href={volver} aria-label="Volver">
          <Logo variant="dark" />
        </a>
        <a href={volver} className="text-xs text-cx-texto-osc-2 hover:text-white">
          ← {esDueno ? "Volver al constructor" : "Mi contenido"}
        </a>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[300px_1fr] gap-6 px-4 sm:px-6 py-6">
        {/* Temario */}
        <aside className="rounded-2xl bg-white border border-cx-borde p-4 h-fit lg:sticky lg:top-4 max-h-[85vh] overflow-y-auto">
          <p className="font-display font-bold text-cx-noche leading-snug">{service.title}</p>
          <p className="text-xs text-cx-texto-2">{(service.providers as any)?.business_name}</p>
          <div className="mt-3">
            <div className="h-2 rounded-full bg-cx-hielo overflow-hidden">
              <div className="h-full bg-cx-celeste" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-cx-texto-2 mt-1">{pct} % completado</p>
          </div>

          <nav className="mt-4 grid gap-3">
            {grupos.map((g) => (
              <div key={g.id ?? "sin"}>
                {g.titulo && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-cx-texto-2 mb-1">{g.titulo}</p>
                )}
                <ul className="grid gap-0.5">
                  {g.items.map((l) => {
                    const activa = l.id === actual?.id;
                    const bloqueada = !acceso && !l.is_free;
                    return (
                      <li key={l.id}>
                        <a
                          href={href(l.id)}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                            activa ? "bg-cx-celeste/20 text-cx-noche font-medium" : "hover:bg-cx-hielo text-cx-noche"
                          }`}
                        >
                          <Check on={completadas.has(l.id)} />
                          <span className="flex-1 min-w-0">{l.title}</span>
                          {l.status === "draft" && (
                            <span className="text-[10px] rounded-full bg-amber-50 text-amber-700 px-1.5 py-0.5">Borrador</span>
                          )}
                          {bloqueada && <span aria-label="Bloqueada" className="text-xs">🔒</span>}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Lección */}
        <section className="min-w-0">
          {(esDueno || acceso) && (directos ?? []).length > 0 && (
            <div className="mb-5 rounded-2xl bg-white border border-cx-celeste/50 p-5">
              <p className="text-sm font-semibold text-cx-noche">Próximas sesiones en directo</p>
              <ul className="mt-3 grid gap-3">
                {(directos ?? []).map((d) => (
                  <li key={d.id} className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-cx-noche">{d.title}</p>
                      <p className="text-xs text-cx-texto-2 capitalize">{fechaMadrid(d.starts_at)} (hora de Madrid)</p>
                      {d.notes && <p className="text-xs text-cx-noche mt-1 whitespace-pre-wrap">{d.notes}</p>}
                    </div>
                    {/^https?:\/\//i.test(d.join_url) && (
                      <a
                        href={d.join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-4 py-1.5 hover:brightness-105 transition"
                      >
                        Unirme
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!actual ? (
            <div className="rounded-2xl bg-white border border-cx-borde p-8 text-center text-sm text-cx-texto-2">
              El profesional todavía no ha publicado lecciones en este curso.
            </div>
          ) : !puedeVer ? (
            <div className="rounded-2xl bg-white border border-cx-borde p-8 text-center">
              <p className="font-medium text-cx-noche">Esta lección es solo para quien ha contratado el servicio.</p>
              <a
                href={`/servicio/${serviceId}`}
                className="inline-flex mt-4 rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-5 py-2"
              >
                Ver el servicio
              </a>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-cx-borde p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
                <h1 className="font-display font-bold text-2xl text-cx-noche leading-snug">{actual.title}</h1>
                {actual.status === "draft" && (
                  <span className="text-xs rounded-full bg-amber-50 text-amber-700 px-2.5 py-1">
                    Borrador: tus clientes aún no la ven
                  </span>
                )}
              </div>

              {fin && (
                <div className="mb-5 rounded-xl bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
                  ¡Has llegado al final del curso! Puedes repasar cualquier lección desde el temario.
                </div>
              )}

              <div className="grid gap-6">
                {/* Archivo original (lecciones antiguas) */}
                {actual.r2_key && urlLegacy && (
                  <div className="rounded-xl overflow-hidden bg-cx-noche">
                    <VideoPlayer
                      src={urlLegacy}
                      title={actual.title}
                      contentItemId={actual.id}
                      resumeAt={resumeAt}
                      isAudio={actual.content_type === "audio"}
                    />
                  </div>
                )}
                {actual.r2_key && !urlLegacy && actual.content_type === "pdf" && (
                  <iframe
                    src={`/api/access/${actual.id}`}
                    title={actual.title}
                    className="w-full h-[75vh] rounded-xl border border-cx-borde"
                  />
                )}
                {actual.r2_key && !urlLegacy && actual.content_type !== "pdf" && (
                  <a
                    href={`/api/access/${actual.id}`}
                    target="_blank"
                    className="rounded-xl border border-cx-borde px-4 py-3 text-sm text-cx-prof font-medium hover:border-cx-celeste"
                  >
                    ⬇ Descargar {actual.title}
                  </a>
                )}
                {!actual.r2_key && actual.file_url && (
                  <a
                    href={actual.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-cx-borde px-4 py-3 text-sm text-cx-prof font-medium hover:border-cx-celeste"
                  >
                    ↗ Abrir enlace
                  </a>
                )}

                {bloques.map((b) => {
                  if (b.type === "text") {
                    return (
                      <p key={b.id} className="text-[15px] leading-relaxed text-cx-noche whitespace-pre-wrap break-words">
                        {b.text_content}
                      </p>
                    );
                  }
                  if (b.type === "video" || b.type === "audio") {
                    const asignar = !progresoAsignado;
                    progresoAsignado = true;
                    return (
                      <div key={b.id}>
                        {b.title && <p className="text-sm font-medium text-cx-noche mb-2">{b.title}</p>}
                        <div className="rounded-xl overflow-hidden bg-cx-noche">
                          <VideoPlayer
                            src={urls.get(b.id)!}
                            title={b.title || actual.title}
                            contentItemId={asignar ? actual.id : ""}
                            resumeAt={asignar ? resumeAt : 0}
                            isAudio={b.type === "audio"}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (b.type === "pdf") {
                    return (
                      <div key={b.id}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="text-sm font-medium text-cx-noche">{b.title || "Documento PDF"}</p>
                          <a
                            href={`/api/bloque/${b.id}?descargar=1`}
                            className="text-xs text-cx-prof font-medium hover:underline"
                          >
                            Descargar
                          </a>
                        </div>
                        <iframe
                          src={`/api/bloque/${b.id}`}
                          title={b.title || "PDF"}
                          className="w-full h-[75vh] rounded-xl border border-cx-borde"
                        />
                      </div>
                    );
                  }
                  if (b.type === "file") {
                    return (
                      <a
                        key={b.id}
                        href={`/api/bloque/${b.id}?descargar=1`}
                        className="rounded-xl border border-cx-borde px-4 py-3 text-sm text-cx-prof font-medium hover:border-cx-celeste"
                      >
                        ⬇ {b.title || "Descargar archivo"}
                      </a>
                    );
                  }
                  if (b.type === "link" && /^https?:\/\//i.test(b.url ?? "")) {
                    return (
                      <a
                        key={b.id}
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-cx-borde px-4 py-3 text-sm text-cx-prof font-medium hover:border-cx-celeste break-all"
                      >
                        ↗ {b.title || b.url}
                      </a>
                    );
                  }
                  return null;
                })}

                {!actual.r2_key && !actual.file_url && !bloques.length && (
                  <p className="text-sm text-cx-texto-2">Esta lección todavía no tiene contenido.</p>
                )}
              </div>

              {/* Navegación */}
              <div className="mt-8 pt-5 border-t border-cx-borde flex items-center justify-between gap-3 flex-wrap">
                {anterior ? (
                  <a
                    href={href(anterior.id)}
                    className="rounded-full border border-cx-borde bg-white text-cx-noche text-sm font-medium px-4 py-2 hover:border-cx-celeste"
                  >
                    ← Lección anterior
                  </a>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  {hecha && (
                    <form action={desmarcarLeccion}>
                      <input type="hidden" name="service_id" value={serviceId} />
                      <input type="hidden" name="item_id" value={actual.id} />
                      <button className="text-xs text-cx-texto-2 hover:text-cx-prof underline">Quitar completada</button>
                    </form>
                  )}
                  <form action={completarLeccion}>
                    <input type="hidden" name="service_id" value={serviceId} />
                    <input type="hidden" name="item_id" value={actual.id} />
                    <input type="hidden" name="next_id" value={siguiente?.id ?? ""} />
                    <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-5 py-2 hover:brightness-105 transition">
                      {siguiente
                        ? hecha
                          ? "Siguiente lección →"
                          : "Completar y continuar →"
                        : hecha
                          ? "Fin del curso"
                          : "Completar curso"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {actual && puedeComentar && (
            <Dudas
              serviceId={serviceId}
              itemId={actual.id}
              userId={user.id}
              esDueno={esDueno}
              comentarios={comentarios}
              nombres={nombres}
              aviso={limite ? "limite" : errorCom ? "error" : undefined}
            />
          )}
        </section>
      </div>
    </main>
  );
}
