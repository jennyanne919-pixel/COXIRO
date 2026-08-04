import Logo from "@/components/Logo";

export default function HerramientaSuscripcionesPage() {
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
          Suscripciones y pagos recurrentes
        </h1>
        <p className="text-lg text-stone mb-8">
          Cobra automáticamente cada mes por tus servicios de larga duración
          (mentorías de varios meses, membresías, programas de
          acompañamiento) — tu cliente lo domicilia una vez, y se olvida.
        </p>
        <a
          href="/registro"
          className="inline-block rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-paper hover:bg-copper-dark transition"
        >
          Regístrate
        </a>
      </div>
    </main>
  );
}
