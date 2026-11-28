"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { sendClaimReceived, sendInternalClaim } from "@/lib/email/send";

const limpiar = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

// Formulario de reclamaciones (Términos, cláusula 18.1): genera una referencia,
// envía al cliente un justificante por correo y avisa a Coxiro.
export async function enviarReclamacion(formData: FormData) {
  // Campo trampa para bots: un humano no lo ve ni lo rellena.
  if (limpiar(formData.get("web"), 50)) redirect("/reclamaciones?ok=1&ref=REC-0000");

  const nombre = limpiar(formData.get("nombre"), 120);
  const email = limpiar(formData.get("email"), 200);
  const pedido = limpiar(formData.get("pedido"), 120);
  const asunto = limpiar(formData.get("asunto"), 150);
  const mensaje = limpiar(formData.get("mensaje"), 3000);
  const peticion = limpiar(formData.get("peticion"), 1000);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (nombre.length < 2 || !emailOk || asunto.length < 3 || mensaje.length < 10 || formData.get("acepto") !== "on") {
    redirect("/reclamaciones?error=datos");
  }

  const ahora = new Date();
  const ymd = ahora.toISOString().slice(0, 10).replace(/-/g, "");
  const referencia = `REC-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const fecha = ahora.toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });

  const datos = { referencia, fecha, nombre, email, pedido, asunto, mensaje, peticion };
  const [interno, acuse] = await Promise.allSettled([sendInternalClaim(datos), sendClaimReceived(datos)]);

  // Si el aviso a Coxiro no ha salido, no damos la reclamación por recibida.
  const internoOk = interno.status === "fulfilled" && interno.value?.success;
  if (!internoOk) {
    console.error("[reclamacion] No se pudo avisar a Coxiro:", referencia);
    redirect("/reclamaciones?error=envio");
  }
  const acuseOk = acuse.status === "fulfilled" && acuse.value?.success;
  redirect(`/reclamaciones?ok=1&ref=${referencia}${acuseOk ? "" : "&sinacuse=1"}`);
}
