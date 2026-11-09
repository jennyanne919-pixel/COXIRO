import type { ReactNode } from "react";
import {
  Avatar,
  Badge,
  BTN_PRIMARY,
  BTN_SECONDARY,
  Card,
  EmptyState,
  fmtEur,
  fmtFecha,
  Icon,
  PageHeader,
  StatCard,
} from "./ui";

export type VentaFila = {
  id: string;
  cliente: string;
  email?: string;
  servicio: string;
  importe: number; // lo que recibe el profesional
  estado: "paid" | "pending";
  fecha: string; // ISO
  facturaHref?: string;
};

// Vista pura del resumen del profesional. La usa el panel real (con datos de
// Supabase) y la maqueta de la página de inicio (con datos de ejemplo), para
// que lo que se enseña en la web sea exactamente lo que se ve dentro.
export default function ProviderResumenView({
  saludo,
  verificado,
  conectar,
  cobradoMes,
  pendiente,
  ventasTotales,
  filas,
}: {
  saludo: string;
  verificado: boolean;
  conectar?: ReactNode;
  cobradoMes: number;
  pendiente: number;
  ventasTotales: number;
  filas: VentaFila[];
}) {
  return (
    <div>
      <PageHeader title={saludo} subtitle="Así va tu actividad" />

      {!verificado && (
        <div className="rounded-2xl bg-cx-celeste/10 border border-cx-celeste/30 p-4 mb-6 flex items-center gap-4 flex-wrap">
          <span className="w-10 h-10 rounded-xl bg-cx-celeste/20 text-cx-prof flex items-center justify-center shrink-0">
            <Icon name="alert" className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-medium text-cx-noche">Falta conectar tu cuenta de cobro</p>
            <p className="text-sm text-cx-texto-2 mt-0.5">
              Sin esto, no podrás recibir los pagos de tus clientes.
            </p>
          </div>
          {conectar}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <StatCard className="col-span-2 sm:col-span-1" dark icon="trend" label="Cobrado este mes" value={fmtEur(cobradoMes)} hint="Tu parte, sin IVA" />
        <StatCard icon="clock" label="Pendiente de cobro" value={fmtEur(pendiente)} />
        <StatCard icon="bag" label="Ventas realizadas" value={String(ventasTotales)} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-lg text-cx-noche">Últimas ventas</h2>
      </div>

      <Card>
        {filas.length ? (
          <ul className="divide-y divide-cx-borde">
            {filas.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-4 py-3.5 flex-wrap sm:flex-nowrap">
                <Avatar name={f.cliente} />
                <div className="min-w-0 flex-1 basis-40">
                  <p className="font-medium text-cx-noche truncate">{f.cliente}</p>
                  <p className="text-xs text-cx-texto-2 truncate">
                    {f.servicio} · {fmtFecha(f.fecha)}
                    {f.email ? ` · ${f.email}` : ""}
                  </p>
                </div>
                <Badge tone={f.estado === "paid" ? "verde" : "ambar"} dot>
                  {f.estado === "paid" ? "Pagado" : "Pendiente"}
                </Badge>
                <p className="font-display font-bold text-cx-noche sm:w-24 text-right ml-auto sm:ml-0">{fmtEur(f.importe)}</p>
                {f.facturaHref ? (
                  <a
                    href={f.facturaHref}
                    target="_blank"
                    className={BTN_SECONDARY}
                    aria-label="Descargar autofactura"
                  >
                    <Icon name="download" className="w-3.5 h-3.5" />
                    Factura
                  </a>
                ) : (
                  <span className="w-[84px]" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="bag"
            title="Todavía no tienes cobros"
            text="Cuando un cliente te compre, aparecerá aquí con su factura."
            action={
              <a href="/dashboard/servicios" className={BTN_PRIMARY}>
                <Icon name="plus" />
                Crear mi primer servicio
              </a>
            }
          />
        )}
      </Card>
    </div>
  );
}
