import type { ReactNode } from "react";
import { Badge, Card, fmtEur } from "./ui";

export const TYPE_LABELS: Record<string, string> = {
  content: "Contenido",
  consult: "Consulta",
  course: "Curso",
  custom: "Servicios IA",
  membership: "Membresía / Suscripción",
};

export type ServiceData = {
  id: string;
  title: string;
  type: string;
  price: number;
  requires_inquiry?: boolean;
  is_active: boolean;
  is_public: boolean;
};

// Tarjeta de servicio. El panel real le pasa botones con acciones de servidor;
// la maqueta de la web, versiones estáticas con el mismo aspecto.
export default function ServiceCard({
  s,
  estado,
  visibilidad,
  acciones,
  precios,
}: {
  s: ServiceData;
  estado?: ReactNode;
  visibilidad?: ReactNode;
  acciones?: ReactNode;
  // Solo en el panel real del proveedor: lo que recibe él y lo que paga el cliente.
  precios?: { proveedor: number; cliente: number; sufijo?: string };
}) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-cx-noche leading-snug">{s.title}</p>
          <p className="text-xs text-cx-texto-2 mt-1">{TYPE_LABELS[s.type] ?? s.type}</p>
        </div>
        {precios && !s.requires_inquiry && Number(s.price) > 0 ? (
          <div className="text-right whitespace-nowrap">
            <p className="font-display font-bold text-xl text-cx-prof">
              {fmtEur(precios.proveedor)}
              {precios.sufijo && <span className="text-xs font-medium"> {precios.sufijo}</span>}
            </p>
            <p className="text-[11px] text-cx-texto-2">Tú recibes</p>
            <p className="text-xs font-medium text-cx-noche mt-1.5">
              {fmtEur(precios.cliente)}
              {precios.sufijo && <span className="text-[11px] font-normal"> {precios.sufijo}</span>}
            </p>
            <p className="text-[11px] text-cx-texto-2">Paga el cliente (impuestos incluidos)</p>
          </div>
        ) : (
          <p className="font-display font-bold text-xl text-cx-prof whitespace-nowrap">
            {s.requires_inquiry ? "A medida" : fmtEur(Number(s.price))}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {estado ?? (
          <Badge tone={s.is_active ? "verde" : "gris"} dot>
            {s.is_active ? "Activo" : "Pausado"}
          </Badge>
        )}
        {visibilidad ?? (
          <Badge tone={s.is_public ? "celeste" : "gris"}>
            {s.is_public ? "Público" : "Privado"}
          </Badge>
        )}
      </div>

      {acciones && (
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-cx-borde">{acciones}</div>
      )}
    </Card>
  );
}
