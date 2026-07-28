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
  const isPublic = formData.get("is_public") === "on";

  await supabase.from("services").insert({
    provider_id: user.id,
    title,
    description,
    price: Number(price),
    type,
    is_public: isPublic,
  });

  revalidatePath("/dashboard/servicios");
}

export async function toggleServiceActive(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const isActive = formData.get("is_active") === "true";

  // RLS ya garantiza que solo el proveedor dueño puede modificar esta fila
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
