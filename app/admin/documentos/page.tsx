import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { DOCUMENTOS_ASESOR } from "@/lib/legal/documentos-asesor";

export default async function DocumentosPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Documentos"
        subtitle="Documentos internos del asesor para llevar Coxiro: reclamaciones, cumplimiento y protección de datos."
      />
      <div className="grid gap-3">
        {DOCUMENTOS_ASESOR.map((d) => (
          <a key={d.slug} href={`/admin/documentos/${d.slug}`} className="block">
            <Card className="p-5 hover:border-cx-celeste transition">
              <p className="text-xs text-cx-texto-2 uppercase tracking-wide font-semibold mb-1">Documento {d.numero}</p>
              <h2 className="font-display text-base font-semibold text-cx-noche">{d.titulo}</h2>
              <p className="mt-1 text-sm text-cx-texto-2 leading-relaxed">{d.descripcion}</p>
            </Card>
          </a>
        ))}
        <a href="/admin/rat" className="block">
          <Card className="p-5 hover:border-cx-celeste transition">
            <p className="text-xs text-cx-texto-2 uppercase tracking-wide font-semibold mb-1">Parte del documento 9</p>
            <h2 className="font-display text-base font-semibold text-cx-noche">Registro de tratamientos (RAT)</h2>
            <p className="mt-1 text-sm text-cx-texto-2 leading-relaxed">
              Las siete actividades de tratamiento, en página propia y con la tabla de prestadores tecnológicos para completar.
            </p>
          </Card>
        </a>
        <a href="/admin/obligaciones" className="block">
          <Card className="p-5 hover:border-cx-celeste transition">
            <p className="text-xs text-cx-texto-2 uppercase tracking-wide font-semibold mb-1">Seguimiento</p>
            <h2 className="font-display text-base font-semibold text-cx-noche">Obligaciones fiscales y legales</h2>
            <p className="mt-1 text-sm text-cx-texto-2 leading-relaxed">
              Vencimientos y puntos pendientes con el asesor: modelo 130, 238, Verifactu, IPSI, protección de datos y reclamaciones.
            </p>
          </Card>
        </a>
      </div>
    </>
  );
}
