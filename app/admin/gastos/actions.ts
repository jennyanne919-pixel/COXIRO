"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIAS } from "@/lib/admin/contabilidad";

const num = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
};

export async function crearGasto(formData: FormData) {
  await requireAdmin();

  const fecha = String(formData.get("fecha") ?? "");
  const concepto = String(formData.get("concepto") ?? "").trim().slice(0, 200);
  const proveedor = String(formData.get("proveedor") ?? "").trim().slice(0, 120) || null;
  const categoria = String(formData.get("categoria") ?? "");
  const base = num(formData.get("base"));
  const cuotaRaw = String(formData.get("cuota") ?? "").trim();
  const cuota = cuotaRaw === "" ? 0 : num(formData.get("cuota"));
  const deducible = formData.get("deducible") === "on";
  const notas = String(formData.get("notas") ?? "").trim().slice(0, 500) || null;

  const valido =
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    concepto.length > 0 &&
    (CATEGORIAS as readonly string[]).includes(categoria) &&
    Number.isFinite(base) &&
    base >= 0 &&
    Number.isFinite(cuota) &&
    cuota >= 0;

  if (!valido) redirect("/admin/gastos?error=1");

  const admin = createAdminClient();
  const { error } = await admin
    .from("expenses")
    .insert({ fecha, concepto, proveedor, categoria, base, cuota, deducible, notas });

  if (error) {
    console.error("[admin/gastos] Error guardando el gasto:", error);
    redirect("/admin/gastos?error=2");
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/gastos?a=${fecha.slice(0, 4)}&t=0&ok=1`);
}

export async function borrarGasto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;

  const admin = createAdminClient();
  await admin.from("expenses").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}
