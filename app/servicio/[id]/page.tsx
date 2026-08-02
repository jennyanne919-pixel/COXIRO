import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { notFound } from "next/navigation";
import { submitInquiry } from "./inquiry-actions";

const TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  pdf: "PDF",
  audio: "Audio",
  link: "Enlace",
  document: "Documento",
};

const FAQS = [
  {
    q: "¿Cómo recibo el acceso tras pagar?",
    a: "En cuanto se confirma el pago, el contenido aparece automáticamente en tu panel, dentro de \"Mi contenido\" — sin esperas.",
  },
  {
    q: "¿El pago es seguro?",
    a: "Sí, todos los cobros se procesan a través de Stripe, la misma tecnología que usan miles de plataformas en todo el mundo.",
  },
  {
    q: "¿Recibo factura?",
    a: "Sí, se genera automáticamente y te llega por email en cuanto se completa el pago.",
  },
];

export default async function ServicioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string; inquiry_sent?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = createAdminClient();

  const { data: service, error } = await supabase
    .from("services")
    .select(
      `
      id,
      title,
      description,
      price,
      currency,
      is_active,
      requires_inquiry,
      inquiry_url,
      image_url,
      type,
      billing_interval,
      total_installments,
      provider_id,
      providers ( business_name, kyc_status, bio, slug )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error cargando el servicio:", error);
  }

  if (!service || !service.is_active) {
    notFound();
  }

  const provider = service.providers as any;

  const [{ data: contentItems }, { data: otherServices }] = await Promise.all([
    supabase
      .from("content_items")
      .select("id, title, content_type, is_free")
      .eq("service_id", service.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("services")
      .select("id, title, price, image_url, requires_inquiry")
      .eq("provider_id", service.provider_id)
      .eq("is_public", true)
      .eq("is_active", true)
      .neq("id", service.id)
      .limit(3),
  ]);

  const contenidoGratis = contentItems?.filter((c) => c.is_free) ?? [];

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  let yaComprado = false;
  if (user) {
    const { data: access } = await supabase
      .from("content_access")
      .select("id")
      .eq("client_id", user.id)
      .eq("service_id", service.id)
      .maybeSingle();
    yaComprado = !!access;
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <a href="/">
          <Logo variant="light" />
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_360px] gap-10">
        {/* Columna principal */}
        <div>
          {sp.paid && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 mb-6">
              Pago realizado correctamente. Recibirás la confirmación en tu email.
            </div>
          )}
          {sp.cancelled && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 mb-6">
              Pago cancelado. Puedes intentarlo de nuevo cuando quieras.
            </div>
          )}

          {service.image_url && (
            <img
              src={service.image_url}
              alt=""
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">
            {provider?.business_name ?? "Profesional en Coxiro"}
          </p>
          <h1 className="text-3xl font-display font-semibold mb-4">
            {service.title}
          </h1>
          <p className="text-stone text-sm leading-relaxed mb-8 whitespace-pre-line">
            {service.description}
          </p>

          {/* Vídeo/contenido de presentación gratuito */}
          {contenidoGratis.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-medium mb-3">Adelanto gratuito</h2>
              <div className="grid gap-2">
                {contenidoGratis.map((c) => (
                  <a
                    key={c.id}
                    href={
                      ["video", "audio"].includes(c.content_type)
                        ? `/contenido/${c.id}`
                        : `/api/access/${c.id}`
                    }
                    className="flex items-center justify-between rounded-lg bg-white border border-stone/20 px-4 py-3 hover:border-copper transition"
                  >
                    <span className="text-sm">{c.title}</span>
                    <span className="text-xs text-copper font-medium">
                      {TYPE_LABELS[c.content_type] ?? c.content_type} →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Índice de contenido */}
          {contentItems && contentItems.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-medium mb-3">Contenido de este servicio</h2>
              <div className="rounded-lg bg-white border border-stone/20 overflow-hidden">
                {contentItems.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3 text-sm border-b border-stone/10 last:border-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-stone text-xs w-5">{i + 1}.</span>
                      {c.title}
                    </span>
                    <span className="text-xs text-stone flex items-center gap-1">
                      {TYPE_LABELS[c.content_type] ?? c.content_type}
                      {!c.is_free && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="10" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Garantía */}
          <div className="mb-10 rounded-lg bg-white border border-stone/20 p-5 flex items-start gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E2703A" strokeWidth="2" className="flex-shrink-0">
              <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
            </svg>
            <div>
              <p className="text-sm font-medium">Pago seguro</p>
              <p className="text-xs text-stone mt-0.5">
                Procesado con Stripe, con factura automática. Acceso inmediato tras la confirmación del pago.
              </p>
            </div>
          </div>

          {/* Sobre el creador */}
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-3">Sobre el creador</h2>
            <div className="rounded-lg bg-white border border-stone/20 p-5">
              <p className="font-medium mb-1">{provider?.business_name ?? "Profesional en Coxiro"}</p>
              {provider?.bio ? (
                <p className="text-sm text-stone whitespace-pre-line">{provider.bio}</p>
              ) : (
                <p className="text-sm text-stone">Profesional verificado en Coxiro.</p>
              )}
              {provider?.slug && (
                <a
                  href={`/${provider.slug}`}
                  className="inline-block text-sm text-copper hover:underline mt-3"
                >
                  Ver perfil completo →
                </a>
              )}
            </div>
          </div>

          {/* Otros servicios del mismo creador */}
          {otherServices && otherServices.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-medium mb-3">
                Otros servicios de {provider?.business_name ?? "este profesional"}
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {otherServices.map((s) => (
                  <a
                    key={s.id}
                    href={`/servicio/${s.id}`}
                    className="rounded-lg bg-white border border-stone/20 overflow-hidden hover:border-copper transition"
                  >
                    {s.image_url ? (
                      <img src={s.image_url} alt="" className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-paper" />
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-1">{s.title}</p>
                      <p className="text-xs text-stone mt-1">
                        {s.requires_inquiry ? "A medida" : `${Number(s.price).toFixed(2)} €`}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          <div>
            <h2 className="text-lg font-medium mb-3">Preguntas frecuentes</h2>
            <div className="grid gap-2">
              {FAQS.map((f) => (
                <details key={f.q} className="rounded-lg bg-white border border-stone/20 p-4">
                  <summary className="text-sm font-medium cursor-pointer">{f.q}</summary>
                  <p className="text-sm text-stone mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Columna lateral: tarjeta de compra, fija al hacer scroll en escritorio */}
        <div className="md:sticky md:top-6 h-fit">
          <div className="rounded-lg bg-white border border-stone/20 p-6">
            {!service.requires_inquiry && (
              <div className="mb-4">
                <p className="text-3xl font-display font-semibold">
                  {Number(service.price).toFixed(2)} €
                  {service.type === "membership" && (
                    <span className="text-base font-normal text-stone">
                      {" "}
                      / {service.billing_interval === "year" ? "año" : "mes"}
                    </span>
                  )}
                </p>
                {service.type === "membership" && (
                  <p className="text-xs text-stone mt-1">
                    {service.total_installments
                      ? `Domiciliación ${service.billing_interval === "year" ? "anual" : "mensual"} — se cobrará ${service.total_installments} ${service.total_installments === 1 ? "vez" : "veces"} en total, y se detiene sola.`
                      : `Domiciliación ${service.billing_interval === "year" ? "anual" : "mensual"} — se renueva automáticamente hasta que canceles.`}
                  </p>
                )}
              </div>
            )}

            {yaComprado ? (
              <div className="grid gap-2">
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                  Ya tienes acceso a este servicio.
                </p>
                <a
                  href="/dashboard/contenido"
                  className="block text-center rounded-lg bg-copper text-paper font-semibold text-sm py-3 hover:bg-copper-dark transition"
                >
                  Ver mi contenido
                </a>
                <a
                  href="/catalogo"
                  className="block text-center rounded-lg border border-stone/25 text-ink font-semibold text-sm py-3 hover:border-ink transition"
                >
                  Descubrir más servicios
                </a>
              </div>
            ) : provider?.kyc_status !== "verified" && !service.requires_inquiry ? (
              <p className="text-sm text-stone">
                Este profesional todavía no puede recibir cobros. Vuelve más
                adelante.
              </p>
            ) : service.requires_inquiry ? (
              sp.inquiry_sent ? (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                  Solicitud enviada. El profesional se pondrá en contacto
                  contigo pronto.
                </p>
              ) : (
                <form action={submitInquiry} className="grid gap-3">
                  <input type="hidden" name="service_id" value={service.id} />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Tu nombre"
                    className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="tu@email.com"
                    className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
                  />
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Cuéntanos qué necesitas"
                    className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
                  />
                  <button className="rounded-lg bg-copper text-paper font-semibold text-sm py-3 hover:bg-copper-dark transition">
                    {service.inquiry_url ? "Cuéntanos tu proyecto" : "Solicitar información"}
                  </button>
                </form>
              )
            ) : (
              <a
                href={`/api/checkout?service=${service.id}`}
                className="block text-center rounded-lg bg-copper text-paper font-semibold text-sm py-3 hover:bg-copper-dark transition"
              >
                Pagar y contratar
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
