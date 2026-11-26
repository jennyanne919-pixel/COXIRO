import type { Categoria } from "@/lib/categorias";

// Leyendas de la factura al cliente cuando reside fuera de la Unión Europea.
// Textos facilitados por el asesor fiscal.
export const LEYENDA_MENTORIA_FUERA_UE =
  "Operación no sujeta al IPSI, conforme al artículo 9 de la Ordenanza Fiscal del IPSI de Melilla, en relación con el artículo 69.Dos.d) de la Ley 37/1992 del Impuesto sobre el Valor Añadido (servicio de asesoramiento prestado a destinatario particular establecido fuera de la Comunidad).";
export const LEYENDA_FORMACION_FUERA_UE =
  "Operación no sujeta al IPSI, conforme al artículo 9 de la Ordenanza Fiscal del IPSI de Melilla, en relación con los artículos 69.Tres y 70.Uno.4º de la Ley 37/1992 del Impuesto sobre el Valor Añadido (servicio prestado por vía electrónica a consumidor final establecido fuera de la Comunidad).";

// PROVISIONAL: texto para una empresa o profesional establecido fuera de la UE
// (Mentoría). Pendiente de confirmar por el asesor.
export const LEYENDA_MENTORIA_EMPRESA_FUERA_UE =
  "Operación no sujeta al IPSI, conforme al artículo 9 de la Ordenanza Fiscal del IPSI de Melilla, en relación con el artículo 69.Uno.1º de la Ley 37/1992 del Impuesto sobre el Valor Añadido (servicio prestado a empresario o profesional establecido fuera de la Comunidad).";

export function leyendaNoSujeta(categoria: Categoria, comprador: "particular" | "empresa" | null = null): string {
  if (categoria === "mentoria") {
    return comprador === "empresa" ? LEYENDA_MENTORIA_EMPRESA_FUERA_UE : LEYENDA_MENTORIA_FUERA_UE;
  }
  return LEYENDA_FORMACION_FUERA_UE;
}
