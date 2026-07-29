import Logo from "@/components/Logo";

export default function HerramientaPasarelaPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <a href="/">
          <Logo variant="light" />
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">
          Herramientas
        </p>
        <h1 className="text-3xl font-display font-semibold mb-5">
          Pasarela de pagos
        </h1>
        <p className="text-lg text-stone mb-8">
          La seguridad que tu negocio necesita. Cobra a tus clientes con
          tarjeta de forma segura, sin gestionar tú ninguna infraestructura
          de pago — nosotros nos encargamos de que cada cobro llegue bien, y
          de que tu dinero llegue a tu cuenta automáticamente.
        </p>
        <a
          href="/registro"
          className="inline-block rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-paper hover:bg-copper-dark transition"
        >
          Empieza gratis
        </a>
      </div>
    </main>
  );
}
