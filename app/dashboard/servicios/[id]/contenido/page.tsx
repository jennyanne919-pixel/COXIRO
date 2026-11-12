import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addLesson,
  addSection,
  deleteContentItem,
  deleteSection,
  moveLesson,
  moveSection,
  renameSection,
  setComentarios,
} from "./actions";
import { addDirecto, avisarDirecto, deleteDirecto } from "./directos";
import { fechaMadrid } from "@/lib/fechas";
import ConfirmForm from "@/components/dashboard/ConfirmForm";
import { notFound } from "next/navigation";
import { fmtBytes, getAlmacenamiento, MAX_ARCHIVO_BYTES } from "@/lib/storage";
import {
  Badge,
  BTN_ICON,
  BTN_SECONDARY,
  Card,
  EmptyState,
  Icon,
  PageHeader,
} from "@/components/dashboard/ui";

const INPUT = "rounded-lg border border-cx-borde bg-white px-3 py-1.5 text-sm";

function Flechas({
  action,
  fields,
  primero,
  ultimo,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  primero: boolean;
  ultimo: boolean;
}) {
  return (
    <div className="flex gap-1">
      {(["up", "down"] as const).map((dir) => (
        <form key={dir} action={action}>
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <input type="hidden" name="dir" value={dir} />
          <button
            disabled={dir === "up" ? primero : ultimo}
            title={dir === "up" ? "Subir" : "Bajar"}
            aria-label={dir === "up" ? "Subir" : "Bajar"}
            className={`${BTN_ICON} disabled:opacity-30 disabled:pointer-events-none`}
          >
            <span className="text-xs">{dir === "up" ? "↑" : "↓"}</span>
          </button>
        </form>
      ))}
    </div>
  );
}

