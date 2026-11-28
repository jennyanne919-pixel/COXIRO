import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { Badge, Card, EmptyState, PageHeader } from "@/components/dashboard/ui";
import CancelarButton from "./CancelarButton";
import { cancelarSuscripcionCliente } from "./actions";

// Vista del CLIENTE: sus suscripciones y el botón para cancelarlas.
export default async function ClienteSuscripciones({ userId }: { userId: string }) {
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id, provider_id, service_id, created_at, services ( title )")
    .eq("client_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const provIds = [...new Set((subs ?? []).map((s: any) => s.provider_id))];
  const { data: provs } = provIds.length
    ? await admin.from("providers").select("user_id, business_name").in("user_id", provIds)
    : { data: [] };
  const nombre = new Map((provs ?? []).map((p: any) => [p.user_id, p.business_name]));

  // Estado real en Stripe: ¿ya tiene la baja programada?
  const filas = await Promise.all(
    (subs ?? []).map(async (s: any) => {
      let baja: Date | null = null;
      let hasta: Date | null = null;
      try {
        const st = await stripe.subscriptions.retrieve(s.stripe_subscription_id);
        if (st.cancel_at_period_end) baja = new Date(st.current_period_end * 1000);
        else if (st.cancel_at) hasta = new Date(st.cancel_at * 1000);
      } catch {}
      return { ...s, baja, hasta };
    })
  );

  const fecha = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <PageHeader
        title="Mis suscripciones"
        subtitle="Cancela cuando quieras: no se cobrarán más cuotas y conservas el acceso hasta el final del periodo pagado."
      />

      {filas.length ? (
        <div className="grid gap-3">
          {filas.map((s: any) => (
            <Card key={s.stripe_subscription_id} className="p-5">
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-medium text-cx-noche">{s.services?.title}</p>
                  <p className="text-xs text-cx-texto-2">
                    {nombre.get(s.provider_id) ?? "Profesional"} · desde {fecha(new Date(s.created_at))}
                    {s.hasta ? ` · último cobro antes del ${fecha(s.hasta)}` : ""}
                  </p>
                </div>
                {s.baja ? (
                  <Badge tone="ambar">Acceso hasta el {fecha(s.baja)}</Badge>
                ) : (
                  <>
                    <Badge tone="verde">Activa</Badge>
                    <CancelarButton
                      id={s.stripe_subscription_id}
                      cancelar={cancelarSuscripcionCliente}
                      etiqueta="Cancelar suscripción"
                      mensaje="¿Cancelar tu suscripción? No se cobrarán más cuotas y conservarás el acceso hasta el final del periodo que ya has pagado. Esto no es un desistimiento ni un reembolso: si quieres desistir del contrato (14 días desde la compra), escribe a coxiro.info@gmail.com."
                    />
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="users"
            title="No tienes suscripciones activas"
            text="Aquí aparecerán tus membresías y mentorías de pago recurrente."
          />
        </Card>
      )}
      <p className="mt-4 text-xs text-cx-texto-2">
        Cancelar una suscripción y desistir del contrato son cosas distintas. Para desistir o reclamar, escribe a
        coxiro.info@gmail.com o usa el <a href="/reclamaciones" className="underline">formulario de reclamaciones</a>.
      </p>
    </div>
  );
}
