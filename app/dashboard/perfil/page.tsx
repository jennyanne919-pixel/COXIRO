import { createClient } from "@/lib/supabase/server";
import { updateBio } from "./actions";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
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
    </div>
  );
}
