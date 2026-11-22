"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarAceptacion, categoriaDe } from "@/lib/acceptances";

export async function aceptarCondiciones(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "provider") redirect("/dashboard");

  const categoria = await categoriaDe(supabase, user.id);
  if (formData.get("declaracion") !== "on") redirect("/aceptar-condiciones?error=declaracion");
  const ok = await registrarAceptacion(user.id, "reaceptacion", categoria, true);
  if (!ok) redirect("/aceptar-condiciones?error=1");
  redirect("/dashboard");
}
