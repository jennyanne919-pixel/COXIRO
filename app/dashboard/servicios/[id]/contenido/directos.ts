"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { filtroAccesoVigente } from "@/lib/content-access";
import { madridAIso, fechaMadrid } from "@/lib/fechas";
import { sendLiveSession } from "@/lib/email/send";
import { revalidatePath } from "next/cache";

const MAX_AVISOS = 300;

async function comoDueno(serviceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !serviceId) return null;
  const { data: service } = await supabase
    .from("services")
    .select("id, title, provider_id")
    .eq("id", serviceId)
    .single();
  if (!service || service.provider_id !== user.id) return null;
  return { user, service };
}

const refrescar = (serviceId: string) => {
  revalidatePath(`/dashboard/servicios/${serviceId}/contenido`);
  revalidatePath(`/curso/${serviceId}`);
};

export async function addDirecto(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 150);
  const url = String(formData.get("join_url") ?? "").trim().slice(0, 500);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 1000) || null;
  const startsAt = madridAIso(String(formData.get("starts_at") ?? ""));
  const ctx = await comoDueno(serviceId);
  if (!ctx || !title || !startsAt || !/^https?:\/\//i.test(url)) return;

  await createAdminClient()
    .from("live_sessions")
    .insert({ service_id: serviceId, title, starts_at: startsAt, join_url: url, notes });
  refrescar(serviceId);
}

export async function deleteDirecto(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const id = String(formData.get("session_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;
  await createAdminClient().from("live_sessions").delete().eq("id", id).eq("service_id", serviceId);
  refrescar(serviceId);
}

// Avisa por email a quien tiene acceso vigente al servicio. Una sola vez por sesión.
export async function avisarDirecto(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const id = String(formData.get("session_id") ?? "");
  const ctx = await comoDueno(serviceId);
  if (!ctx) return;

  const admin = createAdminClient();
  const { data: sesion } = await admin
    .from("live_sessions")
    .select("id, title, starts_at, notes, notified_at")
    .eq("id", id)
    .eq("service_id", serviceId)
    .maybeSingle();
  if (!sesion || sesion.notified_at) return;

  // Se marca antes de enviar para que un doble clic no duplique los emails.
  const { data: marcada } = await admin
    .from("live_sessions")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", id)
    .is("notified_at", null)
    .select("id");
  if (!marcada?.length) return;

  const { data: accesos } = await admin
    .from("content_access")
    .select("client_id")
    .eq("service_id", serviceId)
    .or(filtroAccesoVigente());
  const clientes = [...new Set((accesos ?? []).map((a) => a.client_id))].slice(0, MAX_AVISOS);

  const [{ data: prov }, { data: datos }] = await Promise.all([
    admin.from("providers").select("business_name").eq("user_id", ctx.user.id).maybeSingle(),
    clientes.length
      ? admin.from("clients").select("user_id, billing_name").in("user_id", clientes)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const nombres = new Map((datos ?? []).map((c: any) => [c.user_id, c.billing_name]));
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  for (const clientId of clientes) {
    try {
      const { data } = await admin.auth.admin.getUserById(clientId);
      const to = data?.user?.email;
      if (!to) continue;
      await sendLiveSession({
        to,
        nombre: nombres.get(clientId) ?? "",
        servicio: ctx.service.title,
        proveedor: (prov as any)?.business_name ?? "Tu profesional",
        titulo: sesion.title,
        cuando: fechaMadrid(sesion.starts_at),
        notas: sesion.notes ?? undefined,
        enlace: `${base}/curso/${serviceId}`,
      });
    } catch (e) {
      console.error("Error avisando de la sesión en directo:", e);
    }
  }
  refrescar(serviceId);
}
