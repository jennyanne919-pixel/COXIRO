"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";

export async function cambiarVista(formData: FormData) {
  await requireAdmin();
  const destino = String(formData.get("vista") ?? "");
  const jar = await cookies();

  if (destino === "admin") {
    redirect("/admin");
  }

  if (destino === "proveedor" || destino === "cliente") {
    jar.set("cx_vista", destino, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/dashboard");
  }
}
