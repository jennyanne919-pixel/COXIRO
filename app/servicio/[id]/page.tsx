import { createAdminClient } from "@/lib/supabase/admin";
import Logo from "@/components/Logo";
import { notFound } from "next/navigation";

export default async function ServicioPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string; cancelled?: string };
}) {
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
      providers ( business_name, kyc_status )
    `
    )
    .eq("id", params.id)
    .single();

  if (error) {
    console.error("Error cargando el servicio:", error);
  }

  if (!service || !service.is_active) {
    notFound();
  }

  const provider = service.providers as any;

  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <Logo />
      </header>

      <div className="max-w-lg mx-auto px-6 py-10">
        {searchParams.paid && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 mb-6">
            Pago realizado correctamente. Recibirás la confirmación en tu email.
          </div>
        )}
        {searchParams.cancelled && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 mb-6">
            Pago cancelado. Puedes intentarlo de nuevo cuando quieras.
          </div>
        )}

        <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">
          {provider?.business_name ?? "Profesional en Coxiro"}
        </p>
        <h1 className="text-2xl font-display font-semibold mb-3">
          {service.title}
        </h1>
        <p className="text-stone text-sm mb-6">{service.description}</p>

        <div className="rounded-lg bg-white border border-stone/20 p-6">
          <p className="text-3xl font-display font-semibold mb-4">
            {Number(service.price).toFixed(2)} €
          </p>

          {provider?.kyc_status !== "verified" ? (
            <p className="text-sm text-stone">
              Este profesional todavía no puede recibir cobros. Vuelve más
              adelante.
            </p>
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
