import { createClient } from "@/lib/supabase/server";
import ClientResumenView, { type CompraFila } from "./ClientResumenView";

export default async function ClientSummary({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount_total,
      status,
      created_at,
      provider_id,
      services ( title )
    `
    )
    .eq("client_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Se consulta el nombre del proveedor por separado -- la relación
  // anidada directa no siempre resuelve bien en Supabase, este
  // patrón es el mismo que ya usamos para los emails de clientes en
  // el panel del proveedor.
  const providerIds = [...new Set(transactions?.map((t) => t.provider_id) ?? [])];
  const { data: providersData } = providerIds.length
    ? await supabase.from("providers").select("user_id, business_name").in("user_id", providerIds)
    : { data: [] };
  const providerNameById = new Map(providersData?.map((p) => [p.user_id, p.business_name]));

  const pending =
    transactions
      ?.filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + Number(t.amount_total), 0) ?? 0;

  const txIds = transactions?.map((t) => t.id) ?? [];
  const { data: invoices } = txIds.length
    ? await supabase
        .from("invoices")
        .select("id, transaction_id")
        .in("transaction_id", txIds)
        .eq("type", "client_invoice")
    : { data: [] };
  const invoiceIdByTx = new Map(invoices?.map((i) => [i.transaction_id, i.id]));

  const compras: CompraFila[] = (transactions ?? []).map((t: any) => ({
    id: t.id,
    profesional: providerNameById.get(t.provider_id) ?? "Profesional en Coxiro",
    servicio: t.services?.title ?? "Servicio",
    importe: Number(t.amount_total),
    estado: t.status === "paid" ? "paid" : t.status === "refunded" ? "refunded" : "pending",
    fecha: t.created_at,
    facturaHref: invoiceIdByTx.get(t.id) ? `/api/invoices/${invoiceIdByTx.get(t.id)}/pdf` : undefined,
  }));

  return (
    <ClientResumenView
      pendiente={pending}
      compras={compras}
      total={transactions?.length ?? 0}
    />
  );
}
