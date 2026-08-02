"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveProgress(contentItemId: string, positionSeconds: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("content_progress").upsert(
    {
      client_id: user.id,
      content_item_id: contentItemId,
      position_seconds: positionSeconds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id,content_item_id" }
  );
}
