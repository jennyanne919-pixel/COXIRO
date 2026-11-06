import Logo from "@/components/Logo";
import SocialLinks from "@/components/SocialLinks";

// Pie de página común a todas las páginas (se monta en app/layout.tsx).
export default function SiteFooter() {
  return (
    <footer className="border-t border-cx-borde bg-cx-hielo py-10">
      <div className="max-w-5xl mx-auto px-8 flex items-center justify-between flex-wrap gap-6">
        <Logo variant="light" size={20} />
        <nav
          aria-label="Información legal"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-cx-texto-2"
        >
          <a href="/terminos" className="hover:text-cx-texto">Términos y condiciones</a>
          <a href="/aviso-legal" className="hover:text-cx-texto">Aviso legal y privacidad</a>
          <a href="/cookies" className="hover:text-cx-texto">Política de cookies</a>
        </nav>
        <SocialLinks />
        <p className="text-xs text-cx-texto-2 w-full md:w-auto">
          © 2026 Coxiro. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
