import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

// Genera un enlace temporal (15 min) para que el NAVEGADOR del
// proveedor suba el archivo directamente a R2, sin pasar por
// nuestro servidor -- así evitamos el límite de tamaño de Vercel
// por completo, sea cual sea el peso del vídeo.
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 900 });
}

// Genera un enlace temporal (1 hora) para REPRODUCIR/descargar un
// archivo privado -- solo se genera después de comprobar que el
// cliente tiene acceso comprado a ese contenido.
export async function getPlaybackUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}
