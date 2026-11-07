"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registrarAceptacion } from "@/lib/acceptances";

export async function aceptarCondiciones() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "provider") redirect("/dashboard");

  const ok = await registrarAceptacion(user.id, "reaceptacion");
  if (!ok) redirect("/aceptar-condiciones?error=1");
  redirect("/dashboard");
}
