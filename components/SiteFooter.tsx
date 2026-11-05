import Logo from "@/components/Logo";

// Pie de página común a todas las páginas (se monta en app/layout.tsx).
export default function SiteFooter() {
  return (
    <footer className="border-t border-stone/20 bg-paper py-10">
      <div className="max-w-5xl mx-auto px-8 flex items-center justify-between flex-wrap gap-6">
        <Logo variant="light" size={20} />
        <nav
          aria-label="Información legal"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone"
        >
          <a href="/terminos" className="hover:text-ink">Términos y condiciones</a>
          <a href="/aviso-legal" className="hover:text-ink">Aviso legal y privacidad</a>
          <a href="/cookies" className="hover:text-ink">Política de cookies</a>
        </nav>
        <p className="text-xs text-stone w-full md:w-auto">
          © 2026 Coxiro. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
