import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaybackUrl } from "@/lib/r2";
import { tieneAcceso } from "@/lib/content-access";

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
    .select("id, service_id, file_url, r2_key, is_free, status, services ( provider_id )")
    .eq("id", itemId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });
  }

  // El propio profesional puede ver su contenido para comprobarlo.
  const esDueno = !!user && (item.services as any)?.provider_id === user.id;

  // Los borradores solo los ve el dueño.
  if (!esDueno && item.status !== "published") {
    return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });
  }

  if (!item.is_free && !esDueno) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const access = await tieneAcceso(admin, user.id, item.service_id);

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
