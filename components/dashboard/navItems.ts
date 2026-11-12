import { CONDICIONES_RUTA } from "@/lib/condiciones";
import type { NavItem } from "./DashboardNav";

// Menú del proveedor: gestiona lo que vende y lo que cobra.
export const PROVIDER_NAV: NavItem[] = [
  { label: "Cobros y facturas", href: "/dashboard", icon: "cobros" },
  { label: "Mis servicios", href: "/dashboard/servicios", icon: "servicios" },
  { label: "Solicitudes", href: "/dashboard/solicitudes", icon: "inbox" },
  { label: "Dudas de alumnos", href: "/dashboard/dudas", icon: "inbox" },
  { label: "Suscripciones", href: "/dashboard/suscripciones", icon: "users" },
  { label: "Mis partners", href: "/dashboard/referidos", icon: "partners" },
  { label: "Mis clientes", href: "#", icon: "users", soon: true },
  { label: "Mi perfil", href: "/dashboard/perfil", icon: "user" },
  { label: "Condiciones económicas", href: CONDICIONES_RUTA, icon: "doc" },
];

// Menú del cliente: lo que ha comprado, no lo que cobra.
export const CLIENT_NAV: NavItem[] = [
  { label: "Mis compras", href: "/dashboard", icon: "bag" },
  { label: "Mi contenido", href: "/dashboard/contenido", icon: "play" },
  { label: "Productos digitales", href: "/catalogo", icon: "globe" },
  { label: "Mi perfil", href: "/dashboard/mi-cuenta", icon: "user" },
];

