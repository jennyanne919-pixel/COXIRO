import Logo from "@/components/Logo";

export default function HerramientaPublicaContenidoPage() {
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
          Publica tu contenido / servicio
        </h1>
        <p className="text-lg text-stone mb-8">
          Sube tus cursos online, mentorías o cualquier servicio que se pueda
          prestar online. Fija tu precio, tú decides cómo lo entregas —
          nosotros nos encargamos del cobro, la factura y el acceso.
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
