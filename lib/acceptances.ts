import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONDICIONES_DOCUMENTO, CONDICIONES_VERSION } from "@/lib/condiciones";
import { CATEGORIAS, CONDICIONES_CATEGORIA_VERSION, esCategoria, type Categoria } from "@/lib/categorias";

// Guarda la prueba de que un profesional aceptó las condiciones: quién,
// qué documento y versión, cuándo, desde qué IP, con qué comisión y, desde la
// fase 44, en qué categoría y con su declaración responsable. Solo el servidor
// puede escribir en esta tabla (se salta RLS con la clave de servicio).
export async function registrarAceptacion(
  userId: string,
  source: "registro" | "reaceptacion",
  categoria?: Categoria,
  declaracion = false
) {
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
    document: categoria ? CATEGORIAS[categoria].documento : CONDICIONES_DOCUMENTO,
    version: categoria ? CONDICIONES_CATEGORIA_VERSION : CONDICIONES_VERSION,
    ip,
    user_agent: userAgent,
    commission_rate: provider?.commission_rate ?? null,
    source,
    fiscal_category: categoria ?? null,
    declaration: declaracion,
  });
  if (!error && categoria) {
    // Al aceptar las condiciones de su categoría ya no hay nada pendiente.
    await admin.from("providers").update({ pending_new_conditions: false }).eq("user_id", userId);
  }
  return !error;
}

// Categoría actual del profesional (lee con su propia sesión).
export async function categoriaDe(supabase: SupabaseClient, userId: string): Promise<Categoria> {
  const { data } = await supabase.from("providers").select("fiscal_category").eq("user_id", userId).maybeSingle();
  return esCategoria(data?.fiscal_category) ? data.fiscal_category : "formacion";
}

// ¿Está al día este profesional? Vale haber aceptado la versión de siempre
// (profesionales anteriores a la fase 44, que siguen igual hasta que se les
// avise con 15 días) O el documento de su categoría actual. Si Coxiro ha pedido
// aceptar las condiciones nuevas (pending_new_conditions), solo vale la de su categoría.
export async function tieneAceptacionVigente(supabase: SupabaseClient, userId: string) {
  const { data: p } = await supabase
    .from("providers")
    .select("fiscal_category, pending_new_conditions")
    .eq("user_id", userId)
    .maybeSingle();
  const categoria: Categoria = esCategoria(p?.fiscal_category) ? p.fiscal_category : "formacion";
  const pendiente = p?.pending_new_conditions === true;

  const filtro = pendiente
    ? `and(document.eq.${CATEGORIAS[categoria].documento},version.eq.${CONDICIONES_CATEGORIA_VERSION})`
    : `and(document.eq.${CONDICIONES_DOCUMENTO},version.eq.${CONDICIONES_VERSION}),` +
      `and(document.eq.${CATEGORIAS[categoria].documento},version.eq.${CONDICIONES_CATEGORIA_VERSION})`;
  const { data } = await supabase.from("provider_acceptances").select("id").eq("user_id", userId).or(filtro).limit(1);
  return (data?.length ?? 0) > 0;
}
