import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ConfirmForm from "@/components/dashboard/ConfirmForm";
import AddFileBlockForm from "../AddFileBlockForm";
import {
  addLinkBlock,
  addTextBlock,
  deleteBlock,
  moveBlock,
  removeLegacyFile,
  updateLesson,
  updateTextBlock,
} from "../actions";
import { Badge, BTN_ICON, BTN_SECONDARY, Card, Icon, PageHeader } from "@/components/dashboard/ui";
import { fmtBytes } from "@/lib/storage";

const INPUT = "w-full rounded-lg border border-cx-borde bg-white px-3.5 py-2 text-sm";
const TIPO: Record<string, string> = {
  text: "Texto",
  video: "Vídeo",
  audio: "Audio",
  pdf: "PDF",
  file: "Archivo",
  link: "Enlace",
};

export default async function LeccionEditorPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service } = await supabase
    .from("services")
    .select("id, title, provider_id")
    .eq("id", id)
    .single();
  if (!service || service.provider_id !== user?.id) notFound();

  const { data: leccion } = await supabase
    .from("content_items")
    .select("id, title, status, is_free, section_id, content_type, r2_key, file_url, file_size")
    .eq("id", itemId)
    .eq("service_id", id)
    .single();
  if (!leccion) notFound();

  const [{ data: secciones }, { data: bloques }] = await Promise.all([
    supabase
      .from("course_sections")
      .select("id, title")
      .eq("service_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("lesson_blocks")
      .select("id, type, title, text_content, url, r2_key, file_size, position")
      .eq("item_id", itemId)
      .order("position", { ascending: true }),
  ]);

  const hayArchivoOriginal = !!(leccion.r2_key || leccion.file_url);

  return (
    <div className="max-w-3xl">
      <a
        href={`/dashboard/servicios/${id}/contenido`}
        className="inline-flex items-center gap-1 text-xs text-cx-texto-2 hover:text-cx-prof mb-3"
      >
        ← Volver al contenido de «{service.title}»
      </a>
      <PageHeader title={leccion.title} subtitle="Edita la lección y sus bloques" />

      {/* Ajustes de la lección */}
      <Card className="p-5 mb-5">
        <form action={updateLesson} className="grid gap-3">
          <input type="hidden" name="service_id" value={id} />
          <input type="hidden" name="item_id" value={itemId} />
          <div>
            <label className="text-xs text-cx-texto-2 block mb-1">Título</label>
            <input name="title" defaultValue={leccion.title} required className={INPUT} />
          </div>
          <div>
            <label className="text-xs text-cx-texto-2 block mb-1">Sección</label>
            <select name="section_id" defaultValue={leccion.section_id ?? ""} className={INPUT}>
              <option value="">Sin sección</option>
              {(secciones ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-cx-texto-2 block mb-1">Estado</label>
            <select name="status" defaultValue={leccion.status} className={INPUT}>
              <option value="draft">Borrador (solo tú la ves)</option>
              <option value="published">Publicada (la ven tus clientes)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_free" defaultChecked={leccion.is_free} />
            Lección gratuita (vista previa para quien aún no ha comprado)
          </label>
          <div className="flex gap-2">
            <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-5 py-2 hover:brightness-105 transition">
              Guardar cambios
            </button>
            <a href={`/curso/${id}?leccion=${itemId}`} target="_blank" className={BTN_SECONDARY}>
              <Icon name="eye" className="w-3.5 h-3.5" />
              Ver como alumno
            </a>
          </div>
        </form>
      </Card>

      {/* Bloques */}
      <h2 className="font-display font-bold text-cx-noche mb-2">Contenido de la lección</h2>
      <Card className="mb-5">
        <ul className="divide-y divide-cx-borde">
          {hayArchivoOriginal && (
            <li className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-cx-noche truncate">Archivo original de la lección</p>
                <p className="text-xs text-cx-texto-2">
                  {leccion.file_size ? fmtBytes(Number(leccion.file_size)) : "Enlace externo"} · subido antes de los
                  bloques; aparece siempre el primero
                </p>
              </div>
              <ConfirmForm
                action={removeLegacyFile}
                fields={{ service_id: id, item_id: itemId }}
                confirmText="¿Quitar el archivo original de esta lección? Se borra de tu espacio."
              >
                <button title="Quitar archivo" aria-label="Quitar archivo" className={`${BTN_ICON} hover:!border-red-300 hover:!text-red-600`}>
                  <Icon name="trash" className="w-3.5 h-3.5" />
                </button>
              </ConfirmForm>
            </li>
          )}
          {(bloques ?? []).map((b, i) => (
            <li key={b.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge tone="celeste">{TIPO[b.type] ?? b.type}</Badge>
                <p className="min-w-0 flex-1 text-sm text-cx-noche truncate">
                  {b.type === "text" ? (b.text_content ?? "").slice(0, 80) : b.title || b.url}
                  {b.file_size ? ` · ${fmtBytes(Number(b.file_size))}` : ""}
                </p>
                <div className="flex gap-1">
                  {(["up", "down"] as const).map((dir) => (
                    <form key={dir} action={moveBlock}>
                      <input type="hidden" name="service_id" value={id} />
                      <input type="hidden" name="item_id" value={itemId} />
                      <input type="hidden" name="block_id" value={b.id} />
                      <input type="hidden" name="dir" value={dir} />
                      <button
                        disabled={dir === "up" ? i === 0 : i === (bloques?.length ?? 1) - 1}
                        aria-label={dir === "up" ? "Subir" : "Bajar"}
                        className={`${BTN_ICON} disabled:opacity-30 disabled:pointer-events-none`}
                      >
                        <span className="text-xs">{dir === "up" ? "↑" : "↓"}</span>
                      </button>
                    </form>
                  ))}
                </div>
                <ConfirmForm
                  action={deleteBlock}
                  fields={{ service_id: id, item_id: itemId, block_id: b.id }}
                  confirmText="¿Eliminar este bloque? Si es un archivo, se borra de tu espacio."
                >
                  <button title="Eliminar" aria-label="Eliminar bloque" className={`${BTN_ICON} hover:!border-red-300 hover:!text-red-600`}>
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </button>
                </ConfirmForm>
              </div>
              {b.type === "text" && (
                <form action={updateTextBlock} className="mt-2 grid gap-2">
                  <input type="hidden" name="service_id" value={id} />
                  <input type="hidden" name="item_id" value={itemId} />
                  <input type="hidden" name="block_id" value={b.id} />
                  <textarea name="text" rows={4} defaultValue={b.text_content ?? ""} required className={INPUT} />
                  <button className={`${BTN_SECONDARY} w-fit`}>Guardar texto</button>
                </form>
              )}
            </li>
          ))}
          {!hayArchivoOriginal && !bloques?.length && (
            <li className="px-4 py-6 text-sm text-cx-texto-2 text-center">
              Esta lección está vacía. Añade un texto, un enlace o un archivo con los formularios de abajo.
            </li>
          )}
        </ul>
      </Card>

      <h2 className="font-display font-bold text-cx-noche mb-2">Añadir a la lección</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="font-medium text-cx-noche mb-2">Archivo (vídeo, audio, PDF…)</p>
          <AddFileBlockForm serviceId={id} itemId={itemId} />
        </Card>
        <div className="grid gap-4 content-start">
          <Card className="p-5">
            <p className="font-medium text-cx-noche mb-2">Texto</p>
            <form action={addTextBlock} className="grid gap-2">
              <input type="hidden" name="service_id" value={id} />
              <input type="hidden" name="item_id" value={itemId} />
              <textarea name="text" rows={4} required placeholder="Escribe aquí el texto de la lección" className={INPUT} />
              <button className={`${BTN_SECONDARY} w-fit`}>Añadir texto</button>
            </form>
          </Card>
          <Card className="p-5">
            <p className="font-medium text-cx-noche mb-2">Enlace externo</p>
            <form action={addLinkBlock} className="grid gap-2">
              <input type="hidden" name="service_id" value={id} />
              <input type="hidden" name="item_id" value={itemId} />
              <input name="title" placeholder="Texto del enlace (opcional)" className={INPUT} />
              <input name="url" type="url" required placeholder="https://..." className={INPUT} />
              <button className={`${BTN_SECONDARY} w-fit`}>Añadir enlace</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
