import Logo from "@/components/Logo";

export default function HerramientaDashboardPage() {
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
          Dashboard
        </h1>
        <p className="text-lg text-cx-texto-2 mb-8">
          Analiza tus ventas y resultados en tiempo real. Cuánto has cobrado
          este mes, qué está pendiente, y quiénes son tus clientes — todo en
          un único panel, sin hojas de cálculo.
        </p>
        <a
          href="/registro"
          className="inline-block rounded-full bg-cx-celeste px-6 py-3 text-sm font-semibold text-cx-noche hover:brightness-105 transition"
        >
          Empieza gratis
        </a>
      </div>
    </main>
  );
}
