"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tieneAcceso } from "@/lib/content-access";
import { redirect } from "next/navigation";

// Marca una lección como completada y pasa a la siguiente (o termina el curso).
export async function completarLeccion(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const siguiente = String(formData.get("next_id") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/curso/${serviceId}`);

  const admin = createAdminClient();
  const { data: item } = await admin
    .from("content_items")
    .select("service_id, is_free, services ( provider_id )")
    .eq("id", itemId)
    .maybeSingle();

  if (item && item.service_id === serviceId) {
    const esDueno = (item.services as any)?.provider_id === user.id;
    const permitido = esDueno || item.is_free || (await tieneAcceso(admin, user.id, serviceId));
    if (permitido) {
      await supabase.from("content_progress").upsert(
        {
          client_id: user.id,
          content_item_id: itemId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "client_id,content_item_id" }
      );
    }
  }

  if (siguiente) redirect(`/curso/${serviceId}?leccion=${siguiente}`);
  redirect(`/curso/${serviceId}?leccion=${itemId}&fin=1`);
}

// Quita la marca de completada.
export async function desmarcarLeccion(formData: FormData) {
  const serviceId = String(formData.get("service_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("content_progress")
    .update({ completed_at: null })
    .eq("client_id", user.id)
    .eq("content_item_id", itemId);
  redirect(`/curso/${serviceId}?leccion=${itemId}`);
}
