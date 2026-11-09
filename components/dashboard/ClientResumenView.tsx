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

export type CompraFila = {
  id: string;
  profesional: string;
  servicio: string;
  importe: number; // lo que pagó el cliente
  estado: "paid" | "pending";
  fecha: string; // ISO
  facturaHref?: string;
};

// Vista pura de "Mis compras". La usa el panel real y la maqueta de la web.
export default function ClientResumenView({
  pendiente,
  compras,
  total,
}: {
  pendiente: number;
  compras: CompraFila[];
  total: number;
}) {
  return (
    <div>
      <PageHeader title="Mis compras" subtitle="Servicios que has contratado en Coxiro" />

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard dark icon="bag" label="Compras realizadas" value={String(total)} />
        <StatCard icon="clock" label="Pagos pendientes" value={fmtEur(pendiente)} />
      </div>

      <h2 className="font-display font-bold text-lg text-cx-noche mb-3">Últimas compras</h2>

      <Card>
        {compras.length ? (
          <ul className="divide-y divide-cx-borde">
            {compras.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3.5 flex-wrap sm:flex-nowrap">
                <Avatar name={c.profesional} />
                <div className="min-w-0 flex-1 basis-40">
                  <p className="font-medium text-cx-noche truncate">{c.servicio}</p>
                  <p className="text-xs text-cx-texto-2 truncate">
                    {c.profesional} · {fmtFecha(c.fecha)}
                  </p>
                </div>
                <Badge tone={c.estado === "paid" ? "verde" : "ambar"} dot>
                  {c.estado === "paid" ? "Pagado" : "Pendiente"}
                </Badge>
                <p className="font-display font-bold text-cx-noche sm:w-24 text-right ml-auto sm:ml-0">
                  {fmtEur(c.importe)}
                </p>
                {c.facturaHref ? (
                  <a href={c.facturaHref} target="_blank" className={BTN_SECONDARY} aria-label="Descargar factura">
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
            title="Todavía no has comprado nada"
            text="Explora los perfiles de los profesionales de Coxiro para empezar."
            action={
              <a href="/catalogo" className={BTN_PRIMARY}>
                <Icon name="globe" />
                Ver el catálogo
              </a>
            }
          />
        )}
      </Card>
    </div>
  );
}
