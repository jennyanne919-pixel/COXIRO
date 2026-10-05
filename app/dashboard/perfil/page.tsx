import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PasswordField from "@/components/PasswordField";
import { updateBio, updateContacto, cambiarPassword } from "./actions";

const ERRORES: Record<string, string> = {
  email:
    "No se ha podido cambiar el email. Comprueba que es válido y que no está ya registrado en Coxiro.",
  telefono:
    "El teléfono no es válido. Usa solo números, con o sin prefijo (por ejemplo +34 600 000 000).",
  foto: "No se ha podido subir la foto. Usa una imagen (JPG, PNG o WebP) de máximo 4 MB. La descripción sí se ha guardado.",
  password_actual: "La contraseña actual no es correcta.",
  password_coinciden: "La contraseña nueva y su repetición no coinciden.",
  password_corta: "La contraseña nueva debe tener al menos 8 caracteres.",
  password: "No se ha podido cambiar la contraseña. Inténtalo de nuevo.",
};

export default async function PerfilPage({
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

  const { data: provider } = await supabase
    .from("providers")
    .select("business_name, bio, slug, avatar_url, stripe_account_id, kyc_status")
    .eq("user_id", user?.id ?? "")
    .single();

  // Si el usuario confirmó un cambio de email, el login (Supabase Auth)
  // ya tiene el email nuevo pero public.users todavía el viejo. Se
  // sincroniza aquí para que los emails de compra/venta lleguen bien.
  const admin = createAdminClient();
  const { data: appUser } = await admin
    .from("users")
    .select("email, phone")
    .eq("id", user?.id ?? "")
    .single();

  if (user?.email && appUser && appUser.email !== user.email) {
    await admin.from("users").update({ email: user.email }).eq("id", user.id);
  }

  const mensajeError = sp.error ? ERRORES[sp.error] : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Mi perfil</h1>
        <p className="text-sm text-stone mt-0.5">
          Esto es lo que verán tus clientes antes de comprarte
        </p>
        {provider?.slug && (
          <a
            href={`/${provider.slug}`}
            target="_blank"
            className="inline-block text-sm text-copper hover:underline mt-2"
          >
            Ver mi perfil público →
          </a>
        )}
      </div>

      {sp.saved && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          Perfil guardado correctamente.
        </p>
      )}

      {sp.passwordOk && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          Contraseña cambiada correctamente.
        </p>
      )}

      {sp.emailPending && (
        <p className="text-sm text-stone bg-paper border border-stone/25 rounded-lg px-3 py-2 mb-4 max-w-lg">
          Te hemos enviado un enlace de confirmación a tu email actual y otro
          al nuevo. El cambio se aplica cuando confirmes los dos.
        </p>
      )}

      {mensajeError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          {mensajeError}
        </p>
      )}

      <form action={updateBio} className="rounded-lg bg-paper p-5 grid gap-3 max-w-lg">
        <div>
          <label className="text-xs text-stone block mb-2">
            Tu foto (aparece junto a tu descripción)
          </label>
          <div className="flex items-center gap-4">
            {provider?.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt="Tu foto de perfil"
                className="w-20 h-20 rounded-full object-cover border border-stone/25"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white border border-stone/25 flex items-center justify-center text-xs text-stone text-center px-2">
                Sin foto
              </div>
            )}
            <div className="flex-1 min-w-0">
              <input
                name="avatar"
                type="file"
                accept="image/*"
                className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-xs"
              />
              <p className="text-xs text-stone mt-1">
                {provider?.avatar_url
                  ? "Si subes una nueva, sustituye a la actual."
                  : "JPG, PNG o WebP, máximo 4 MB."}
              </p>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-stone block mb-1">
            Sobre ti (aparece en cada servicio que publiques)
          </label>
          <textarea
            name="bio"
            rows={5}
            defaultValue={provider?.bio ?? ""}
            placeholder="Cuenta quién eres, tu experiencia, y por qué alguien debería confiar en ti..."
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
        </div>
        <button className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 mt-1 hover:bg-copper-dark transition">
          Guardar
        </button>
      </form>

      <div className="mt-8 mb-4 max-w-lg">
        <h2 className="text-base font-medium">Datos de contacto</h2>
        <p className="text-sm text-stone mt-0.5">
          Son privados: no se muestran en tu perfil público.
        </p>
      </div>

      <form action={updateContacto} className="rounded-lg bg-paper p-5 grid gap-3 max-w-lg">
        <div>
          <label className="text-xs text-stone block mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            defaultValue={user?.email ?? ""}
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
          <p className="text-xs text-stone mt-1">
            Para cambiarlo, escribe el email nuevo y pulsa Guardar. Te
            enviaremos un enlace de confirmación a tu email actual y otro al
            nuevo; el cambio se aplica cuando confirmes los dos.
          </p>
          {user?.new_email && (
            <p className="text-xs text-copper mt-1">
              Cambio pendiente de confirmar: {user.new_email}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs text-stone block mb-1">Teléfono</label>
          <input
            type="tel"
            name="phone"
            defaultValue={appUser?.phone ?? ""}
            placeholder="+34 600 000 000"
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
        </div>
        <button className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 mt-1 hover:bg-copper-dark transition">
          Guardar datos de contacto
        </button>
      </form>

      <div className="mt-8 mb-4 max-w-lg">
        <h2 className="text-base font-medium">Cambiar contraseña</h2>
        <p className="text-sm text-stone mt-0.5">
          Escribe tu contraseña actual y la nueva dos veces. Pulsa el ojo para
          ver lo que escribes.
        </p>
      </div>

      <form action={cambiarPassword} className="rounded-lg bg-paper p-5 grid gap-3 max-w-lg">
        <PasswordField
          name="current_password"
          label="Contraseña actual"
          autoComplete="current-password"
        />
        <PasswordField
          name="new_password"
          label="Contraseña nueva (mínimo 8 caracteres)"
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordField
          name="confirm_password"
          label="Repite la contraseña nueva"
          autoComplete="new-password"
          minLength={8}
        />
        <button className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 mt-1 hover:bg-copper-dark transition">
          Cambiar contraseña
        </button>
      </form>

      <div className="mt-8 mb-4 max-w-lg">
        <h2 className="text-base font-medium">Cobros con Stripe</h2>
        <p className="text-sm text-stone mt-0.5">
          Tus cobros llegan a tu cuenta de Stripe. Desde su panel ves tus
          pagos, tu saldo y tu cuenta bancaria.
        </p>
      </div>

      <div className="rounded-lg bg-paper p-5 grid gap-3 max-w-lg">
        {provider?.stripe_account_id ? (
          <>
            {provider.kyc_status === "verified" ? (
              <p className="text-xs text-emerald-700">Cuenta verificada</p>
            ) : (
              <p className="text-xs text-stone">
                Verificación pendiente: termina el alta en Stripe para poder
                cobrar.
              </p>
            )}
            <a
              href="/api/stripe/dashboard"
              target="_blank"
              rel="noopener"
              className="rounded-lg bg-ink text-paper text-sm font-semibold py-2.5 text-center hover:opacity-90 transition"
            >
              Abrir mi cuenta de Stripe →
            </a>
          </>
        ) : (
          <a
            href="/api/stripe/connect"
            className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 text-center hover:bg-copper-dark transition"
          >
            Conectar mi cuenta de Stripe
          </a>
        )}
      </div>
    </div>
  );
}
