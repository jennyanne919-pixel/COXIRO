import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateBio, updateContacto } from "./actions";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    emailPending?: string;
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
    .select("business_name, bio, slug")
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

      {sp.emailPending && (
        <p className="text-sm text-stone bg-paper border border-stone/25 rounded-lg px-3 py-2 mb-4 max-w-lg">
          Te hemos enviado un enlace de confirmación al email nuevo. El cambio
          se aplica cuando lo confirmes (puede que también te pida confirmarlo
          desde tu email actual).
        </p>
      )}

      {sp.error === "email" && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          No se ha podido cambiar el email. Comprueba que es válido y que no
          está ya registrado en Coxiro.
        </p>
      )}

      {sp.error === "telefono" && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 max-w-lg">
          El teléfono no es válido. Usa solo números, con o sin prefijo (por
          ejemplo +34 600 000 000).
        </p>
      )}

      <form action={updateBio} className="rounded-lg bg-paper p-5 grid gap-3 max-w-lg">
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
          {user?.new_email && (
            <p className="text-xs text-stone mt-1">
              Pendiente de confirmar: {user.new_email}
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
    </div>
  );
}
