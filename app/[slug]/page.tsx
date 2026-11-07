import { createAdminClient } from "@/lib/supabase/admin";
import Logo from "@/components/Logo";
import ShareButton from "@/components/ShareButton";
import { notFound } from "next/navigation";
import { totalCliente } from "@/lib/pricing";

function detalle(s: {
  type: string | null;
  billing_interval: string | null;
  total_installments: number | null;
  requires_inquiry: boolean | null;
}) {
  if (s.requires_inquiry) return "A medida, bajo consulta";
  if (s.type === "membership") {
    const anual = s.billing_interval === "year";
    return s.total_installments
      ? `${s.total_installments} pagos ${anual ? "anuales" : "mensuales"}`
      : `Suscripción ${anual ? "anual" : "mensual"}`;
  }
  return "Pago único";
}

const iniciales = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export default async function PerfilProfesionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Página pública: cliente admin, seleccionando solo columnas
  // seguras (nunca stripe_account_id ni tax_id).
  const supabase = createAdminClient();

  // Las columnas promesa/chips llegan con supabase/add-provider-promesa-chips.sql.
  // Si todavía no existen, se cae al select anterior para no romper el perfil.
  let provider: any = null;
  {
    const r = await supabase
      .from("providers")
      .select("user_id, business_name, category, kyc_status, bio, avatar_url, promesa, chips")
      .eq("slug", slug)
      .single();
    provider = r.data;
    if (r.error && !r.data) {
      const r2 = await supabase
        .from("providers")
        .select("user_id, business_name, category, kyc_status, bio, avatar_url")
        .eq("slug", slug)
        .single();
      provider = r2.data;
    }
  }

  if (!provider) {
    notFound();
  }

  const { data: services } = await supabase
    .from("services")
    .select("id, title, description, price, currency, type, image_url, billing_interval, total_installments, requires_inquiry")
    .eq("provider_id", provider.user_id)
    .eq("is_active", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const principal = services?.[0];
  const especialidad = provider.category
    ? String(provider.category).charAt(0).toUpperCase() + String(provider.category).slice(1)
    : null;
  const chips: string[] = (provider.chips ?? []).filter(Boolean).slice(0, 3);

  return (
    <main className="min-h-screen bg-white pb-28">
      <header className="bg-cx-noche h-44 px-5 pt-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <a href="/" aria-label="Coxiro">
            <Logo variant="dark" size={14} />
          </a>
          <ShareButton titulo={provider.business_name} />
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5">
        <div className="-mt-14 flex flex-col items-center text-center">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={`Foto de ${provider.business_name}`}
              className="w-28 h-28 rounded-full object-cover border-4 border-white bg-cx-hielo"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-full border-4 border-white bg-cx-hielo text-cx-prof font-display font-bold text-3xl flex items-center justify-center"
              aria-hidden="true"
            >
              {iniciales(provider.business_name)}
            </div>
          )}
          <h1 className="font-display font-bold text-[28px] leading-tight text-cx-noche mt-4">
            {provider.business_name}
          </h1>
          {especialidad && <p className="text-cx-prof font-semibold mt-1">{especialidad}</p>}
          {provider.promesa && (
            <p className="text-cx-texto mt-3 max-w-md">{provider.promesa}</p>
          )}
          {chips.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 mt-4">
              {chips.map((c) => (
                <li key={c} className="rounded-full bg-cx-hielo text-cx-prof text-sm font-semibold px-3.5 py-1.5">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        {provider.bio && (
          <p className="text-sm text-cx-texto-2 mt-6 whitespace-pre-line leading-relaxed">{provider.bio}</p>
        )}

        <h2 className="font-display font-bold text-xl text-cx-noche mt-9 mb-3">Lo que ofrezco</h2>
        <div className="grid gap-3">
          {services?.map((s) => (
            <a
              key={s.id}
              href={`/servicio/${s.id}`}
              className="flex items-center gap-4 rounded-2xl border border-cx-borde bg-white p-3 hover:border-cx-celeste transition"
            >
              {s.image_url ? (
                <img src={s.image_url} alt="" className="w-[72px] h-[72px] rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-[72px] h-[72px] rounded-xl bg-cx-hielo flex-shrink-0" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-cx-noche leading-snug line-clamp-2">{s.title}</p>
                <p className="text-xs text-cx-texto-2 mt-0.5">{detalle(s)}</p>
              </div>
              <p className="font-display font-bold text-cx-prof whitespace-nowrap">
                {s.requires_inquiry ? "Consultar" : `${totalCliente(Number(s.price)).toFixed(2).replace(".", ",")} €`}
              </p>
            </a>
          ))}
          {!services?.length && (
            <p className="text-sm text-cx-texto-2">
              Este profesional todavía no tiene servicios publicados.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-cx-texto-2 mt-10">
          Cobros y facturas con <a href="/" className="text-cx-prof hover:underline">Coxiro</a>
        </p>
      </div>

      {principal && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 border-t border-cx-borde px-5 py-3">
          <a
            href={`/servicio/${principal.id}`}
            className="block max-w-xl mx-auto text-center truncate px-6 rounded-full bg-cx-noche text-white font-semibold py-3.5 hover:-translate-y-0.5 transition"
          >
            {principal.requires_inquiry ? "Solicitar información" : `Contratar: ${principal.title}`}
          </a>
        </div>
      )}
    </main>
  );
}
