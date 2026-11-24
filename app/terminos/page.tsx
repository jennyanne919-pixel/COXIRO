import type { Metadata } from "next";
import Logo from "@/components/Logo";
import LegalDoc from "@/components/LegalDoc";
import { TERMINOS_HTML } from "@/lib/legal/terminos";

export const metadata: Metadata = {
  title: "Términos y condiciones — Coxiro",
};

// Texto en lib/legal/terminos.ts (adaptado del documento revisado por el asesor).

export default function Page() {
  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="border-b border-cx-borde bg-cx-hielo">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" aria-label="Volver al inicio">
            <Logo variant="light" />
          </a>
        </div>
      </header>
      <LegalDoc html={TERMINOS_HTML} />
    </main>
  );
}
