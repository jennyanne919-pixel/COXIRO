import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUploadUrl } from "@/lib/r2";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

// POST /api/r2/upload-url
// body: { serviceId, fileName, contentType }
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { serviceId, fileName, contentType } = await request.json();

  // Comprobación explícita: solo el dueño del servicio puede subir
  // contenido a él, aunque RLS ya proteja la tabla en sí.
  const { data: service } = await supabase
    .from("services")
    .select("id, provider_id")
    .eq("id", serviceId)
    .single();

  if (!service || service.provider_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const extension = fileName.split(".").pop();
  const key = `${serviceId}/${randomBytes(8).toString("hex")}.${extension}`;

  const uploadUrl = await getUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
