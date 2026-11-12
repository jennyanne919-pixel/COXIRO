"use server";

import { deleteFile, getFileSize } from "@/lib/r2";
import { MAX_ARCHIVO_BYTES, fmtBytes, getAlmacenamiento } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Cliente = Awaited<ReturnType<typeof createClient>>;

// Devuelve el usuario solo si es el dueño del servicio. (RLS ya lo exige en
// la base de datos; esta comprobación explícita es una segunda barrera.)
async function comoDueno(serviceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !serviceId) return null;
  const { data: service } = await supabase
    .from("services")
    .select("provider_id")
    .eq("id", serviceId)
    .single();
  if (!service || service.provider_id !== user.id) return null;
  return { supabase, user };
}

const refrescar = (serviceId: string, itemId?: string) => {
  revalidatePath(`/dashboard/servicios/${serviceId}/contenido`);
  if (itemId) revalidatePath(`/dashboard/servicios/${serviceId}/contenido/${itemId}`);
};

// Mueve el elemento `id` una posición arriba/abajo dentro de `ids` (ya
// ordenados) y devuelve el nuevo orden.
function mover(ids: string[], id: string, dir: string) {
  const i = ids.indexOf(id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return null;
  const copia = [...ids];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}

async function guardarOrden(supabase: Cliente, tabla: string, ids: string[]) {
  await Promise.all(
    ids.map((id, n) => supabase.from(tabla).update({ [tabla === "lesson_blocks" ? "position" : "sort_order"]: n }).eq("id", id))
  );
}

// ---------------------------------------------------------------- Secciones

export async function addSection(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 150);
  const ctx = await comoDueno(serviceId);
  if (!ctx || !title) return;

  const { data: ult } = await ctx.supabase
    .from("course_sections")
    .select("sort_order")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await ctx.supabase
    .from("course_sections")
    .insert({ service_id: serviceId, title, sort_order: (ult?.sort_order ?? -1) + 1 });
  refrescar(serviceId);
}

export async function setComentarios(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const activar = String(formData.get("activar") ?? "") === "1";
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;
  await ctx.supabase.from("services").update({ comments_enabled: activar }).eq("id", serviceId);
  refrescar(serviceId);
  revalidatePath(`/curso/${serviceId}`);
}

