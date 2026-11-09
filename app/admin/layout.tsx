import Logo from "@/components/Logo";
import DashboardNav, { type NavItem } from "@/components/dashboard/DashboardNav";
import { requireAdmin } from "@/lib/admin/auth";

const ADMIN_NAV: NavItem[] = [
  { label: "Resumen", href: "/admin", icon: "trend" },
  { label: "Libro de ingresos", href: "/admin/ingresos", icon: "cobros" },
  { label: "Gastos", href: "/admin/gastos", icon: "bag" },
  { label: "Impuestos y simulador", href: "/admin/impuestos", icon: "doc" },
  { label: "Lista de espera", href: "/admin/waitlist", icon: "users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-60 bg-cx-noche flex-shrink-0 md:sticky md:top-0 md:h-screen py-3 md:py-6 px-3 flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-0">
        <a href="/admin" className="px-1 md:px-3 md:pb-2 flex-shrink-0">
          <Logo variant="dark" size={20} />
        </a>
        <span className="hidden md:block px-3 pb-6 text-[10px] uppercase tracking-wide text-cx-celeste">
          Administración
        </span>
        <DashboardNav items={ADMIN_NAV} />
        <a
          href="/dashboard"
          className="hidden md:block px-3 py-2 text-xs text-white/50 hover:text-white"
        >
          Salir del panel admin
        </a>
      </aside>
      <main className="flex-1 min-w-0 bg-cx-hielo/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
