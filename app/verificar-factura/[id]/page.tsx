import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verificación de factura — Coxiro",
  robots: { index: false, follow: false },
};

const eur = (n: number) =>
  Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

// Página pública a la que lleva el QR de cada factura. Solo muestra datos básicos
// del documento (nada del comprador). El identificador es un UUID imposible de adivinar.
export default async function VerificarFactura({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const valido = /^[0-9a-f-]{36}$/i.test(id);
  const { data: f } = valido
    ? await createAdminClient()
        .from("invoices")
        .select("invoice_number, issued_at, issuer_name, type, total, hash")
        .eq("id", id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="border-b border-cx-borde bg-cx-hielo">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" aria-label="Volver al inicio">
            <Logo variant="light" />
          </a>
        </div>
      </header>
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold text-cx-texto">Verificación de factura</h1>
        {!f ? (
          <p className="mt-4 text-sm text-cx-texto-2">
            No hemos encontrado ninguna factura con este código. Comprueba que has escaneado el
            QR completo o escríbenos a coxiro.info@gmail.com.
          </p>
        ) : (
          <div className="mt-4 rounded-xl border border-cx-borde bg-white p-5 text-sm text-cx-texto space-y-2">
            <p className="font-medium text-emerald-700">Esta factura figura en el registro de Coxiro.</p>
            <p><span className="text-cx-texto-2">Número:</span> {f.invoice_number}</p>
            <p><span className="text-cx-texto-2">Fecha:</span> {new Date(f.issued_at).toLocaleDateString("es-ES")}</p>
            <p><span className="text-cx-texto-2">Emisor:</span> {f.issuer_name}</p>
            <p>
              <span className="text-cx-texto-2">Tipo:</span>{" "}
              {f.type === "client_invoice" ? "Factura al cliente" : "Liquidación al profesional"}
            </p>
            <p><span className="text-cx-texto-2">Importe total:</span> {eur(Number(f.total))}</p>
            <p className="break-all"><span className="text-cx-texto-2">Huella:</span> {f.hash}</p>
          </div>
        )}
        <p className="mt-6 text-xs text-cx-texto-2">
          Esta comprobación confirma que el documento está registrado en Coxiro. Es un sistema
          propio de verificación.
        </p>
      </div>
    </main>
  );
}
