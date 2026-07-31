"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const type = formData.get("type") as string;
  const topic = formData.get("topic") as string;
  const isPublic = formData.get("is_public") === "on";
  const requiresInquiry = formData.get("requires_inquiry") === "on";
  const inquiryUrl = (formData.get("inquiry_url") as string) || null;

  // Subida de imagen (opcional) -- si el proveedor no adjunta nada,
  // el campo llega como un File vacío, se ignora sin más.
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("service-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Error subiendo la imagen del servicio:", uploadError);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("service-images")
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }
  }

  await supabase.from("services").insert({
    provider_id: user.id,
    title,
    description,
    price: Number(price) || 0,
    type,
    topic: topic || null,
    is_public: isPublic,
    requires_inquiry: requiresInquiry,
    inquiry_url: inquiryUrl,
    image_url: imageUrl,
  });

  revalidatePath("/dashboard/servicios");
}

export async function toggleServiceActive(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const isActive = formData.get("is_active") === "true";

  await supabase
    .from("services")
    .update({ is_active: !isActive })
    .eq("id", id);

  revalidatePath("/dashboard/servicios");
}

export async function toggleServicePublic(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const isPublic = formData.get("is_public") === "true";

  await supabase
    .from("services")
    .update({ is_public: !isPublic })
    .eq("id", id);

  revalidatePath("/dashboard/servicios");
}
