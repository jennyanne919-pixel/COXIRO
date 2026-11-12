import type { SupabaseClient } from "@supabase/supabase-js";

const GB = 1024 * 1024 * 1024;

// Límites de almacenamiento (ver docs: Panel de contenido, guardarraíles).
export const MAX_ARCHIVO_BYTES = 5 * GB; // por archivo
export const CUOTA_POR_DEFECTO_GB = 50; // por proveedor, incluida en la comisión

export const fmtBytes = (b: number) =>
  b >= GB ? `${(b / GB).toFixed(1)} GB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

// Espacio que usa un proveedor (suma de sus archivos, incluidos los de
// servicios archivados: esos archivos se conservan) y su cuota.
export async function getAlmacenamiento(supabase: SupabaseClient, providerId: string) {
  const [{ data: filas }, { data: prov }] = await Promise.all([
    supabase
      .from("content_items")
      .select("id, file_size, services!inner(provider_id)")
      .eq("services.provider_id", providerId),
    supabase.from("providers").select("storage_quota_gb").eq("user_id", providerId).maybeSingle(),
  ]);

  // Archivos de las lecciones nuevas (bloques), en tandas para no alargar la URL.
  const ids = (filas ?? []).map((f: any) => f.id as string);
  const tandas: string[][] = [];
  for (let i = 0; i < ids.length; i += 100) tandas.push(ids.slice(i, i + 100));
  const resultados = await Promise.all(
    tandas.map((t) => supabase.from("lesson_blocks").select("file_size").in("item_id", t))
  );
  const usadoBloques = resultados.reduce(
    (tot, r) => tot + (r.data ?? []).reduce((t: number, b: any) => t + Number(b.file_size ?? 0), 0),
    0
  );

  const usado = (filas ?? []).reduce((t: number, f: any) => t + Number(f.file_size ?? 0), 0) + usadoBloques;
  const cuotaGb = Number((prov as any)?.storage_quota_gb ?? CUOTA_POR_DEFECTO_GB);
  return { usado, cuota: cuotaGb * GB };
}
