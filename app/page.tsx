import Logo from "@/components/Logo";

const AUDIENCE = [
  "Creadores de contenido",
  "Entrenadores",
  "Mentores",
  "Formadores",
  "Diseñadores",
];

const STEPS = [
  { n: "01", title: "Sube tu servicio", body: "Contenido, mentoría o asesoría. Fija tu precio, tú decides cómo lo entregas." },
  { n: "02", title: "Tu cliente paga", body: "Procesamos el cobro y emitimos la factura, tanto a tu cliente como a ti." },
  { n: "03", title: "Tú cobras, sin gestión", body: "Recibes tu pago automáticamente. Sin hojas de cálculo, sin perseguir facturas." },
];

const FEATURES = [
  { title: "Pagos y cobros", body: "Pasarela de pago integrada para cobrar a tus clientes de forma segura.", soon: false },
  { title: "Facturación automática", body: "Factura al proveedor y al cliente final en cada cobro, sin intervención manual.", soon: false },
  { title: "Área privada de contenido", body: "Sube tus materiales y tus clientes acceden desde su propio espacio.", soon: false },
  { title: "Automatizaciones", body: "Recordatorios y flujos que hoy haces a mano.", soon: true },
  { title: "Analítica de tu negocio", body: "Cuánto vendes, quién te compra, qué funciona.", soon: true },
  { title: "Afiliados e IA", body: "Haz crecer tu alcance y apóyate en IA para vender mejor.", soon: true },
];

