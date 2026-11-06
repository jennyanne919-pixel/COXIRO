import Logo from "@/components/Logo";

export default function HerramientaSuscripcionesPage() {
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
          Suscripciones y pagos recurrentes
        </h1>
        <p className="text-lg text-cx-texto-2 mb-8">
          Cobra automáticamente cada mes por tus servicios de larga duración
          (mentorías de varios meses, membresías, programas de
          acompañamiento) — tu cliente lo domicilia una vez, y se olvida.
        </p>
        <a
          href="/registro"
          className="inline-block rounded-full bg-cx-celeste px-6 py-3 text-sm font-semibold text-cx-noche hover:brightness-105 transition"
        >
          Regístrate
        </a>
      </div>
    </main>
  );
}
