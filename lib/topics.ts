// Lista única de temáticas -- se usa tanto al publicar un servicio
// como en el filtro del catálogo. Ampliar aquí cuando haga falta,
// se propaga solo a los dos sitios.
export const TOPICS = [
  "Marketing Digital",
  "Emprendimiento",
  "Idiomas",
  "Finanzas e Inversión",
  "Inteligencia Artificial",
  "Desarrollo Personal",
  "Diseño",
  "Tecnología",
  "Ventas",
  "Salud y Bienestar",
  "Cocina y Gastronomía",
  "Legal y Fiscal",
  "Fotografía y Vídeo",
  "Servicios",
  "Otro",
] as const;

export type Topic = (typeof TOPICS)[number];

// Tipos de servicio (formato de entrega) -- distinto de la temática.
export const SERVICE_TYPES = [
  { value: "course", label: "Curso" },
  { value: "consult", label: "Consulta / Mentoría" },
  { value: "membership", label: "Membresía / Suscripción" },
  { value: "custom", label: "Servicios IA" },
  { value: "other", label: "Otros servicios" },
] as const;

// Mentoría, consultoría y desarrollo personal: formatos y materias que no encajan
// (clases, cursos, trabajos a medida). Las membresías de mentoría sí se permiten.
export const TIPOS_MENTORIA: string[] = ["consult", "membership"];
export const TOPICS_NO_MENTORIA: string[] = ["Idiomas", "Cocina y Gastronomía", "Fotografía y Vídeo", "Servicios"];

export function tiposPara(categoria?: string | null) {
  return categoria === "mentoria" ? SERVICE_TYPES.filter((t) => TIPOS_MENTORIA.includes(t.value)) : SERVICE_TYPES;
}
export function topicsPara(categoria?: string | null) {
  return categoria === "mentoria" ? TOPICS.filter((t) => !TOPICS_NO_MENTORIA.includes(t)) : TOPICS;
}
