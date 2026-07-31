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
  const contentType = formData.get("content_type") as string;
  const isFree = formData.get("is_free") === "on";
  const fileUrl = (formData.get("file_url") as string) || null;
  const r2Key = (formData.get("r2_key") as string) || null;
  const fileSize = formData.get("file_size")
    ? Number(formData.get("file_size"))
    : null;

  // Comprobación explícita de propiedad, aunque RLS ya proteja esto
  const { data: service } = await supabase
    .from("services")
    .select("provider_id")
    .eq("id", serviceId)
    .single();

  if (!service || service.provider_id !== user.id) return;

  const { error: insertError } = await supabase.from("content_items").insert({
    service_id: serviceId,
    title,
    content_type: contentType,
    file_url: fileUrl,
    r2_key: r2Key,
    is_free: isFree,
    file_size: fileSize,
  });

  if (insertError) {
    console.error("[addContentItem] Error guardando el contenido:", insertError);
  }

  revalidatePath(`/dashboard/servicios/${serviceId}/contenido`);
}

export async function updateContentItem(formData: FormData) {
  const supabase = await createClient();
  const itemId = formData.get("item_id") as string;
  const serviceId = formData.get("service_id") as string;
  const fileUrl = formData.get("file_url") as string;

  await supabase
    .from("content_items")
    .update({ file_url: fileUrl })
    .eq("id", itemId);

  revalidatePath(`/dashboard/servicios/${serviceId}/contenido`);
}

export async function deleteContentItem(formData: FormData) {
  const supabase = await createClient();
  const itemId = formData.get("item_id") as string;
  const serviceId = formData.get("service_id") as string;

  await supabase.from("content_items").delete().eq("id", itemId);

  revalidatePath(`/dashboard/servicios/${serviceId}/contenido`);
}
