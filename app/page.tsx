import Logo from "@/components/Logo";


const AUDIENCE = [  "Creadores de contenido",
  "Entrenadores",
  "Mentores",
  "Formadores",
  "Diseñadores",
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
        <div className="max-w-5xl mx-auto flex items-center justify-between px-8 py-4">
          <Logo />
          <nav className="hidden md:flex gap-8 text-sm font-medium text-stone">
            <a href="#como-funciona" className="hover:text-ink">Cómo funciona</a>
            <a href="#para-quien" className="hover:text-ink">Para quién</a>
            <a href="#incluye" className="hover:text-ink">Qué incluye</a>
          <a href="/catalogo" className="hover:text-ink">Productos digitales</a>
<a href="#" className="hover:text-ink">Herramientas</a>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-stone hover:text-ink hidden sm:block">
              Iniciar sesión
            </a>
            <a
              href="/registro"
              className="rounded-lg bg-copper px-5 py-2.5 text-sm font-semibold text-paper hover:bg-copper-dark transition"
            >
              Regístrate
            </a>
          </div>
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
          <Logo size={20} />
          <p className="text-xs text-stone">© 2026 Coxiro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