export default function LandingPage() {
  return (
    <main>
      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-stone/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 py-4 gap-6">
          <a href="/" className="flex-shrink-0">
            <Logo variant="light" />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone flex-1 justify-center">
            <a href="/catalogo" className="hover:text-ink whitespace-nowrap">Productos digitales</a>
            <div className="relative group">
              <button className="hover:text-ink whitespace-nowrap">Herramientas</button>
              <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-stone/20 rounded-lg shadow-lg py-2 min-w-[220px] z-50">
                <a href="/herramientas/publica-tu-contenido" className="block px-4 py-2 text-sm hover:bg-paper">Publica tu contenido</a>
                <a href="/herramientas/dashboard" className="block px-4 py-2 text-sm hover:bg-paper">Dashboard</a>
                <a href="/herramientas/pasarela-de-pagos" className="block px-4 py-2 text-sm hover:bg-paper">Pasarela de pagos</a>
                <a href="/herramientas/suscripciones" className="block px-4 py-2 text-sm hover:bg-paper">Suscripciones y pagos recurrentes</a>
              </div>
            </div>
            <a href="#como-funciona" className="hover:text-ink whitespace-nowrap">Cómo funciona</a>
            <a href="#para-quien" className="hover:text-ink whitespace-nowrap">Para quién</a>
            <a href="#incluye" className="hover:text-ink whitespace-nowrap">Qué incluye</a>
            <a href="/herramientas/partners" className="hover:text-ink whitespace-nowrap">Partners</a>
            <a href="/ayuda" className="hover:text-ink whitespace-nowrap">Ayuda</a>
          </nav>

          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <a
              href="/login"
              className="rounded-lg border border-stone/30 px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink transition whitespace-nowrap"
            >
              Iniciar sesión
            </a>
            <a
              href="/registro"
              className="rounded-lg bg-copper px-5 py-2.5 text-sm font-semibold text-paper hover:bg-copper-dark transition whitespace-nowrap"
            >
              Regístrate
            </a>
          </div>

          <details className="md:hidden relative">
            <summary className="list-none cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg border border-stone/25">
              <span className="sr-only">Menú</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-stone/20 rounded-lg shadow-lg py-2 flex flex-col">
              <a href="/registro" className="px-4 py-2.5 text-sm font-semibold text-copper">Regístrate</a>
              <a href="/login" className="px-4 py-2.5 text-sm font-semibold">Iniciar sesión</a>
              <div className="border-t border-stone/20 my-1" />
              <a href="/catalogo" className="px-4 py-2.5 text-sm">Productos digitales</a>
              <a href="/herramientas/publica-tu-contenido" className="px-4 py-2.5 text-sm">Publica tu contenido</a>
              <a href="/herramientas/dashboard" className="px-4 py-2.5 text-sm">Dashboard</a>
              <a href="/herramientas/pasarela-de-pagos" className="px-4 py-2.5 text-sm">Pasarela de pagos</a>
              <a href="/herramientas/suscripciones" className="px-4 py-2.5 text-sm">Suscripciones y pagos recurrentes</a>
              <div className="border-t border-stone/20 my-1" />
              <a href="#como-funciona" className="px-4 py-2.5 text-sm">Cómo funciona</a>
              <a href="#para-quien" className="px-4 py-2.5 text-sm">Para quién</a>
              <a href="#incluye" className="px-4 py-2.5 text-sm">Qué incluye</a>
              <a href="/herramientas/partners" className="px-4 py-2.5 text-sm">Partners</a>
              <a href="/ayuda" className="px-4 py-2.5 text-sm">Ayuda</a>
            </div>
          </details>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink text-paper py-28 md:py-36">
        <div className="max-w-5xl mx-auto px-8 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-copper">
            La infraestructura para profesionales
          </span>
          <h1 className="font-display font-semibold text-4xl md:text-5xl leading-tight mt-5 mb-5">
            Haz lo que mejor sabes hacer.
            <br />
            Nosotros hacemos el resto.
          </h1>
          <p className="text-lg text-paper/70 max-w-md mb-9">
            Tu talento. Nuestra infraestructura. Cobra a tus clientes, factura
            sin líos y comparte tu contenido, sin montar tú la tecnología
            detrás.
          </p>
          <div className="flex gap-3.5 flex-wrap">
            <a href="/registro" className="rounded-lg bg-copper px-6 py-3 text-sm font-semibold hover:bg-copper-dark transition">
              Empieza gratis
            </a>
            <a href="#como-funciona" className="rounded-lg border border-paper/30 px-6 py-3 text-sm font-semibold hover:border-paper transition">
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>

      <section id="para-quien" className="py-24 max-w-5xl mx-auto px-8">
        <div className="max-w-lg mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-copper">
            Para quién es Coxiro
          </span>
          <h2 className="font-display font-semibold text-3xl mt-3">
            Cualquier profesional que venda su talento online
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {AUDIENCE.map((a) => (
            <span key={a} className="rounded-full border border-stone/25 bg-white px-4.5 py-2.5 text-sm font-medium">
              {a}
            </span>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="py-24 bg-white border-y border-stone/20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="max-w-lg mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-copper">
              Cómo funciona
            </span>
            <h2 className="font-display font-semibold text-3xl mt-3">
              De tu conocimiento a tu primer cobro, en tres pasos
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-stone/20 border border-stone/20 rounded-2xl overflow-hidden">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white p-8">
                <div className="font-display text-sm font-semibold text-copper mb-4">{s.n}</div>
                <h3 className="text-lg font-medium mb-2">{s.title}</h3>
                <p className="text-sm text-stone">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="incluye" className="py-24 max-w-5xl mx-auto px-8">
        <div className="max-w-lg mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-copper">
            Qué incluye desde el día uno
          </span>
          <h2 className="font-display font-semibold text-3xl mt-3">
            Lo esencial para empezar a cobrar esta semana
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-stone/20 bg-white p-7">
              <div className="w-10 h-10 rounded-lg bg-ink mb-5" />
              <h3 className="text-lg font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-stone">{f.body}</p>
              {f.soon && (
                <span className="inline-block mt-3.5 text-[11px] font-semibold uppercase tracking-wide text-stone border border-stone/20 rounded-full px-2.5 py-1">
                  Próximamente
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-paper py-24 text-center">
        <p className="font-display text-2xl md:text-3xl font-medium max-w-2xl mx-auto leading-snug px-8">
          No somos un curso más, ni una simple pasarela de pago. Somos{" "}
          <span className="text-copper">la infraestructura</span> que hay
          detrás de tu negocio.
        </p>
      </section>

      <section id="acceso" className="py-24 max-w-5xl mx-auto px-8">
        <div className="rounded-2xl border border-stone/20 bg-white p-10 md:p-14 flex flex-wrap items-center justify-between gap-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-copper">
              Acceso anticipado
            </span>
            <h2 className="font-display font-semibold text-2xl mt-3 max-w-sm">
              Empieza a cobrar a tus primeros clientes esta semana
            </h2>
          </div>
          <form className="flex gap-2.5 flex-wrap">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              className="rounded-lg border border-stone/25 bg-paper px-4 py-3 text-sm min-w-[240px]"
            />
            <button className="rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-paper hover:bg-copper-dark transition">
              Quiero acceso
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-stone/20 py-10">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between flex-wrap gap-4">
          <Logo variant="light" size={20} />
          <p className="text-xs text-stone">© 2026 Coxiro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
