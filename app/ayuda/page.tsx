import Logo from "@/components/Logo";

export default function AyudaPage() {
  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="px-8 py-5">
        <a href="/">
          <Logo variant="light" />
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs text-cx-texto-2 uppercase tracking-wide font-semibold mb-2">
          Ayuda
        </p>
        <h1 className="text-3xl font-display font-semibold mb-5">
          ¿En qué podemos ayudarte?
        </h1>
        <p className="text-lg text-cx-texto-2 mb-8">
          Escríbenos y te responderemos lo antes posible.
        </p>
        <a
          href="mailto:coxiro.info@gmail.com"
          className="inline-block rounded-full bg-cx-celeste px-6 py-3 text-sm font-semibold text-cx-noche hover:brightness-105 transition"
        >
          coxiro.info@gmail.com
        </a>

        <div className="mt-12 grid gap-3">
          <a href="/terminos" className="text-sm text-cx-texto underline">
            Términos y Condiciones
          </a>
          <a href="/aviso-legal" className="text-sm text-cx-texto underline">
            Aviso Legal y Política de Privacidad
          </a>
          <a href="/cookies" className="text-sm text-cx-texto underline">
            Política de Cookies
          </a>
        </div>
      </div>
    </main>
  );
}
