import type { SupabaseClient } from "@supabase/supabase-js";

// Un acceso vale si no tiene fecha de caducidad o esa fecha aún no ha
// llegado. Al reembolsar una compra se pone la caducidad a "ahora", y así
// se corta el acceso sin borrar el historial. Si el cliente tiene varias
// compras del mismo servicio, basta con que una siga vigente.
export const filtroAccesoVigente = () =>
  `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`;

// El acceso a un contenido grabado puede empezar más tarde (a los 14 días) si el
// alumno no pidió el inicio anticipado. Se añade con un segundo .or(), que se une
// con "y" al de filtroAccesoVigente.
export const filtroInicioAcceso = () =>
  `access_from.is.null,access_from.lte.${new Date().toISOString()}`;

export async function tieneAcceso(
  admin: SupabaseClient,
  clientId: string,
  serviceId: string
): Promise<boolean> {
  const { data } = await admin
    .from("content_access")
    .select("id")
    .eq("client_id", clientId)
    .eq("service_id", serviceId)
    .or(filtroAccesoVigente())
    .or(filtroInicioAcceso())
    .limit(1)
    .maybeSingle();
  return !!data;
}
