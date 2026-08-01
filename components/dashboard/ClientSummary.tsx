import { createClient } from "@/lib/supabase/server";

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Mis compras</h1>
        <p className="text-sm text-stone mt-0.5">
          Servicios que has contratado en Coxiro
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Pagos pendientes</p>
          <p className="text-2xl font-medium">{pending.toFixed(2)} €</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Compras realizadas</p>
          <p className="text-2xl font-medium">{transactions?.length ?? 0}</p>
        </div>
      </div>

      {/* Tabla: solo en escritorio */}
      <div className="rounded-lg bg-paper overflow-hidden hidden md:block">
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
            <span>{providerNameById.get(t.provider_id) ?? "—"}</span>
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

      {/* Tarjetas apiladas: solo en móvil */}
      <div className="grid gap-3 md:hidden">
        {transactions?.map((t: any) => (
          <div key={t.id} className="rounded-lg bg-paper p-4 text-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="font-medium">{providerNameById.get(t.provider_id) ?? "—"}</p>
              <span
                className={`text-xs font-medium rounded-full px-2 py-1 whitespace-nowrap ${
                  t.status === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {t.status === "paid" ? "Pagado" : "Pendiente"}
              </span>
            </div>
            <p className="text-stone text-xs mb-1">{t.services?.title ?? "—"}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="font-display font-semibold">{Number(t.amount_total).toFixed(2)} €</p>
              {invoiceIdByTx.get(t.id) ? (
                <a
                  href={`/api/invoices/${invoiceIdByTx.get(t.id)}/pdf`}
                  target="_blank"
                  className="text-xs text-copper font-medium"
                >
                  Descargar factura →
                </a>
              ) : (
                <span className="text-xs text-stone">—</span>
              )}
            </div>
          </div>
        ))}
        {!transactions?.length && (
          <p className="text-sm text-stone bg-paper rounded-lg p-4">
            Todavía no has comprado ningún servicio. Explora los perfiles de
            los profesionales de Coxiro para empezar.
          </p>
        )}
      </div>
    </div>
  );
}
