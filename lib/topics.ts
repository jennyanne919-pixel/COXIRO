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

export const SERVICE_TYPES = [
  { value: "consult", label: "Consulta / Mentoría" },
  { value: "course", label: "Curso" },
  { value: "content", label: "Contenido" },
  { value: "membership", label: "Membresía / Suscripción" },
  { value: "custom", label: "Servicios IA" },
] as const;