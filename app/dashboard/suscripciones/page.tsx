import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/dashboard/ui";
import CancelarButton from "./CancelarButton";
import { cancelarSuscripcion } from "./actions";

export default async function SuscripcionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id, client_id, service_id, status, created_at, services ( title )")
    .eq("provider_id", user?.id ?? "")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const clientIds = [...new Set((subs ?? []).map((s: any) => s.client_id))];
  const { data: clientes } = clientIds.length
    ? await admin.from("clients").select("user_id, billing_name").in("user_id", clientIds)
    : { data: [] };
  const nombre = new Map((clientes ?? []).map((c: any) => [c.user_id, c.billing_name]));

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

  const fecha = (d: Date) =>
    d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <PageHeader
        title="Suscripciones"
        subtitle="Clientes con pago recurrente en tus servicios"
      />

      {filas.length ? (
        <div className="grid gap-3">
          {filas.map((s: any) => (
            <Card key={s.stripe_subscription_id} className="p-5">
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <Avatar name={nombre.get(s.client_id) ?? "Cliente"} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-medium text-cx-noche">{nombre.get(s.client_id) ?? "Cliente"}</p>
                  <p className="text-xs text-cx-texto-2">
                    {s.services?.title} · desde {fecha(new Date(s.created_at))}
                    {s.hasta ? ` · último cobro antes del ${fecha(s.hasta)}` : ""}
                  </p>
                </div>
                {s.baja ? (
                  <Badge tone="ambar">Baja el {fecha(s.baja)}</Badge>
                ) : (
                  <>
                    <Badge tone="verde">Activa</Badge>
                    <CancelarButton id={s.stripe_subscription_id} cancelar={cancelarSuscripcion} />
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
            title="Todavía no tienes suscripciones activas"
            text="Aparecerán aquí cuando alguien contrate una mentoría o membresía de pago recurrente."
          />
        </Card>
      )}
    </div>
  );
}
