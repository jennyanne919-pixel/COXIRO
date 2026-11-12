"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tieneAcceso } from "@/lib/content-access";
import { sendLessonComment } from "@/lib/email/send";
import { redirect } from "next/navigation";

const MAX = 2000;
const MAX_POR_HORA = 20;

async function nombreDe(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const [{ data: p }, { data: c }] = await Promise.all([
    admin.from("providers").select("business_name").eq("user_id", userId).maybeSingle(),
    admin.from("clients").select("billing_name").eq("user_id", userId).maybeSingle(),
  ]);
  return (p as any)?.business_name || (c as any)?.billing_name || "Un alumno";
}

async function emailDe(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await admin.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

// Publica una duda (comentario nuevo) o una respuesta (con parent_id).
export async function publicarComentario(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const parentId = String(formData.get("parent_id") ?? "") || null;
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX);
  const volver = `/curso/${serviceId}?leccion=${itemId}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(volver)}`);
  if (!body) redirect(`${volver}#dudas`);

  const admin = createAdminClient();
  const { data: item } = await admin
    .from("content_items")
    .select("id, title, service_id, status, services ( title, provider_id, comments_enabled )")
    .eq("id", itemId)
    .maybeSingle();
  if (!item || item.service_id !== serviceId) redirect(`/dashboard`);

  const servicio = item.services as any;
  const esDueno = servicio?.provider_id === user.id;
  if (!servicio?.comments_enabled) redirect(volver);
  if (!esDueno && !(await tieneAcceso(admin, user.id, serviceId))) redirect(`/servicio/${serviceId}`);
  if (!esDueno && item.status !== "published") redirect(`/curso/${serviceId}`);

  // Freno sencillo contra spam.
  const desde = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin
    .from("lesson_comments")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .gte("created_at", desde);
  if ((count ?? 0) >= MAX_POR_HORA) redirect(`${volver}&limite=1#dudas`);

  // Una respuesta solo puede colgar de una duda de la misma lección.
  let padre: { id: string; author_id: string; parent_id: string | null } | null = null;
  if (parentId) {
    const { data } = await admin
      .from("lesson_comments")
      .select("id, author_id, parent_id, item_id")
      .eq("id", parentId)
      .maybeSingle();
    if (!data || data.item_id !== itemId || data.parent_id) redirect(`${volver}#dudas`);
    padre = data;
  }

  const { error } = await admin.from("lesson_comments").insert({
    item_id: itemId,
    service_id: serviceId,
    author_id: user.id,
    parent_id: parentId,
    body,
    is_instructor: esDueno,
  });
  if (error) {
    console.error("Error guardando comentario:", error);
    redirect(`${volver}&error=1#dudas`);
  }

  // Aviso por email: el alumno avisa al profesional; el profesional avisa al autor de la duda.
  try {
    const autor = await nombreDe(admin, user.id);
    const enlaceBase = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    let destinoId: string | null = null;
    if (!esDueno) destinoId = servicio.provider_id;
    else if (padre && padre.author_id !== user.id) destinoId = padre.author_id;

    if (destinoId) {
      const to = await emailDe(admin, destinoId);
      if (to) {
        await sendLessonComment({
          to,
          destinatario: await nombreDe(admin, destinoId),
          autor,
          leccion: item.title,
          servicio: servicio.title,
          texto: body.length > 400 ? `${body.slice(0, 400)}…` : body,
          enlace: `${enlaceBase}/curso/${serviceId}?leccion=${itemId}#dudas`,
          esRespuesta: esDueno,
        });
      }
    }
  } catch (e) {
    console.error("Error avisando del comentario:", e);
  }

  redirect(`${volver}#dudas`);
}

// Borra un comentario: su autor o el profesional dueño del servicio.
export async function borrarComentario(formData: FormData) {
  const commentId = String(formData.get("comment_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  const { data: c } = await admin
    .from("lesson_comments")
    .select("id, author_id, item_id, service_id, services ( provider_id )")
    .eq("id", commentId)
    .maybeSingle();
  if (!c) return;
  const esDueno = (c.services as any)?.provider_id === user.id;
  if (c.author_id === user.id || esDueno) {
    await admin.from("lesson_comments").delete().eq("id", commentId);
  }
  redirect(`/curso/${c.service_id}?leccion=${c.item_id}#dudas`);
}

// El profesional marca una duda como resuelta (o la reabre).
export async function resolverComentario(formData: FormData) {
  const commentId = String(formData.get("comment_id") ?? "");
  const valor = String(formData.get("valor") ?? "") === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  const { data: c } = await admin
    .from("lesson_comments")
    .select("id, item_id, service_id, parent_id, services ( provider_id )")
    .eq("id", commentId)
    .maybeSingle();
  if (!c || c.parent_id || (c.services as any)?.provider_id !== user.id) return;
  await admin.from("lesson_comments").update({ resolved: valor }).eq("id", commentId);
  redirect(`/curso/${c.service_id}?leccion=${c.item_id}#dudas`);
}
