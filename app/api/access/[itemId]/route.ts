import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/access/[itemId]
// El cliente nunca ve la URL real (Hotmart, Drive, Zoom...) -- solo
// un enlace a Coxiro. Aquí comprobamos que de verdad pagó por el
// servicio al que pertenece este contenido, y solo entonces
// redirigimos a la URL real. Esto permite además revocar accesos
// en el futuro (ej. un reembolso) sin tocar nada más.
export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const admin = createAdminClient();

  const { data: item } = await admin
    .from("content_items")
    .select("service_id, file_url")
    .eq("id", params.itemId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });
  }

  const { data: access } = await admin
    .from("content_access")
    .select("id")
    .eq("client_id", user.id)
    .eq("service_id", item.service_id)
    .maybeSingle();

  if (!access) {
    return NextResponse.json(
      { error: "No tienes acceso a este contenido" },
      { status: 403 }
    );
  }

  return NextResponse.redirect(item.file_url);
}
