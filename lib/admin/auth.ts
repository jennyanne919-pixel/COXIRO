import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Solo los emails de ADMIN_EMAILS (variable de entorno, separados por
// coma) son administradores de Coxiro. Se comprueba en cada página,
// acción y ruta del panel: nunca basta con ocultar un enlace.
export function esAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdminEmail(user.email)) redirect("/login?next=/admin");
  return user;
}

// Versión para rutas API: devuelve null en vez de redirigir.
export async function adminOrNull() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && esAdminEmail(user.email) ? user : null;
}