export default async function ContenidoServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service } = await supabase
    .from("services")
    .select("id, title, provider_id, comments_enabled")
    .eq("id", id)
    .single();

  if (!service || service.provider_id !== user?.id) {
    notFound();
  }

  const [{ data: secciones }, { data: lecciones }] = await Promise.all([
    supabase
      .from("course_sections")
      .select("id, title, sort_order")
      .eq("service_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("content_items")
      .select("id, title, content_type, status, is_free, section_id, sort_order, r2_key, file_url")
      .eq("service_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  const { usado, cuota } = await getAlmacenamiento(supabase, user!.id);
  const { data: directos } = await createAdminClient()
    .from("live_sessions")
    .select("id, title, starts_at, join_url, notified_at")
    .eq("service_id", service.id)
    .order("starts_at", { ascending: false });
  const ahora = Date.now();
  const pct = Math.min(100, Math.round((usado / cuota) * 100));

  const grupos = [
    { id: null as string | null, titulo: "Sin sección", lecciones: (lecciones ?? []).filter((l) => !l.section_id) },
    ...(secciones ?? []).map((s) => ({
      id: s.id as string | null,
      titulo: s.title,
      lecciones: (lecciones ?? []).filter((l) => l.section_id === s.id),
    })),
  ];
  const idsSecciones = (secciones ?? []).map((s) => s.id);

  return (
    <div>
      <a href="/dashboard/servicios" className="inline-flex items-center gap-1 text-xs text-cx-texto-2 hover:text-cx-prof mb-3">
        ← Volver a mis servicios
      </a>
      <PageHeader
        title={`Contenido de «${service.title}»`}
        subtitle="Organiza el curso en secciones y lecciones. Lo que verá el cliente después de pagar"
        action={
          <a href={`/curso/${service.id}`} target="_blank" className={BTN_SECONDARY}>
            <Icon name="eye" className="w-3.5 h-3.5" />
            Ver como alumno
          </a>
        }
      />

      <div className="max-w-lg mb-5">
        <div className="flex justify-between text-xs text-cx-texto-2 mb-1">
          <span>Espacio usado en tu cuenta</span>
          <span>
            {fmtBytes(usado)} de {fmtBytes(cuota)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-cx-hielo overflow-hidden">
          <div
            className={`h-full rounded-full ${pct >= 90 ? "bg-amber-500" : "bg-cx-celeste"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-cx-texto-2 mt-1">
          Máximo {fmtBytes(MAX_ARCHIVO_BYTES)} por archivo. Si necesitas más espacio, escríbenos.
        </p>
      </div>

      <div className="max-w-lg mb-5 rounded-xl border border-cx-borde bg-white p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1 basis-56">
          <p className="text-sm font-medium text-cx-noche">Dudas y comentarios de los alumnos</p>
          <p className="text-xs text-cx-texto-2 mt-0.5">
            {service.comments_enabled
              ? "Activadas: tus alumnos pueden preguntar en cada lección y tú recibes un email."
              : "Desactivadas: nadie puede escribir en las lecciones de este servicio."}
          </p>
        </div>
        <form action={setComentarios}>
          <input type="hidden" name="service_id" value={service.id} />
          <input type="hidden" name="activar" value={service.comments_enabled ? "0" : "1"} />
          <button className={BTN_SECONDARY}>{service.comments_enabled ? "Desactivar" : "Activar"}</button>
        </form>
      </div>

      <div className="max-w-2xl mb-6 rounded-xl border border-cx-borde bg-white p-4">
        <p className="text-sm font-medium text-cx-noche">Sesiones en directo</p>
        <p className="text-xs text-cx-texto-2 mt-0.5">
          Programa una videollamada (Zoom, Meet…) y tus alumnos la verán en el curso. Hora de Madrid.
        </p>
        <form action={addDirecto} className="grid gap-2 mt-3 sm:grid-cols-2">
          <input type="hidden" name="service_id" value={service.id} />
          <input name="title" required maxLength={150} placeholder="Título (ej. Sesión de dudas)" className={INPUT} />
          <input name="starts_at" type="datetime-local" required className={INPUT} />
          <input name="join_url" type="url" required placeholder="Enlace de la videollamada (https://…)" className={`${INPUT} sm:col-span-2`} />
          <textarea name="notes" rows={2} maxLength={1000} placeholder="Notas para los alumnos (opcional)" className={`${INPUT} sm:col-span-2`} />
          <div className="sm:col-span-2">
            <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-4 py-1.5 hover:brightness-105 transition">
              Programar sesión
            </button>
          </div>
        </form>
        {(directos ?? []).length > 0 && (
          <ul className="mt-4 grid gap-2">
            {(directos ?? []).map((d) => (
              <li key={d.id} className="flex items-center gap-3 flex-wrap rounded-lg border border-cx-borde px-3 py-2">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-sm font-medium text-cx-noche">{d.title}</p>
                  <p className="text-xs text-cx-texto-2">
                    {fechaMadrid(d.starts_at)}
                    {new Date(d.starts_at).getTime() < ahora && " · ya celebrada"}
                  </p>
                </div>
                {d.notified_at ? (
                  <span className="text-[11px] rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">Alumnos avisados</span>
                ) : (
                  new Date(d.starts_at).getTime() > ahora && (
                    <ConfirmForm
                      action={avisarDirecto}
                      fields={{ service_id: service.id, session_id: d.id }}
                      confirmText="Se enviará un email a todos los alumnos con acceso. Solo se puede hacer una vez. ¿Continuar?"
                    >
                      <button className={BTN_SECONDARY}>Avisar a los alumnos</button>
                    </ConfirmForm>
                  )
                )}
                <form action={deleteDirecto}>
                  <input type="hidden" name="service_id" value={service.id} />
                  <input type="hidden" name="session_id" value={d.id} />
                  <button className="text-[11px] text-cx-texto-2 hover:text-red-600 underline">Borrar</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={addSection} className="flex gap-2 mb-6 max-w-lg">
        <input type="hidden" name="service_id" value={service.id} />
        <input name="title" required placeholder="Nueva sección (ej. Módulo 1 — Introducción)" className={`${INPUT} flex-1`} />
        <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-4 py-1.5 hover:brightness-105 transition whitespace-nowrap">
          Añadir sección
        </button>
      </form>

      <div className="grid gap-5">
        {grupos.map((g) => {
          const idxSec = g.id ? idsSecciones.indexOf(g.id) : -1;
          // "Sin sección" solo se muestra si tiene lecciones, o si no hay ninguna sección.
          if (!g.id && !g.lecciones.length && (secciones?.length ?? 0) > 0) return null;
          return (
            <Card key={g.id ?? "sin"} className="overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-cx-borde bg-cx-hielo/40">
                {g.id ? (
                  <>
                    <form action={renameSection} className="flex gap-2 flex-1 min-w-48">
                      <input type="hidden" name="service_id" value={service.id} />
                      <input type="hidden" name="section_id" value={g.id} />
                      <input name="title" defaultValue={g.titulo} required className={`${INPUT} flex-1 font-medium`} />
                      <button className={BTN_SECONDARY}>Guardar</button>
                    </form>
                    <Flechas
                      action={moveSection}
                      fields={{ service_id: service.id, section_id: g.id }}
                      primero={idxSec === 0}
                      ultimo={idxSec === idsSecciones.length - 1}
                    />
                    <ConfirmForm
                      action={deleteSection}
                      fields={{ service_id: service.id, section_id: g.id }}
                      confirmText="¿Eliminar esta sección? Sus lecciones NO se borran: pasan a «Sin sección»."
                    >
                      <button title="Eliminar sección" aria-label="Eliminar sección" className={`${BTN_ICON} hover:!border-red-300 hover:!text-red-600`}>
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </ConfirmForm>
                  </>
                ) : (
                  <p className="font-medium text-cx-noche">{g.titulo}</p>
                )}
              </div>

              {g.lecciones.length ? (
                <ul className="divide-y divide-cx-borde">
                  {g.lecciones.map((l, i) => (
                    <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-cx-noche truncate">{l.title}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <Badge tone={l.status === "published" ? "verde" : "ambar"}>
                            {l.status === "published" ? "Publicada" : "Borrador"}
                          </Badge>
                          {l.is_free && <Badge tone="celeste">Gratis</Badge>}
                          {l.content_type !== "lesson" && <Badge>Archivo original</Badge>}
                        </div>
                      </div>
                      <Flechas
                        action={moveLesson}
                        fields={{ service_id: service.id, item_id: l.id }}
                        primero={i === 0}
                        ultimo={i === g.lecciones.length - 1}
                      />
                      <a href={`/dashboard/servicios/${service.id}/contenido/${l.id}`} className={BTN_SECONDARY}>
                        <Icon name="pencil" className="w-3.5 h-3.5" />
                        Editar
                      </a>
                      <ConfirmForm
                        action={deleteContentItem}
                        fields={{ service_id: service.id, item_id: l.id }}
                        confirmText="¿Eliminar esta lección y todos sus archivos? Tus clientes dejarán de verla. No se puede deshacer."
                      >
                        <button title="Eliminar lección" aria-label="Eliminar lección" className={`${BTN_ICON} hover:!border-red-300 hover:!text-red-600`}>
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </ConfirmForm>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-cx-texto-2 px-4 py-4">Esta sección aún no tiene lecciones.</p>
              )}

              <form action={addLesson} className="flex gap-2 px-4 py-3 border-t border-cx-borde">
                <input type="hidden" name="service_id" value={service.id} />
                <input type="hidden" name="section_id" value={g.id ?? ""} />
                <input name="title" required placeholder="Nueva lección (ej. Clase grabada)" className={`${INPUT} flex-1`} />
                <button className={BTN_SECONDARY}>
                  <Icon name="plus" className="w-3.5 h-3.5" />
                  Añadir lección
                </button>
              </form>
            </Card>
          );
        })}
      </div>

      {!lecciones?.length && !secciones?.length && (
        <Card className="mt-5">
          <EmptyState
            icon="folder"
            title="Todavía no has añadido contenido"
            text="Crea una sección y añade tu primera lección. Cada lección puede llevar vídeo, texto, PDF y archivos."
          />
        </Card>
      )}
    </div>
  );
}