export async function renameSection(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const id = String(formData.get("section_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 150);
  const ctx = await comoDueno(serviceId);
  if (!ctx || !title) return;
  await ctx.supabase.from("course_sections").update({ title }).eq("id", id).eq("service_id", serviceId);
  refrescar(serviceId);
}

export async function deleteSection(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const id = String(formData.get("section_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;
  // Las lecciones de la sección no se borran: pasan a "Sin sección".
  await ctx.supabase.from("course_sections").delete().eq("id", id).eq("service_id", serviceId);
  refrescar(serviceId);
}

export async function moveSection(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const id = String(formData.get("section_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;
  const { data: filas } = await ctx.supabase
    .from("course_sections")
    .select("id")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });
  const nuevo = mover((filas ?? []).map((f) => f.id), id, String(formData.get("dir")));
  if (nuevo) await guardarOrden(ctx.supabase, "course_sections", nuevo);
  refrescar(serviceId);
}

// ---------------------------------------------------------------- Lecciones

export async function addLesson(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const sectionId = String(formData.get("section_id") ?? "") || null;
  const ctx = await comoDueno(serviceId);
  if (!ctx || !title) return;

  let q = ctx.supabase
    .from("content_items")
    .select("sort_order")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: false })
    .limit(1);
  q = sectionId ? q.eq("section_id", sectionId) : q.is("section_id", null);
  const { data: ult } = await q.maybeSingle();

  const { data: nueva, error } = await ctx.supabase
    .from("content_items")
    .insert({
      service_id: serviceId,
      title,
      content_type: "lesson",
      section_id: sectionId,
      status: "draft",
      sort_order: (ult?.sort_order ?? -1) + 1,
    })
    .select("id")
    .single();

  if (error || !nueva) {
    console.error("[addLesson]", error);
    return;
  }
  redirect(`/dashboard/servicios/${serviceId}/contenido/${nueva.id}`);
}

export async function moveLesson(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const id = String(formData.get("item_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;
  const { data: item } = await ctx.supabase
    .from("content_items")
    .select("section_id")
    .eq("id", id)
    .eq("service_id", serviceId)
    .single();
  if (!item) return;
  let q = ctx.supabase.from("content_items").select("id").eq("service_id", serviceId);
  q = item.section_id ? q.eq("section_id", item.section_id) : q.is("section_id", null);
  const { data: filas } = await q.order("sort_order", { ascending: true });
  const nuevo = mover((filas ?? []).map((f) => f.id), id, String(formData.get("dir")));
  if (nuevo) await guardarOrden(ctx.supabase, "content_items", nuevo);
  refrescar(serviceId);
}

export async function updateLesson(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const id = String(formData.get("item_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const sectionId = String(formData.get("section_id") ?? "") || null;
  const status = formData.get("status") === "published" ? "published" : "draft";
  const ctx = await comoDueno(serviceId);
  if (!ctx || !title) return;

  if (sectionId) {
    const { data: s } = await ctx.supabase
      .from("course_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("service_id", serviceId)
      .maybeSingle();
    if (!s) return;
  }

  await ctx.supabase
    .from("content_items")
    .update({ title, section_id: sectionId, status, is_free: formData.get("is_free") === "on" })
    .eq("id", id)
    .eq("service_id", serviceId);
  refrescar(serviceId, id);
}

// Borra una lección y TODOS sus archivos de R2 (si no, seguirían costando).
export async function deleteContentItem(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;

  const { data: bloques } = await ctx.supabase
    .from("lesson_blocks")
    .select("r2_key")
    .eq("item_id", itemId);

  // "select" devuelve lo que se ha borrado de verdad (RLS solo deja borrar lo propio).
  const { data: borrados } = await ctx.supabase
    .from("content_items")
    .delete()
    .eq("id", itemId)
    .eq("service_id", serviceId)
    .select("r2_key");

  if (borrados?.length) {
    for (const b of borrados) await deleteFile(b.r2_key);
    for (const b of bloques ?? []) await deleteFile(b.r2_key);
  }
  refrescar(serviceId);
}

// ------------------------------------------------------------------ Bloques

async function siguientePosicion(supabase: Cliente, itemId: string) {
  const { data } = await supabase
    .from("lesson_blocks")
    .select("position")
    .eq("item_id", itemId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.position ?? -1) + 1;
}

async function leccionDelServicio(supabase: Cliente, itemId: string, serviceId: string) {
  const { data } = await supabase
    .from("content_items")
    .select("id")
    .eq("id", itemId)
    .eq("service_id", serviceId)
    .maybeSingle();
  return !!data;
}

export async function addTextBlock(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const texto = String(formData.get("text") ?? "").trim().slice(0, 20000);
  const ctx = await comoDueno(serviceId);
  if (!ctx || !texto || !(await leccionDelServicio(ctx.supabase, itemId, serviceId))) return;
  await ctx.supabase.from("lesson_blocks").insert({
    item_id: itemId,
    type: "text",
    text_content: texto,
    position: await siguientePosicion(ctx.supabase, itemId),
  });
  refrescar(serviceId, itemId);
}

export async function addLinkBlock(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200) || null;
  const ctx = await comoDueno(serviceId);
  if (!ctx || !(await leccionDelServicio(ctx.supabase, itemId, serviceId))) return;
  // Solo enlaces web (nada de javascript: ni similares).
  if (!/^https?:\/\/\S+$/i.test(url)) return;
  await ctx.supabase.from("lesson_blocks").insert({
    item_id: itemId,
    type: "link",
    url,
    title,
    position: await siguientePosicion(ctx.supabase, itemId),
  });
  refrescar(serviceId, itemId);
}

export async function updateTextBlock(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const blockId = String(formData.get("block_id") ?? "");
  const texto = String(formData.get("text") ?? "").trim().slice(0, 20000);
  const ctx = await comoDueno(serviceId);
  if (!ctx || !texto || !(await leccionDelServicio(ctx.supabase, itemId, serviceId))) return;
  await ctx.supabase
    .from("lesson_blocks")
    .update({ text_content: texto })
    .eq("id", blockId)
    .eq("item_id", itemId)
    .eq("type", "text");
  refrescar(serviceId, itemId);
}

// Se llama DESPUÉS de subir el archivo directo a R2 desde el navegador.
export async function addFileBlock(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const r2Key = String(formData.get("r2_key") ?? "");
  const mime = String(formData.get("mime") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200) || null;

  const ctx = await comoDueno(serviceId);
  if (!ctx) return { ok: false, error: "No autorizado" };
  if (!(await leccionDelServicio(ctx.supabase, itemId, serviceId))) {
    await deleteFile(r2Key.startsWith(`${serviceId}/`) ? r2Key : null);
    return { ok: false, error: "Lección no válida" };
  }
  // Un archivo solo puede colgarse del servicio al que se subió.
  if (!r2Key.startsWith(`${serviceId}/`)) return { ok: false, error: "Archivo no válido" };

  // Tamaño REAL del archivo en R2, no el que dice el navegador.
  const tam = await getFileSize(r2Key);
  if (tam === null) return { ok: false, error: "No se encontró el archivo subido" };

  const { usado, cuota } = await getAlmacenamiento(ctx.supabase, ctx.user.id);
  if (tam > MAX_ARCHIVO_BYTES || usado + tam > cuota) {
    await deleteFile(r2Key);
    return {
      ok: false,
      error:
        tam > MAX_ARCHIVO_BYTES
          ? `El archivo pesa demasiado. El máximo es ${fmtBytes(MAX_ARCHIVO_BYTES)} por archivo.`
          : "No queda espacio suficiente en tu cuenta.",
    };
  }

  const tipo = mime.startsWith("video/")
    ? "video"
    : mime.startsWith("audio/")
      ? "audio"
      : mime === "application/pdf"
        ? "pdf"
        : "file";

  const { error } = await ctx.supabase.from("lesson_blocks").insert({
    item_id: itemId,
    type: tipo,
    title,
    r2_key: r2Key,
    file_size: tam,
    position: await siguientePosicion(ctx.supabase, itemId),
  });
  if (error) {
    console.error("[addFileBlock]", error);
    await deleteFile(r2Key);
    return { ok: false, error: "No se pudo guardar el archivo" };
  }

  refrescar(serviceId, itemId);
  return { ok: true };
}

export async function moveBlock(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx || !(await leccionDelServicio(ctx.supabase, itemId, serviceId))) return;
  const { data: filas } = await ctx.supabase
    .from("lesson_blocks")
    .select("id")
    .eq("item_id", itemId)
    .order("position", { ascending: true });
  const nuevo = mover(
    (filas ?? []).map((f) => f.id),
    String(formData.get("block_id")),
    String(formData.get("dir"))
  );
  if (nuevo) await guardarOrden(ctx.supabase, "lesson_blocks", nuevo);
  refrescar(serviceId, itemId);
}

export async function deleteBlock(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const blockId = String(formData.get("block_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx || !(await leccionDelServicio(ctx.supabase, itemId, serviceId))) return;
  const { data: borrados } = await ctx.supabase
    .from("lesson_blocks")
    .delete()
    .eq("id", blockId)
    .eq("item_id", itemId)
    .select("r2_key");
  for (const b of borrados ?? []) await deleteFile(b.r2_key);
  refrescar(serviceId, itemId);
}

// Quita el archivo "original" de una lección antigua (subida antes de los bloques).
export async function removeLegacyFile(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;
  const { data: item } = await ctx.supabase
    .from("content_items")
    .select("r2_key")
    .eq("id", itemId)
    .eq("service_id", serviceId)
    .single();
  if (!item) return;
  await ctx.supabase
    .from("content_items")
    .update({ r2_key: null, file_url: null, file_size: null })
    .eq("id", itemId);
  await deleteFile(item.r2_key);
  refrescar(serviceId, itemId);
}
