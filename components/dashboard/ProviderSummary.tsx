import { createClient } from "@/lib/supabase/server";

export default async function ProviderSummary({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("kyc_status")
    .eq("user_id", userId)
    .single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount_total,
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

  const paidThisMonth =
    transactions
      ?.filter((t) => t.status === "paid")
      .reduce((sum, t) => sum + Number(t.amount_total), 0) ?? 0;

  const pending =
    transactions
      ?.filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + Number(t.amount_total), 0) ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium">Cobros y facturas</h1>
        <p className="text-sm text-stone mt-0.5">Resumen de tu actividad</p>
      </div>

      {provider?.kyc_status !== "verified" && (
        <div className="rounded-lg bg-copper/10 border border-copper/30 p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium">Falta conectar tu cuenta de cobro</p>
            <p className="text-sm text-stone mt-0.5">
              Sin esto, no podrás recibir los pagos de tus clientes.
            </p>
          </div>
          <a
            href="/api/stripe/connect"
            className="rounded-lg bg-copper text-paper text-sm font-semibold px-4 py-2 hover:bg-copper-dark transition whitespace-nowrap"
          >
            Conectar con Stripe
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Cobrado este mes</p>
          <p className="text-2xl font-medium">{paidThisMonth.toFixed(2)} €</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Pendiente de cobro</p>
          <p className="text-2xl font-medium">{pending.toFixed(2)} €</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-sm text-stone mb-1">Transacciones</p>
          <p className="text-2xl font-medium">{transactions?.length ?? 0}</p>
        </div>
      </div>

      {/* Cabecera de tabla: solo en escritorio */}
      <div className="rounded-lg bg-paper overflow-hidden hidden md:block">
        <div className="grid grid-cols-6 px-3.5 py-2.5 text-xs text-stone border-b border-stone/20">
          <span>Cliente</span>
          <span>Contacto</span>
          <span>Servicio</span>
          <span>Importe</span>
          <span>Estado</span>
          <span>Factura</span>
        </div>
        {transactions?.map((t: any) => (
          <div
            key={t.id}
            className="grid grid-cols-6 px-3.5 py-3 text-sm items-center border-b border-stone/20 last:border-0"
          >
            <span>{t.clients?.billing_name ?? "—"}</span>
            <span className="text-stone truncate">{emailById.get(t.client_id) ?? "—"}</span>
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
            Todavía no tienes cobros registrados.
          </p>
        )}
      </div>

      {/* Tarjetas apiladas: solo en móvil */}
      <div className="grid gap-3 md:hidden">
        {transactions?.map((t: any) => (
          <div key={t.id} className="rounded-lg bg-paper p-4 text-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">{t.clients?.billing_name ?? "—"}</p>
                <p className="text-stone text-xs break-all">{emailById.get(t.client_id) ?? "—"}</p>
              </div>
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
            Todavía no tienes cobros registrados.
          </p>
        )}
      </div>
    </div>
  );
}
