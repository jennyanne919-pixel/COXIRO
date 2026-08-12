"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendWaitlistWelcome } from "@/lib/email/send";

export async function joinWaitlist(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const tipoServicio = formData.get("tipo_servicio") as string;
  const fuente = (formData.get("fuente") as string) || "directo";

  if (!nombre || !email || !tipoServicio) {
    return { success: false, error: "Faltan datos por rellenar." };
  }

  const admin = createAdminClient();

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

  await sendWaitlistWelcome({ to: email, nombre });

  return { success: true, yaEstaba: false };
}
