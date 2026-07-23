import { createAdminClient } from "@/lib/supabase/admin";
import Logo from "@/components/Logo";
import { notFound } from "next/navigation";

export default async function PerfilProfesionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Página pública: cliente admin, seleccionando solo columnas
  // seguras (nunca stripe_account_id ni tax_id).
  const supabase = createAdminClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("user_id, business_name, category, kyc_status")
    .eq("slug", slug)
    .single();

  if (!provider) {
    notFound();
  }

  const { data: services } = await supabase
    .from("services")
    .select("id, title, description, price, currency, type")
    .eq("provider_id", provider.user_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <Logo />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">
          {provider.category ?? "Profesional en Coxiro"}
        </p>
        <h1 className="text-3xl font-display font-semibold mb-8">
          {provider.business_name}
        </h1>

        <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-3">
          Servicios disponibles
        </p>

        <div className="grid gap-3">
          {services?.map((s) => (
            <a
              key={s.id}
              href={`/servicio/${s.id}`}
              className="flex items-center justify-between rounded-lg bg-white border border-stone/20 px-5 py-4 hover:border-copper transition"
            >
              <div>
                <p className="font-medium">{s.title}</p>
                {s.description && (
                  <p className="text-sm text-stone mt-0.5 line-clamp-1">
                    {s.description}
                  </p>
                )}
              </div>
              <p className="font-display font-semibold whitespace-nowrap ml-4">
                {Number(s.price).toFixed(2)} €
              </p>
            </a>
          ))}
          {!services?.length && (
            <p className="text-sm text-stone">
              Este profesional todavía no tiene servicios publicados.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
