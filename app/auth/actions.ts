"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const next = formData.get("next") as string;
  redirect(next || "/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string; // "provider" | "client"
  const businessName = formData.get("business_name") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  const user = data.user;

  if (!user) {
    // Confirmación de email pendiente: todavía no hay sesión activa
    // para poder insertar el perfil. Se completa cuando confirme.
    redirect("/registro?check-email=1");
  }

  // Crea la fila base en "users"
  await supabase.from("users").insert({
    id: user.id,
    email,
    password_hash: "managed_by_supabase_auth",
    role,
    full_name: fullName,
  });

  // Crea el perfil específico según el rol elegido
  if (role === "provider") {
    const baseName = businessName || fullName;
    // Slug legible para la URL pública: minúsculas, sin acentos ni
    // símbolos, espacios -> guiones, + 4 caracteres del ID para
    // evitar choques entre dos profesionales con el mismo nombre.
    const slug =
      baseName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      user.id.slice(0, 4);

    await supabase.from("providers").insert({
      user_id: user.id,
      business_name: baseName,
      slug,
    });
  } else {
    await supabase.from("clients").insert({
      user_id: user.id,
      billing_name: fullName,
    });
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
