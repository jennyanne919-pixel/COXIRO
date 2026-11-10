import { rolEfectivo } from "@/lib/admin/vista";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PasswordField from "@/components/PasswordField";
import { updateDatos, cambiarPassword } from "./actions";

const ERRORES: Record<string, string> = {
  email:
    "No se ha podido cambiar el email. Comprueba que es válido y que no está ya registrado en Coxiro.",
  telefono:
    "El teléfono no es válido. Usa solo números, con o sin prefijo (por ejemplo +34 600 000 000).",
  password_actual: "La contraseña actual no es correcta.",
  password_coinciden: "La contraseña nueva y su repetición no coinciden.",
  password_corta:
    "La contraseña nueva debe tener al menos 8 caracteres, con una mayúscula, una minúscula, un número y un símbolo.",
  password: "No se ha podido cambiar la contraseña. Inténtalo de nuevo.",
};

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    emailPending?: string;
    passwordOk?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from("users")
    .select("email, phone, full_name, role")
    .eq("id", user.id)
    .single();

  // Los vendedores tienen su propio perfil.
  if ((await rolEfectivo(user.email, appUser?.role)) === "provider") {
    redirect("/dashboard/perfil");
  }

  // Si el usuario confirmó un cambio de email, el login (Supabase Auth)
  // ya tiene el email nuevo pero public.users todavía el viejo. Se
  // sincroniza aquí para que los emails de compra lleguen bien.
  if (user.email && appUser && appUser.email !== user.email) {
    await admin.from("users").update({ email: user.email }).eq("id", user.id);
  }

  const mensajeError = sp.error ? ERRORES[sp.error] : null;

  return (
    <div>
      <PageHeader title="Mi perfil" subtitle="Tus datos de cuenta. Son privados." />

      {sp.saved && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          Datos guardados correctamente.
        </p>
      )}

      {sp.passwordOk && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          Contraseña cambiada correctamente.
        </p>
      )}

      {sp.emailPending && (
        <p className="text-sm text-cx-texto-2 bg-cx-hielo border border-cx-borde rounded-lg px-3 py-2 mb-4 max-w-lg">
          Te hemos enviado un enlace de confirmación a tu email actual y otro
          al nuevo. El cambio se aplica cuando confirmes los dos.
        </p>
      )}

      {mensajeError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          {mensajeError}
        </p>
      )}

      <div className="mb-4 max-w-lg">
        <h2 className="text-base font-medium">Datos personales</h2>
      </div>

      <form action={updateDatos} className="rounded-2xl bg-white border border-cx-borde p-5 grid gap-3 max-w-lg">
        <div>
          <label className="text-xs text-cx-texto-2 block mb-1">Nombre</label>
          <p className="w-full rounded-lg border border-cx-borde bg-white/60 px-3.5 py-2 text-sm text-cx-texto">
            {appUser?.full_name ?? "—"}
          </p>
          <p className="text-xs text-cx-texto-2 mt-1">
            El nombre no se puede cambiar desde aquí porque es el que figura en
            tus facturas. Si necesitas corregirlo, escríbenos a{" "}
            <a href="mailto:coxiro.info@gmail.com" className="text-cx-prof underline">
              coxiro.info@gmail.com
            </a>
            .
          </p>
        </div>
        <div>
          <label className="text-xs text-cx-texto-2 block mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            defaultValue={user.email ?? ""}
            className="w-full rounded-lg border border-cx-borde bg-white px-3.5 py-2 text-sm"
          />
          <p className="text-xs text-cx-texto-2 mt-1">
            Para cambiarlo, escribe el email nuevo y pulsa Guardar. Te
            enviaremos un enlace de confirmación a tu email actual y otro al
            nuevo; el cambio se aplica cuando confirmes los dos.
          </p>
          {user.new_email && (
            <p className="text-xs text-cx-prof mt-1">
              Cambio pendiente de confirmar: {user.new_email}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs text-cx-texto-2 block mb-1">Teléfono</label>
          <input
            type="tel"
            name="phone"
            defaultValue={appUser?.phone ?? ""}
            placeholder="+34 600 000 000"
            className="w-full rounded-lg border border-cx-borde bg-white px-3.5 py-2 text-sm"
          />
        </div>
        <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold py-2.5 mt-1 hover:brightness-105 transition">
          Guardar
        </button>
      </form>

      <div className="mt-8 mb-4 max-w-lg">
        <h2 className="text-base font-medium">Cambiar contraseña</h2>
        <p className="text-sm text-cx-texto-2 mt-0.5">
          Escribe tu contraseña actual y la nueva dos veces. Pulsa el ojo para
          ver lo que escribes.
        </p>
      </div>

      <form action={cambiarPassword} className="rounded-2xl bg-white border border-cx-borde p-5 grid gap-3 max-w-lg">
        <PasswordField
          name="current_password"
          label="Contraseña actual"
          autoComplete="current-password"
        />
        <PasswordField
          name="new_password"
          label="Contraseña nueva"
          autoComplete="new-password"
          minLength={8}
        />
        <p className="text-xs text-cx-texto-2 -mt-1">
          Mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un símbolo.
        </p>
        <PasswordField
          name="confirm_password"
          label="Repite la contraseña nueva"
          autoComplete="new-password"
          minLength={8}
        />
        <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold py-2.5 mt-1 hover:brightness-105 transition">
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
}
