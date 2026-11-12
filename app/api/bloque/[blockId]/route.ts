import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaybackUrl } from "@/lib/r2";
import { tieneAcceso } from "@/lib/content-access";

export const dynamic = "force-dynamic";

// GET /api/bloque/[blockId]  (?descargar=1 para forzar la descarga)
// Entrega el archivo de un bloque de lección SOLO si el usuario ha comprado
// el servicio, la lección es gratuita o es el dueño. Nunca se expone la URL
// real del archivo: se redirige a un enlace firmado que caduca en 1 hora.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const { blockId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: bloque } = await admin
    .from("lesson_blocks")
    .select("r2_key, title, content_items ( service_id, is_free, status, services ( provider_id ) )")
    .eq("id", blockId)
    .maybeSingle();

  const item = (bloque as any)?.content_items;
  if (!bloque || !item || !bloque.r2_key) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const esDueno = !!user && item.services?.provider_id === user.id;

  if (!esDueno) {
    // Los borradores solo los ve el dueño.
    if (item.status !== "published") {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    if (!item.is_free) {
      if (!user) return NextResponse.redirect(new URL("/login", request.url));
      if (!(await tieneAcceso(admin, user.id, item.service_id))) {
        return NextResponse.json({ error: "No tienes acceso a este contenido" }, { status: 403 });
      }
    }
  }

  const descargar = new URL(request.url).searchParams.get("descargar") === "1";
  const extension = bloque.r2_key.split(".").pop() ?? "";
  const nombre = `${bloque.title || "archivo"}`.replace(/\.[^.]+$/, "") + (extension ? `.${extension}` : "");
  const url = await getPlaybackUrl(bloque.r2_key, descargar ? nombre : undefined);
  return NextResponse.redirect(url);
}
