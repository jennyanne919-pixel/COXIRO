import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUploadUrl } from "@/lib/r2";
import { randomBytes } from "crypto";
import { MAX_ARCHIVO_BYTES, fmtBytes, getAlmacenamiento } from "@/lib/storage";

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

  const { serviceId, fileName, contentType, fileSize } = await request.json();

  // Solo formatos de contenido habituales; nada ejecutable ni HTML.
  const TIPOS_PERMITIDOS = [
    "video/mp4", "video/quicktime", "video/webm",
    "audio/mpeg", "audio/mp4", "audio/wav",
    "application/pdf", "application/zip",
    "image/jpeg", "image/png", "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (typeof fileName !== "string" || typeof contentType !== "string" || !TIPOS_PERMITIDOS.includes(contentType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }

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

  // Guardarraíles de coste: tope por archivo y cuota por proveedor. El tamaño
  // lo declara el navegador, así que aquí es un primer filtro; el tamaño real
  // se vuelve a comprobar al guardar el contenido (ver addContentItem).
  const tam = Number(fileSize);
  if (!Number.isFinite(tam) || tam <= 0) {
    return NextResponse.json({ error: "No se pudo leer el tamaño del archivo" }, { status: 400 });
  }
  if (tam > MAX_ARCHIVO_BYTES) {
    return NextResponse.json(
      { error: `El archivo pesa demasiado. El máximo es ${fmtBytes(MAX_ARCHIVO_BYTES)} por archivo.` },
      { status: 413 }
    );
  }
  const { usado, cuota } = await getAlmacenamiento(supabase, user.id);
  if (usado + tam > cuota) {
    return NextResponse.json(
      {
        error: `No queda espacio suficiente: estás usando ${fmtBytes(usado)} de ${fmtBytes(cuota)}. Borra contenido que no uses o escríbenos para ampliar el espacio.`,
      },
      { status: 413 }
    );
  }

  const extension = (fileName.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const key = `${serviceId}/${randomBytes(8).toString("hex")}.${extension}`;

  const uploadUrl = await getUploadUrl(key, contentType, Math.floor(tam));

  return NextResponse.json({ uploadUrl, key });
}
