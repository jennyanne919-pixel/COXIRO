import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONDICIONES_DOCUMENTO, CONDICIONES_VERSION } from "@/lib/condiciones";

// Guarda la prueba de que un profesional aceptó las condiciones: quién,
// qué versión, cuándo, desde qué IP y con qué comisión. Solo el servidor
// puede escribir en esta tabla (se salta RLS con la clave de servicio).
export async function registrarAceptacion(userId: string, source: "registro" | "reaceptacion") {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim() || null;
  const userAgent = (h.get("user-agent") ?? "").slice(0, 300) || null;

  const admin = createAdminClient();
  const { data: provider } = await admin
    .from("providers")
    .select("commission_rate")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = await admin.from("provider_acceptances").insert({
    user_id: userId,
    document: CONDICIONES_DOCUMENTO,
    version: CONDICIONES_VERSION,
    ip,
    user_agent: userAgent,
    commission_rate: provider?.commission_rate ?? null,
    source,
  });
  return !error;
}

// ¿Ha aceptado este profesional la versión vigente? (lee con su propia
// sesión: la política RLS le deja ver solo sus filas).
export async function tieneAceptacionVigente(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("provider_acceptances")
    .select("id")
    .eq("user_id", userId)
    .eq("document", CONDICIONES_DOCUMENTO)
    .eq("version", CONDICIONES_VERSION)
    .limit(1);
  return (data?.length ?? 0) > 0;
}
