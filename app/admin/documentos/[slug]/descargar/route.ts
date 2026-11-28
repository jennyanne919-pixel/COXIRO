import { adminOrNull } from "@/lib/admin/auth";
import { DOCUMENTOS_ASESOR } from "@/lib/legal/documentos-asesor";

// Descarga de un documento del asesor como archivo de Word (.doc).
// Solo administradores; se comprueba aquí porque las rutas no pasan por el layout.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await adminOrNull();
  if (!user) return new Response("No autorizado", { status: 401 });

  const { slug } = await params;
  const doc = DOCUMENTOS_ASESOR.find((d) => d.slug === slug);
  if (!doc) return new Response("No encontrado", { status: 404 });

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${doc.titulo}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #111; }
  h1 { font-size: 18pt; margin: 14pt 0 8pt; }
  h2 { font-size: 13pt; margin: 16pt 0 6pt; }
  p { margin: 6pt 0; }
</style>
</head>
<body>
${doc.html}
</body>
</html>`;

  const nombre = `Coxiro_Documento_${doc.numero}_${doc.slug}.doc`;
  return new Response("﻿" + html, {
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
