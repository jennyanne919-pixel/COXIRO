import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

// Menú del proveedor: gestiona lo que vende y lo que cobra.
const PROVIDER_NAV = [
  { label: "Cobros y facturas", href: "/dashboard", soon: false },
  { label: "Mis servicios", href: "/dashboard/servicios", soon: false },
  { label: "Solicitudes", href: "/dashboard/solicitudes", soon: false },
  { label: "Mis partners", href: "/dashboard/referidos", soon: false },
  { label: "Mis clientes", href: "#", soon: true },
  { label: "Mi perfil", href: "/dashboard/perfil", soon: false },
];

// Menú del cliente: lo que ha comprado, no lo que cobra.
const CLIENT_NAV = [
  { label: "Mis compras", href: "/dashboard", soon: false },
  { label: "Mi contenido", href: "/dashboard/contenido", soon: false },
  { label: "Productos digitales", href: "/catalogo", soon: false },
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
  const NAV = isProvider ? PROVIDER_NAV : CLIENT_NAV;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-52 bg-ink flex-shrink-0 py-3 md:py-6 px-3 flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-0">
        <a href="/" className="px-1 md:px-2 md:pb-6 flex-shrink-0">
          <Logo variant="dark" size={20} />
        </a>

        <nav className="flex flex-row md:flex-col gap-1 md:gap-0.5 flex-1 overflow-x-auto md:overflow-visible">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.soon ? undefined : item.href}
              aria-disabled={item.soon}
              className={`text-sm rounded-lg px-2.5 py-2 whitespace-nowrap ${
                item.soon
                  ? "text-stone/50 cursor-default"
                  : "text-paper/80 hover:bg-white/5"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <form action={signOut} className="flex-shrink-0 md:w-full">
          <button className="text-sm text-paper/60 hover:text-paper px-2.5 py-2 whitespace-nowrap md:w-full md:text-left">
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-white p-5 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
