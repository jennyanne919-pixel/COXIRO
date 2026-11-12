"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function submitInquiry(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const message = String(formData.get("message") ?? "").trim().slice(0, 3000);

  const admin = createAdminClient();

  // Solo sobre servicios reales y activos, con datos razonables y un tope por
  // email y hora (evita que alguien llene la bandeja de un profesional).
  const emailOk = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
  const { data: existe } = /^[0-9a-f-]{36}$/i.test(serviceId)
    ? await admin.from("services").select("id").eq("id", serviceId).eq("is_active", true).maybeSingle()
    : { data: null };
  if (!existe || !name || !emailOk) {
    redirect(`/servicio/${serviceId}?error=datos`);
  }
  const { count: recientes } = await admin
    .from("service_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", new Date(Date.now() - 3600_000).toISOString());
  if ((recientes ?? 0) >= 3) redirect(`/servicio/${serviceId}?inquiry_sent=1`);

  // Guardamos siempre la solicitud primero -- esto es lo que nos da
  // constancia de que este lead pasó por Coxiro, aunque después se
  // le redirija a un formulario externo de la propia empresa.
  await admin.from("service_inquiries").insert({
    service_id: serviceId,
    name,
    email,
    message,
  });

  const { data: service } = await admin
    .from("services")
    .select("inquiry_url")
    .eq("id", serviceId)
    .single();

  if (service?.inquiry_url) {
    redirect(service.inquiry_url);
  }

  redirect(`/servicio/${serviceId}?inquiry_sent=1`);
}
