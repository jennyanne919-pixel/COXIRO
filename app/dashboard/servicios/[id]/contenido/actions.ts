"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addContentItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const serviceId = formData.get("service_id") as string;
  const title = formData.get("title") as string;
  const fileUrl = formData.get("file_url") as string;
  const contentType = formData.get("content_type") as string;

  // RLS ya garantiza que solo el proveedor dueño del servicio puede
  // insertar contenido en él (política "proveedores gestionan sus
  // servicios" cubre también content_items a través de su relación).
  await supabase.from("content_items").insert({
    service_id: serviceId,
    title,
    file_url: fileUrl,
    content_type: contentType,
  });

  revalidatePath(`/dashboard/servicios/${serviceId}/contenido`);
}

export async function updateContentItem(formData: FormData) {
  const supabase = await createClient();

  const itemId = formData.get("item_id") as string;
  const serviceId = formData.get("service_id") as string;
  const fileUrl = formData.get("file_url") as string;

  // RLS comprueba que quien edita es el dueño del servicio al que
  // pertenece este contenido -- si no lo es, esta actualización no
  // afecta a ninguna fila.
  await supabase
    .from("content_items")
    .update({ file_url: fileUrl })
    .eq("id", itemId);

  revalidatePath(`/dashboard/servicios/${serviceId}/contenido`);
}
