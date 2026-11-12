"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendWaitlistWelcome } from "@/lib/email/send";

export async function joinWaitlist(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const tipoServicio = String(formData.get("tipo_servicio") ?? "").trim().slice(0, 40);
  const fuente = (String(formData.get("fuente") ?? "").trim() || "directo").slice(0, 40);

  if (!nombre || !email || !tipoServicio) {
    return { success: false, error: "Faltan datos por rellenar." };
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[<>]/.test(nombre)) {
    return { success: false, error: "Revisa el email y el nombre." };
  }

  const admin = createAdminClient();

  // Tope global de emails de bienvenida por hora: evita que alguien use el
  // formulario para enviar correos en masa desde el dominio de Coxiro.
  const desde = new Date(Date.now() - 3600_000).toISOString();
  const { count: enviados } = await admin
    .from("email_logs")
    .select("id", { count: "exact", head: true })
    .eq("email_type", "waitlist_welcome")
    .gte("created_at", desde);
  const puedeEnviar = (enviados ?? 0) < 40;

  const { error } = await admin.from("waitlist").insert({
    nombre,
    email,
    tipo_servicio: tipoServicio,
    fuente,
  });

  if (error) {
    // El email ya está en la lista -- no lo tratamos como fallo real
    if (error.code === "23505") {
      return { success: true, yaEstaba: true };
    }
    console.error("[joinWaitlist] Error guardando en la lista:", error);
    return { success: false, error: "Algo ha fallado. Inténtalo de nuevo." };
  }

  if (puedeEnviar) await sendWaitlistWelcome({ to: email, nombre });

  return { success: true, yaEstaba: false };
}
