import { createClient } from "@/lib/supabase/server";
import ConectarStripeBoton from "./ConectarStripeBoton";
import ProviderResumenView, { type VentaFila } from "./ProviderResumenView";
import { BTN_PRIMARY, Icon } from "./ui";

// "JENNY ANNE ABRIAM" -> "Jenny". Las sociedades se muestran tal cual.
function saludoDe(nombre: string | null, legalType: string | null) {
  if (!nombre) return "Hola";
  if (legalType === "sociedad") return `Hola, ${nombre}`;
  const primero = nombre.trim().split(/\s+/)[0];
  const bonito = primero.charAt(0).toUpperCase() + primero.slice(1).toLowerCase();
  return `Hola, ${bonito}`;
}

export default async function ProviderSummary({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("kyc_status, business_name, legal_type")
    .eq("user_id", userId)
    .single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount_total,
      provider_net,
      status,
      created_at,
      client_id,
      services ( title ),
      clients ( billing_name )
    `
    )
    .eq("provider_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Totales calculados aparte para que no dependan de las 10 últimas ventas.
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { data: pagadas } = await supabase
    .from("transactions")
    .select("provider_net, created_at")
    .eq("provider_id", userId)
    .eq("status", "paid");
  const { data: pendientes } = await supabase
    .from("transactions")
    .select("provider_net")
    .eq("provider_id", userId)
    .eq("status", "pending");

  const cobradoMes = (pagadas ?? [])
    .filter((t) => new Date(t.created_at) >= inicioMes)
    .reduce((sum, t) => sum + Number(t.provider_net ?? 0), 0);
  const pendiente = (pendientes ?? []).reduce((sum, t) => sum + Number(t.provider_net ?? 0), 0);

  const clientIds = [...new Set(transactions?.map((t) => t.client_id) ?? [])];
  const { data: clientUsers } = clientIds.length
    ? await supabase.from("users").select("id, email").in("id", clientIds)
    : { data: [] };
  const emailById = new Map(clientUsers?.map((u) => [u.id, u.email]));

  const txIds = transactions?.map((t) => t.id) ?? [];
  const { data: invoices } = txIds.length
    ? await supabase
        .from("invoices")
        .select("id, transaction_id")
        .in("transaction_id", txIds)
        .eq("type", "provider_settlement")
    : { data: [] };
  const invoiceIdByTx = new Map(invoices?.map((i) => [i.transaction_id, i.id]));

  const filas: VentaFila[] = (transactions ?? []).map((t: any) => ({
    id: t.id,
    cliente: t.clients?.billing_name ?? emailById.get(t.client_id) ?? "Cliente",
    email: emailById.get(t.client_id) ?? undefined,
    servicio: t.services?.title ?? "Servicio",
    importe: Number(t.provider_net ?? 0),
    estado: t.status === "paid" ? "paid" : "pending",
    fecha: t.created_at,
    facturaHref: invoiceIdByTx.get(t.id) ? `/api/invoices/${invoiceIdByTx.get(t.id)}/pdf` : undefined,
  }));

  return (
    <ProviderResumenView
      saludo={saludoDe(provider?.business_name ?? null, provider?.legal_type ?? null)}
      verificado={provider?.kyc_status === "verified"}
      conectar={
        <ConectarStripeBoton className={BTN_PRIMARY}>
          <Icon name="link" />
          Conectar con Stripe
        </ConectarStripeBoton>
      }
      cobradoMes={cobradoMes}
      pendiente={pendiente}
      ventasTotales={pagadas?.length ?? 0}
      filas={filas}
    />
  );
}
