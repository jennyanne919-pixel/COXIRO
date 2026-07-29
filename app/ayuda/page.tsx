import Logo from "@/components/Logo";

export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <a href="/">
          <Logo variant="light" />
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">
          Ayuda
        </p>
        <h1 className="text-3xl font-display font-semibold mb-5">
          ¿En qué podemos ayudarte?
        </h1>
        <p className="text-lg text-stone mb-8">
          Escríbenos y te responderemos lo antes posible.
        </p>
        <a
          href="mailto:info.coxiro@gmail.com"
          className="inline-block rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-paper hover:bg-copper-dark transition"
        >
          info.coxiro@gmail.com
        </a>

        <div className="mt-12 grid gap-3">
          <a href="/legal/terminos" className="text-sm text-ink underline">
            Términos y Condiciones
          </a>
          <a href="/legal/privacidad" className="text-sm text-ink underline">
            Política de Privacidad
          </a>
          <a href="/legal/aviso-legal" className="text-sm text-ink underline">
            Aviso Legal
          </a>
        </div>
      </div>
    </main>
  );
}
