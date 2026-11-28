import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, Card, Badge } from "@/components/dashboard/ui";
import { OBLIGACIONES, proximoVencimiento, type EstadoObligacion } from "@/lib/admin/obligaciones";

const ESTADO: Record<EstadoObligacion, { tono: "verde" | "ambar" | "gris"; texto: string }> = {
  confirmado: { tono: "verde", texto: "Claro" },
  pendiente: { tono: "ambar", texto: "Por confirmar con el asesor" },
  futuro: { tono: "gris", texto: "Más adelante" },
};

const GRUPOS = ["Fiscales", "Protección de datos", "Consumo y reclamaciones"] as const;

const fechaLarga = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

export default async function ObligacionesPage() {
  await requireAdmin();

  // Próximos vencimientos con fecha fija, ordenados por cercanía.
  const proximos = OBLIGACIONES.filter((o) => o.fechas)
    .map((o) => ({ o, ...proximoVencimiento(o.fechas!) }))
    .sort((a, b) => a.dias - b.dias);

  const porConfirmar = OBLIGACIONES.filter((o) => o.estado === "pendiente").length;

  return (
    <>
      <PageHeader
        title="Obligaciones"
        subtitle="Lo que Coxiro tiene que cumplir con Hacienda, con la protección de datos y con los clientes, en un solo sitio."
      />

      <Card className="mb-4 p-4 text-xs text-cx-texto-2 space-y-1">
        <p>
          <strong className="text-cx-noche">Cómo leerlo:</strong> «Claro» es lo que ya está fijado por el asesor o por la
          norma. «Por confirmar» son {porConfirmar} puntos que hay que cerrar con el asesor antes de darlos por
          cumplidos. Los plazos son los generales: si el último día cae en fin de semana o festivo, pasa al siguiente día
          hábil. Esta lista es una guía de seguimiento, no sustituye al asesor.
        </p>
        <p>
          Cálculos relacionados: <a href="/admin/impuestos" className="underline">Impuestos y simulador</a> ·{" "}
          <a href="/admin/contabilidad" className="underline">Contabilidad por venta</a> ·{" "}
          <a href="/admin/rat" className="underline">Registro de tratamientos</a> ·{" "}
          <a href="/admin/documentos" className="underline">Documentos del asesor</a>
        </p>
      </Card>

      <Card className="mb-4 p-5">
        <h2 className="font-display text-base font-semibold text-cx-noche mb-3">Próximos vencimientos</h2>
        <ul className="divide-y divide-cx-borde">
          {proximos.map(({ o, fecha, dias }) => (
            <li key={o.id} className="py-2 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm text-cx-noche">{o.titulo}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-cx-texto-2">{fechaLarga(fecha)}</span>
                <Badge tone={dias <= 30 ? "ambar" : "gris"}>
                  {dias === 0 ? "hoy" : dias === 1 ? "mañana" : `en ${dias} días`}
                </Badge>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-cx-texto-2">
          Solo las obligaciones con fecha fija. Las marcadas «por confirmar» pueden no aplicarte: el asesor lo decide.
        </p>
      </Card>

      {GRUPOS.map((g) => (
        <section key={g} className="mb-6">
          <h2 className="font-display text-lg font-semibold text-cx-noche mb-2">{g}</h2>
          <div className="grid gap-3">
            {OBLIGACIONES.filter((o) => o.grupo === g).map((o) => (
              <Card key={o.id} className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h3 className="font-medium text-cx-noche">{o.titulo}</h3>
                  <Badge tone={ESTADO[o.estado].tono}>{ESTADO[o.estado].texto}</Badge>
                </div>
                <p className="mt-1.5 text-sm text-cx-texto-2 leading-relaxed">{o.que}</p>
                <p className="mt-1.5 text-sm text-cx-texto-2">
                  <strong className="text-cx-noche">Cuándo:</strong> {o.cuando}
                </p>
                {o.nota && <p className="mt-1.5 text-xs text-cx-texto-2 leading-relaxed">{o.nota}</p>}
                <p className="mt-2 text-[11px] text-cx-texto-2">Fuente: {o.fuente}</p>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
