// Textos de las elecciones del cliente al comprar (fase 48). Redacción del asesor.
export const TEXTO_INICIO_CONTENIDO =
  "Consiento expresamente que comience el suministro del contenido digital antes de finalizar el plazo de catorce días y reconozco que, una vez iniciado el suministro, pierdo mi derecho de desistimiento respecto de ese contenido.";
export const TEXTO_INICIO_SERVICIO =
  "Solicito expresamente que el servicio comience antes de finalizar el plazo de catorce días. Reconozco que perderé mi derecho de desistimiento cuando se haya ejecutado íntegramente y que, si desisto antes, podrá corresponder el pago proporcional legalmente procedente de lo efectivamente prestado.";

export type ConsentCompra = {
  termsVersion: string;
  termsAt: string;
  inicio: boolean;
  tipo: "contenido" | "servicio";
  zona: "ue" | "fuera" | null;
};

export function consentDesdeMeta(meta: Record<string, string | undefined> | null | undefined): ConsentCompra | null {
  if (!meta?.terms_v) return null;
  return {
    termsVersion: meta.terms_v,
    termsAt: meta.terms_at || new Date().toISOString(),
    inicio: meta.inicio === "1",
    tipo: meta.inicio_tipo === "contenido" ? "contenido" : "servicio",
    zona: meta.zona === "fuera" ? "fuera" : meta.zona === "ue" ? "ue" : null,
  };
}
