import { cookies } from "next/headers";
import { esAdminEmail } from "./auth";

export type Vista = "proveedor" | "cliente";

// Solo para administradores: permite ver el panel como lo ve un
// proveedor o un cliente (para probar cambios) sin cambiar de cuenta.
// La cookie solo cambia QUÉ PANTALLAS se muestran; los datos siguen
// siendo los de la propia cuenta y nunca se ve información de otros.
export async function vistaElegida(email?: string | null): Promise<Vista | null> {
  if (!esAdminEmail(email)) return null;
  const v = (await cookies()).get("cx_vista")?.value;
  return v === "proveedor" || v === "cliente" ? v : null;
}

// Rol con el que se pintan las pantallas del dashboard.
export async function rolEfectivo(email: string | null | undefined, rolReal?: string | null) {
  const vista = await vistaElegida(email);
  if (vista === "proveedor") return "provider";
  if (vista === "cliente") return "client";
  return rolReal === "provider" ? "provider" : "client";
}
