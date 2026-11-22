"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { esCategoria } from "@/lib/categorias";

const UUID = /^[0-9a-f-]{36}$/i;

// Aprueba la ficha de un servicio (categoría Mentoría): desde ese momento
// puede publicarse y venderse.
export async function aprobarServicio(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("service_id") ?? "");
  if (!UUID.test(serviceId)) return;
  const admin = createAdminClient();
  await admin
    .from("services")
    .update({ review_status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", serviceId);
  revalidatePath("/admin/fichas");
  revalidatePath("/catalogo");
}

// Cambia la categoría de un profesional y de todos sus servicios. Queda
// registrado quién, cuándo y por qué. El motivo es obligatorio: la
// reclasificación se comunica al profesional con 15 días para alegar.
export async function reclasificarProfesional(formData: FormData) {
  const adminUser = await requireAdmin();
  const providerId = String(formData.get("provider_id") ?? "");
  const nueva = formData.get("categoria");
  const motivo = String(formData.get("motivo") ?? "").trim().slice(0, 500);
  if (!UUID.test(providerId) || !esCategoria(nueva)) return redirect("/admin/fichas?error=datos");
  if (motivo.length < 5) return redirect("/admin/fichas?error=motivo");

  const admin = createAdminClient();
  const { data: p } = await admin.from("providers").select("fiscal_category").eq("user_id", providerId).maybeSingle();
  if (!p || p.fiscal_category === nueva) return redirect("/admin/fichas?error=datos");

  await admin.from("providers").update({ fiscal_category: nueva }).eq("user_id", providerId);
  // Sus servicios pasan a la misma categoría. La decisión del administrador
  // cuenta como revisión: no quedan en «pending».
  await admin
    .from("services")
    .update({ fiscal_category: nueva, review_status: "approved", reviewed_at: new Date().toISOString() })
    .eq("provider_id", providerId);
  await admin.from("category_changes").insert({
    provider_id: providerId,
    old_value: p.fiscal_category,
    new_value: nueva,
    reason: motivo,
    changed_by: adminUser.id,
  });
  revalidatePath("/admin/fichas");
  revalidatePath("/catalogo");
  redirect("/admin/fichas?ok=1");
}
