"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Guarda la descripción y, si se ha elegido una, la foto del vendedor.
// La foto es opcional: si no se sube ninguna, se conserva la actual.
export async function updateBio(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const bio = formData.get("bio") as string;
  const cambios: { bio: string; avatar_url?: string } = { bio };
  let errorFoto = false;

  const avatar = formData.get("avatar") as File | null;
  if (avatar && avatar.size > 0) {
    const tipoOk = avatar.type.startsWith("image/");
    const tamanoOk = avatar.size <= 4 * 1024 * 1024;

    if (!tipoOk || !tamanoOk) {
      errorFoto = true;
    } else {
      const ext = (avatar.name.split(".").pop() || "jpg").toLowerCase();
      const fileName = `avatar-${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("service-images")
        .upload(fileName, avatar);

      if (uploadError) {
        console.error("[updateBio] Error subiendo la foto:", uploadError.message);
        errorFoto = true;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("service-images")
          .getPublicUrl(fileName);
        cambios.avatar_url = publicUrlData.publicUrl;
      }
    }
  }

  await supabase.from("providers").update(cambios).eq("user_id", user.id);

  revalidatePath("/dashboard/perfil");
  redirect(
    errorFoto ? "/dashboard/perfil?saved=1&error=foto" : "/dashboard/perfil?saved=1"
  );
}

// Guarda el teléfono y, si ha cambiado, pide el cambio de email.
// El email NO se cambia al instante: Supabase manda un enlace de
// confirmación y el cambio solo se aplica cuando el usuario lo confirma
// (así nadie puede cambiarlo con una sesión ajena). La copia de
// public.users.email se sincroniza sola al abrir el perfil (ver page.tsx)
// una vez que el cambio queda confirmado.
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

    // emailRedirectTo: a dónde se vuelve tras pulsar el enlace de
    // confirmación del email. Si esa dirección no está en la lista de
    // URLs permitidas de Supabase, se usa la "Site URL" por defecto.
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/perfil` }
    );
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
    redirect("/dashboard/perfil?error=password_corta");
  }
  if (nueva !== repetida) {
    redirect("/dashboard/perfil?error=password_coinciden");
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: actual,
  });
  if (loginError) {
    redirect("/dashboard/perfil?error=password_actual");
  }

  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) {
    console.error("[cambiarPassword] Error:", error.message);
    redirect("/dashboard/perfil?error=password");
  }

  redirect("/dashboard/perfil?passwordOk=1");
}
