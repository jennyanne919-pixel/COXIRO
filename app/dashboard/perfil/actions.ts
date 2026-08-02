"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateBio(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const bio = formData.get("bio") as string;

  await supabase.from("providers").update({ bio }).eq("user_id", user.id);

  revalidatePath("/dashboard/perfil");
  redirect("/dashboard/perfil?saved=1");
}
