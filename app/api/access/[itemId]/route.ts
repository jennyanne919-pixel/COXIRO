import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaybackUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

// GET /api/access/[itemId]
// Comprueba que el cliente ha comprado el servicio al que pertenece
// este contenido (o que el contenido es gratuito) antes de dejarle
// ver nada -- nunca se expone la URL real del archivo directamente.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const { data: item } = await admin
    .from("content_items")
    .select("id, service_id, file_url, r2_key, is_free")
    .eq("id", itemId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });
  }

  if (!item.is_free) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: access } = await admin
      .from("content_access")
      .select("id")
      .eq("client_id", user.id)
      .eq("service_id", item.service_id)
      .maybeSingle();

    if (!access) {
      return NextResponse.json({ error: "No tienes acceso a este contenido" }, { status: 403 });
    }
  }

  if (item.r2_key) {
    const url = await getPlaybackUrl(item.r2_key);
    return NextResponse.redirect(url);
  }

  if (item.file_url) {
    return NextResponse.redirect(item.file_url);
  }

  return NextResponse.json({ error: "Este contenido no tiene archivo asociado" }, { status: 404 });
}
