import Logo from "@/components/Logo";

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="px-8 py-5">
        <a href="/">
          <Logo variant="light" />
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs text-cx-texto-2 uppercase tracking-wide font-semibold mb-2">
          Herramientas
        </p>
        <h1 className="text-3xl font-display font-semibold mb-5">
          Partners
        </h1>
        <p className="text-lg text-cx-texto-2 mb-8">
          Gana un <strong className="text-cx-texto">1% de la facturación</strong>{" "}
          de cada profesional que traigas a Coxiro, durante sus primeros{" "}
          <strong className="text-cx-texto">12 meses</strong> en la plataforma.
          Sin límite de referidos, sin niveles complicados — cuanta más gente
          traigas, más ganas.
        </p>

        <div className="rounded-lg bg-white border border-cx-borde p-6 mb-8">
          <p className="text-sm text-cx-texto-2 mb-1">Ejemplo</p>
          <p className="text-lg font-medium">
            Si tu referido factura 1.000 € en un mes, tú ganas 10 € ese mes —
            automáticamente, sin hacer nada más.
          </p>
        </div>

        <ul className="text-sm text-cx-texto-2 space-y-2 mb-8 list-disc pl-5">
          <li>El pago se hace automáticamente el día 1 de cada mes.</li>
          <li>Se paga directamente a tu cuenta de Stripe conectada.</li>
          <li>Solo necesitas ser proveedor en Coxiro para tener tu propio enlace de partner.</li>
        </ul>

        <a
          href="/registro"
          className="inline-block rounded-full bg-cx-celeste px-6 py-3 text-sm font-semibold text-cx-noche hover:brightness-105 transition"
        >
          Empieza gratis y consigue tu enlace
        </a>
      </div>
    </main>
  );
}
