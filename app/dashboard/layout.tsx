import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

// Menú del proveedor: gestiona lo que vende y lo que cobra.
const PROVIDER_NAV = [
  { label: "Cobros y facturas", href: "/dashboard", soon: false },
  { label: "Mis servicios", href: "/dashboard/servicios", soon: false },
  { label: "Mis clientes", href: "#", soon: true },
];

// Menú del cliente: lo que ha comprado, no lo que cobra.
const CLIENT_NAV = [
  { label: "Mis compras", href: "/dashboard", soon: false },
  { label: "Mi contenido", href: "/dashboard/contenido", soon: false },
  { label: "Mis facturas", href: "#", soon: true },
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

  // Sin sesión iniciada, no se entra al panel.
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
    <div className="flex min-h-screen">
      <aside className="w-52 bg-ink flex-shrink-0 py-6 px-3 flex flex-col">
        <div className="px-2 pb-6">
          <Logo variant="dark" size={20} />
        </div>
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.soon ? undefined : item.href}
              aria-disabled={item.soon}
              className={`text-sm rounded-lg px-2.5 py-2 ${
                item.soon
                  ? "text-stone/50 cursor-default"
                  : "text-paper/80 hover:bg-white/5"
              }`}
            >
              {item.label}
            </a>
          ))}
        <nav>
        <form action={signOut}>
          <button className="text-sm text-paper/60 hover:text-paper px-2.5 py-2 w-full text-left">
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-white p-8">{children}</main>
    </div>
  );
}
