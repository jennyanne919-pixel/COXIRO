"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Guarda nombre y teléfono y, si ha cambiado, pide el cambio de email.
// El email NO se cambia al instante: Supabase manda un enlace de
// confirmación al email actual y otro al nuevo, y el cambio solo se
// aplica cuando se confirman los dos. La copia de public.users.email se
// sincroniza sola al abrir la página (ver page.tsx).
export async function updateDatos(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const nombre = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const newEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!nombre || nombre.length > 100) {
    redirect("/dashboard/mi-cuenta?error=nombre");
  }
  if (phone && !/^\+?[0-9 ()-]{6,20}$/.test(phone)) {
    redirect("/dashboard/mi-cuenta?error=telefono");
  }

  // Cliente admin: la tabla users puede no dejar al propio usuario
  // actualizar su fila. El id sale de la sesión verificada, no del
  // formulario, así que es seguro.
  const admin = createAdminClient();
  await admin
    .from("users")
    .update({ full_name: nombre, phone: phone || null })
    .eq("id", user.id);

  let emailPendiente = false;
  if (newEmail && newEmail !== (user.email ?? "").toLowerCase()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      redirect("/dashboard/mi-cuenta?error=email");
    }

    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/mi-cuenta` }
    );
    if (error) {
      console.error("[mi-cuenta] Error cambiando el email:", error.message);
      redirect("/dashboard/mi-cuenta?error=email");
    }
    emailPendiente = true;
  }

  revalidatePath("/dashboard/mi-cuenta");
  redirect(
    emailPendiente
      ? "/dashboard/mi-cuenta?saved=1&emailPending=1"
      : "/dashboard/mi-cuenta?saved=1"
  );
}

// Cambio de contraseña: pide la actual, la nueva y la repetición.
// La actual se comprueba iniciando sesión con ella; si no coincide,
// no se cambia nada.
export async function cambiarPassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return;

  const actual = String(formData.get("current_password") ?? "");
  const nueva = String(formData.get("new_password") ?? "");
  const repetida = String(formData.get("confirm_password") ?? "");

  if (nueva.length < 8) {
    redirect("/dashboard/mi-cuenta?error=password_corta");
  }
  if (nueva !== repetida) {
    redirect("/dashboard/mi-cuenta?error=password_coinciden");
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: actual,
  });
  if (loginError) {
    redirect("/dashboard/mi-cuenta?error=password_actual");
  }

  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) {
    console.error("[mi-cuenta] Error cambiando la contraseña:", error.message);
    redirect("/dashboard/mi-cuenta?error=password");
  }

  redirect("/dashboard/mi-cuenta?passwordOk=1");
}
