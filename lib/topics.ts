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
] as const;

export type Topic = (typeof TOPICS)[number];

// Tipos de servicio (formato de entrega) -- distinto de la temática.
export const SERVICE_TYPES = [
  { value: "course", label: "Curso" },
  { value: "consult", label: "Consulta / Mentoría" },
  { value: "membership", label: "Membresía / Suscripción" },
  { value: "custom", label: "Servicios IA" },
] as const;
