"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cargarAjustes } from "@/lib/ajustes";
import { esCategoria } from "@/lib/categorias";

const UUID = /^[0-9a-f-]{36}$/i;

// Cambia los porcentajes de una categoría. Solo afecta a ventas FUTURAS de los
// profesionales que ya han aceptado las condiciones de esa categoría. Queda
// registrado quién, cuándo, el valor anterior y el motivo.
export async function guardarAjuste(formData: FormData) {
  const adminUser = await requireAdmin();
  const categoria = formData.get("categoria");
  const modo = formData.get("modo") === "gancho" ? "gancho" : "comision";
  const impuestoTipo = formData.get("impuesto_tipo") === "IPSI" ? "IPSI" : "IVA";
  const porcentaje = Number(String(formData.get("porcentaje") ?? "").replace(",", "."));
  const impuestoPct = Number(String(formData.get("impuesto_pct") ?? "").replace(",", "."));
  const motivo = String(formData.get("motivo") ?? "").trim().slice(0, 500);

  if (!esCategoria(categoria)) return redirect("/admin/ajustes?error=datos");
  if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 30) return redirect("/admin/ajustes?error=rango");
  if (!Number.isFinite(impuestoPct) || impuestoPct < 0 || impuestoPct > 30) return redirect("/admin/ajustes?error=rango");
  if (motivo.length < 5) return redirect("/admin/ajustes?error=motivo");

  const admin = createAdminClient();
  const antes = (await cargarAjustes(admin))[categoria];
  const despues = {
    categoria,
    modo,
    porcentaje: Math.round(porcentaje * 100) / 100,
    impuesto_tipo: impuestoTipo,
    impuesto_pct: Math.round(impuestoPct * 100) / 100,
  };
  if (JSON.stringify(antes) === JSON.stringify(despues)) return redirect("/admin/ajustes?error=sin-cambios");

  const { error } = await admin.from("category_settings").upsert(
    {
      category: categoria,
      modo,
      porcentaje: despues.porcentaje,
      impuesto_tipo: impuestoTipo,
      impuesto_pct: despues.impuesto_pct,
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    },
    { onConflict: "category" }
  );
  if (error) return redirect("/admin/ajustes?error=guardar");
  await admin.from("category_settings_log").insert({
    category: categoria,
    antes,
    despues,
    motivo,
    changed_by: adminUser.id,
  });
  revalidatePath("/admin/ajustes");
  redirect("/admin/ajustes?ok=1");
}

// Pide a un profesional anterior que acepte las condiciones de su categoría. Hasta
// que las acepte, sigue con las suyas de siempre. Hazlo solo tras avisarle con 15 días.
export async function pedirAceptacion(formData: FormData) {
  await requireAdmin();
  const providerId = String(formData.get("provider_id") ?? "");
  if (!UUID.test(providerId)) return;
  await createAdminClient().from("providers").update({ pending_new_conditions: true }).eq("user_id", providerId);
  revalidatePath("/admin/ajustes");
  redirect("/admin/ajustes?ok=1");
}
