"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveProgress(
  contentItemId: string,
  positionSeconds: number,
  durationSeconds?: number
) {
  if (!contentItemId || !Number.isFinite(positionSeconds) || positionSeconds < 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("content_progress").upsert(
    {
      client_id: user.id,
      content_item_id: contentItemId,
      position_seconds: Math.round(positionSeconds * 10) / 10,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id,content_item_id" }
  );

  // La duración se guarda una sola vez (la primera que reproduce alguien con
  // acceso al contenido) para poder mostrar el porcentaje visto.
  if (
    durationSeconds &&
    Number.isFinite(durationSeconds) &&
    durationSeconds >= 1 &&
    durationSeconds <= 43200
  ) {
    const admin = createAdminClient();
    const { data: item } = await admin
      .from("content_items")
      .select("duration_seconds, service_id, is_free")
      .eq("id", contentItemId)
      .maybeSingle();
    if (item && item.duration_seconds == null) {
      let permitido = !!item.is_free;
      if (!permitido) {
        const { data: acceso } = await admin
          .from("content_access")
          .select("id")
          .eq("client_id", user.id)
          .eq("service_id", item.service_id)
          .limit(1)
          .maybeSingle();
        permitido = !!acceso;
      }
      if (permitido) {
        await admin
          .from("content_items")
          .update({ duration_seconds: Math.round(durationSeconds) })
          .eq("id", contentItemId);
      }
    }
  }
}
