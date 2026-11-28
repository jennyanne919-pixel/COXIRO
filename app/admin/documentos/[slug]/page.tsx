import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import LegalDoc from "@/components/LegalDoc";
import { PageHeader, BTN_SECONDARY } from "@/components/dashboard/ui";
import ImprimirButton from "./ImprimirButton";
import { DOCUMENTOS_ASESOR } from "@/lib/legal/documentos-asesor";

export default async function DocumentoPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const doc = DOCUMENTOS_ASESOR.find((d) => d.slug === slug);
  if (!doc) notFound();

  return (
    <>
      {/* Al imprimir o guardar como PDF solo sale el documento, sin el menú de Admin. */}
      <style>{`@media print { aside, .no-imprimir { display: none !important; } main { background: #fff !important; } }`}</style>
      <PageHeader title={doc.titulo} subtitle={`Documento ${doc.numero} del asesor`} />
      <div className="no-imprimir mb-3 flex items-center gap-2 flex-wrap">
        <a href={`/admin/documentos/${doc.slug}/descargar`} className={BTN_SECONDARY}>
          Descargar Word (.doc)
        </a>
        <ImprimirButton />
      </div>
      <p className="no-imprimir mb-3 text-xs text-cx-texto-2">
        <a href="/admin/documentos" className="underline">
          ← Todos los documentos
        </a>
        {doc.numero === 9 && (
          <>
            {" "}
            · <a href="/admin/rat" className="underline">Registro de tratamientos (RAT)</a>
          </>
        )}
        {doc.numero === 8 && (
          <>
            {" "}
            · Formulario público: <a href="/reclamaciones" className="underline">/reclamaciones</a>
          </>
        )}
      </p>
      <div className="rounded-xl bg-white border border-cx-borde">
        <LegalDoc html={doc.html} />
      </div>
    </>
  );
}
