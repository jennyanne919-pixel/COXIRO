import { createClient } from "@/lib/supabase/server";

export default async function ClientSummary({ userId }: { userId: string }) {
  const supabase = createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount_total,
      status,
      created_at,
      services ( title ),
      providers ( business_name )
    `
    )
    .eq("client_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const spentThisMonth =
    transactions
      ?.filter((t) => t.status === "paid")
      .reduce((sum, t) => sum + Number(t.amount_total), 0) ?? 0;

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Mis compras</h1>
        <p className="text-sm text-stone mt-0.5">
          Servicios que has contratado en Coxiro
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Gastado este mes</p>
          <p className="text-2xl font-medium">{spentThisMonth.toFixed(2)} €</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Pagos pendientes</p>
          <p className="text-2xl font-medium">{pending.toFixed(2)} €</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Compras realizadas</p>
          <p className="text-2xl font-medium">{transactions?.length ?? 0}</p>
        </div>
      </div>

      <div className="rounded-lg bg-paper overflow-hidden">
        <div className="grid grid-cols-5 px-3.5 py-2.5 text-xs text-stone border-b border-stone/20">
          <span>Profesional</span>
          <span>Servicio</span>
          <span>Importe</span>
          <span>Estado</span>
          <span>Factura</span>
        </div>
        {transactions?.map((t: any) => (
          <div
            key={t.id}
            className="grid grid-cols-5 px-3.5 py-3 text-sm items-center border-b border-stone/20 last:border-0"
          >
            <span>{t.providers?.business_name ?? "—"}</span>
            <span className="text-stone">{t.services?.title ?? "—"}</span>
            <span>{Number(t.amount_total).toFixed(2)} €</span>
            <span className={t.status === "paid" ? "text-emerald-700" : "text-amber-700"}>
              {t.status === "paid" ? "Pagado" : "Pendiente"}
            </span>
            {invoiceIdByTx.get(t.id) ? (
              <a
                href={`/api/invoices/${invoiceIdByTx.get(t.id)}/pdf`}
                target="_blank"
                className="text-xs text-copper hover:underline"
              >
                Descargar
              </a>
            ) : (
              <span className="text-xs text-stone">—</span>
            )}
          </div>
        ))}
        {!transactions?.length && (
          <p className="text-sm text-stone p-4">
            Todavía no has comprado ningún servicio. Explora los perfiles de
            los profesionales de Coxiro para empezar.
          </p>
        )}
      </div>
    </div>
  );
}
