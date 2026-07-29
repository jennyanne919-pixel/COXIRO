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
        <span className="inline-block mb-5 text-xs font-semibold uppercase tracking-wide text-stone border border-stone/20 rounded-full px-3 py-1">
          Próximamente
        </span>
        <p className="text-lg text-stone mb-8">
          Cobra automáticamente cada mes por tus servicios de larga duración
          (mentorías de varios meses, membresías, programas de
          acompañamiento) — tu cliente lo domicilia una vez, y se olvida.
          Estamos construyéndolo.
        </p>
        <a
          href="/registro"
          className="inline-block rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-paper hover:bg-copper-dark transition"
        >
          Regístrate para ser de los primeros en probarlo
        </a>
      </div>
    </main>
  );
}
