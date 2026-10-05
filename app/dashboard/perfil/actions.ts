"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

// Guarda el teléfono y, si ha cambiado, pide el cambio de email.
// El email NO se cambia al instante: Supabase manda un enlace de
// confirmación al correo nuevo y el cambio solo se aplica cuando el
// usuario lo confirma (así nadie puede cambiarlo con una sesión ajena).
// La copia de public.users.email se sincroniza sola al abrir el perfil
// (ver page.tsx) una vez que el cambio queda confirmado.
export async function updateContacto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const phone = String(formData.get("phone") ?? "").trim();
  const newEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  if (phone && !/^\+?[0-9 ()-]{6,20}$/.test(phone)) {
    redirect("/dashboard/perfil?error=telefono");
  }

  // Se usa el cliente admin porque la tabla users puede no permitir
  // al propio usuario actualizar su fila; el id sale de la sesión
  // verificada (getUser), no del formulario, así que es seguro.
  const admin = createAdminClient();
  await admin
    .from("users")
    .update({ phone: phone || null })
    .eq("id", user.id);

  let emailPendiente = false;
  if (newEmail && newEmail !== (user.email ?? "").toLowerCase()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      redirect("/dashboard/perfil?error=email");
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      console.error("[updateContacto] Error cambiando el email:", error.message);
      redirect("/dashboard/perfil?error=email");
    }
    emailPendiente = true;
  }

  revalidatePath("/dashboard/perfil");
  redirect(
    emailPendiente
      ? "/dashboard/perfil?saved=1&emailPending=1"
      : "/dashboard/perfil?saved=1"
  );
}