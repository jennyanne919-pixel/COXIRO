import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { notFound } from "next/navigation";
import { submitInquiry } from "./inquiry-actions";

export default async function ServicioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string; inquiry_sent?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  // Página pública: usamos el cliente admin porque necesitamos leer
  // el nombre y el estado de verificación del proveedor, datos que
  // RLS protege por diseño (cada proveedor solo ve su propia fila).
  // Solo seleccionamos campos seguros para mostrar -- nunca
  // stripe_account_id ni tax_id aquí.
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
      providers ( business_name, kyc_status )
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

  // Si ya tiene sesión iniciada, comprobamos si ya compró este
  // servicio -- para no ofrecerle pagar otra vez algo que ya tiene.
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

      <div className="max-w-lg mx-auto px-6 py-10">
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
            className="w-full h-48 object-cover rounded-lg mb-6"
          />
        )}

        <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">
          {provider?.business_name ?? "Profesional en Coxiro"}
        </p>
        <h1 className="text-2xl font-display font-semibold mb-3">
          {service.title}
        </h1>
        <p className="text-stone text-sm mb-6">{service.description}</p>

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
    </main>
  );
}
