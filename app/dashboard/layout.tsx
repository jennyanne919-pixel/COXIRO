import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { tieneAceptacionVigente } from "@/lib/acceptances";
import { CONDICIONES_RUTA } from "@/lib/condiciones";
import DashboardNav, { type NavItem } from "@/components/dashboard/DashboardNav";
import { Icon } from "@/components/dashboard/ui";

// Menú del proveedor: gestiona lo que vende y lo que cobra.
const PROVIDER_NAV: NavItem[] = [
  { label: "Cobros y facturas", href: "/dashboard", icon: "cobros" },
  { label: "Mis servicios", href: "/dashboard/servicios", icon: "servicios" },
  { label: "Solicitudes", href: "/dashboard/solicitudes", icon: "inbox" },
  { label: "Mis partners", href: "/dashboard/referidos", icon: "partners" },
  { label: "Mis clientes", href: "#", icon: "users", soon: true },
  { label: "Mi perfil", href: "/dashboard/perfil", icon: "user" },
  { label: "Condiciones económicas", href: CONDICIONES_RUTA, icon: "doc" },
];

// Menú del cliente: lo que ha comprado, no lo que cobra.
const CLIENT_NAV: NavItem[] = [
  { label: "Mis compras", href: "/dashboard", icon: "bag" },
  { label: "Mi contenido", href: "/dashboard/contenido", icon: "play" },
  { label: "Productos digitales", href: "/catalogo", icon: "globe" },
  { label: "Mi perfil", href: "/dashboard/mi-cuenta", icon: "user" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isProvider = profile?.role === "provider";

  // Si el profesional no ha aceptado la versión vigente de las condiciones,
  // se le pide antes de dejarle usar el panel.
  if (isProvider && !(await tieneAceptacionVigente(supabase, user.id))) {
    redirect("/aceptar-condiciones");
  }
  const NAV = isProvider ? PROVIDER_NAV : CLIENT_NAV;

  let nombre = user.email ?? "";
  if (isProvider) {
    const { data: prov } = await supabase
      .from("providers")
      .select("business_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (prov?.business_name) nombre = prov.business_name;
  }
  const inicial = (nombre[0] ?? "?").toUpperCase();

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-60 bg-cx-noche flex-shrink-0 md:sticky md:top-0 md:h-screen py-3 md:py-6 px-3 flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-0">
        <a href="/" className="px-1 md:px-3 md:pb-7 flex-shrink-0">
          <Logo variant="dark" size={20} />
        </a>

        <DashboardNav items={NAV} />

        <div className="flex-shrink-0 md:border-t md:border-white/10 md:pt-4 flex items-center gap-2.5">
          <span className="hidden md:flex w-9 h-9 rounded-full bg-cx-celeste/20 text-cx-celeste font-display font-bold items-center justify-center shrink-0">
            {inicial}
          </span>
          <div className="hidden md:block min-w-0 flex-1">
            <p className="text-sm text-white truncate">{nombre}</p>
            <p className="text-xs text-cx-texto-osc-2">{isProvider ? "Profesional" : "Cliente"}</p>
          </div>
          <form action={signOut}>
            <button
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center"
            >
              <Icon name="logout" className="w-[18px] h-[18px]" />
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-cx-hielo/40 p-5 md:p-10 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
