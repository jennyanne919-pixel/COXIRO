import Logo from "@/components/Logo";
import SocialLinks from "@/components/SocialLinks";

// Pie de página común a todas las páginas (se monta en app/layout.tsx).
export default function SiteFooter() {
  return (
    <footer className="bg-cx-noche text-cx-texto-osc-2 py-10">
      <div className="max-w-5xl mx-auto px-8 flex items-center justify-between flex-wrap gap-6">
        <Logo variant="dark" size={20} />
        <nav
          aria-label="Información legal"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-cx-texto-osc-2"
        >
          <a href="/terminos" className="hover:text-white">Términos y condiciones</a>
          <a href="/aviso-legal" className="hover:text-white">Aviso legal y privacidad</a>
          <a href="/cookies" className="hover:text-white">Política de cookies</a>
        </nav>
        <SocialLinks oscuro />
        <a href="mailto:coxiro.info@gmail.com" className="text-xs hover:text-white">coxiro.info@gmail.com</a>
        <p className="text-xs text-cx-texto-osc-2 w-full md:w-auto">
          © 2026 Coxiro
        </p>
      </div>
    </footer>
  );
}
