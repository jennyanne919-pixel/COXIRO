"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendRecoveryEmail } from "@/lib/email/send";

const MAX_POR_HORA = 3;

// Pide el correo de recuperación. La respuesta es siempre la misma, exista
// o no la cuenta, para no revelar qué emails están registrados. Límite de
// 3 envíos por hora y email para que nadie pueda usarlo para molestar.
export async function pedirRecuperacion(emailBruto: string): Promise<{ ok: boolean }> {
  const email = String(emailBruto ?? "").trim().toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false };
  }

  try {
    const admin = createAdminClient();
    const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("email_logs")
      .select("id", { count: "exact", head: true })
      .eq("to_email", email)
      .eq("email_type", "password_recovery")
      .gte("created_at", desde);

    if ((count ?? 0) < MAX_POR_HORA) {
      await sendRecoveryEmail(email);
    }
  } catch (err) {
    console.error("[recuperar-contrasena] Error:", err);
  }

  return { ok: true };
}
