// Las dos categorías de profesional/servicio de Coxiro (única fuente de verdad
// para los TEXTOS: registro, contrato, catálogo, panel). Los porcentajes que
// aparecen aquí son los pactados; el motor de cálculo del cobro (lib/pricing.ts)
// se adapta en la fase 45. Para cambiar un porcentaje: aquí + nueva versión de
// las condiciones (con 15 días de preaviso).

export type Categoria = "formacion" | "mentoria";

export const CATEGORIAS_VALIDAS: Categoria[] = ["formacion", "mentoria"];

// Orden en que se muestran (registro, catálogo, admin): primero Mentoría y
// consultoría, que es el flujo principal de Coxiro (categoría A: gancho del 6 %).
export const ORDEN_CATEGORIAS: Categoria[] = ["mentoria", "formacion"];

export function esCategoria(v: unknown): v is Categoria {
  return v === "formacion" || v === "mentoria";
}

// Versión de los documentos de condiciones POR CATEGORÍA. Si el texto de una
// categoría cambia, subir esta versión: se pedirá aceptar de nuevo.
export const CONDICIONES_CATEGORIA_VERSION = "2026-11-23";

// Valores por defecto (los vigentes se editan en Admin → Ajustes y viven en la
// tabla category_settings; estos solo se usan si la tabla no se puede leer).
export const COMISION_FORMACION_PCT = 5; // Coxiro retiene el 5 % del precio sin impuestos
export const GANCHO_MENTORIA_PCT = 6; // el profesional recibe el precio sin impuestos + 6 %

export type AjusteCategoria = {
  categoria: Categoria;
  modo: "comision" | "gancho";
  porcentaje: number;
  impuesto_tipo: "IVA" | "IPSI";
  impuesto_pct: number;
};

export type AjustesCategorias = Record<Categoria, AjusteCategoria>;

export const AJUSTES_POR_DEFECTO: AjustesCategorias = {
  mentoria: { categoria: "mentoria", modo: "gancho", porcentaje: GANCHO_MENTORIA_PCT, impuesto_tipo: "IPSI", impuesto_pct: 4 },
  formacion: { categoria: "formacion", modo: "comision", porcentaje: COMISION_FORMACION_PCT, impuesto_tipo: "IVA", impuesto_pct: 21 },
};

const pctTexto = (n: number) => String(n).replace(".", ",");

// Frase económica de cada categoría, con el porcentaje vigente.
export function textoEconomico(a: AjusteCategoria): string {
  return a.modo === "gancho"
    ? `Recibes el precio de tu servicio más un ${pctTexto(a.porcentaje)} % extra.`
    : `Recibes el precio de tu servicio menos un ${pctTexto(a.porcentaje)} % por los servicios de plataforma.`;
}

export const CATEGORIAS: Record<
  Categoria,
  {
    nombre: string;
    corto: string;
    criterio: string;
    ejemplos: string;
    condiciones: string[]; // viñetas fijas (el texto económico lo da textoEconomico)
    declaracion: string; // texto de la casilla de declaración responsable
    documento: string; // nombre del documento en provider_acceptances
  }
> = {
  formacion: {
    nombre: "Formación y cursos",
    corto: "Formación",
    criterio:
      "Tu servicio sigue un temario, un programa o módulos, o consiste en impartir clases o lecciones (grabadas o en directo).",
    ejemplos: "Cursos, formaciones, academias, talleres con programa.",
    condiciones: [
      "Cobras a los 7 días de cada venta.",
      "Sin cuotas de alta ni mensualidad.",
    ],
    declaracion:
      "Declaro que mi servicio es formación o curso (con temario, programa o módulos, o clases) y me comprometo a registrarlo en la categoría correcta.",
    documento: "condiciones_proveedor_formacion",
  },
  mentoria: {
    nombre: "Mentoría, consultoría y desarrollo personal",
    corto: "Mentoría",
    criterio:
      "Tu servicio es mentoría, consultoría o desarrollo personal, individual o en grupo, sin programa ni temario fijo.",
    ejemplos: "Mentorías, asesoramiento, coaching, sesiones de desarrollo personal, grupos de trabajo.",
    condiciones: [
      "Cobras a los 7 días de cada venta.",
      "Sin cuotas de alta ni mensualidad.",
      "Cada servicio se revisa antes de publicarse.",
    ],
    declaracion:
      "Declaro que mi servicio es mentoría, consultoría o desarrollo personal (individual o en grupo), sin temario, programa ni módulos fijos, y que no consiste en impartir clases o formación estructurada. Entiendo que si Coxiro comprueba lo contrario, lo pasará a Formación y cursos.",
    documento: "condiciones_proveedor_mentoria",
  },
};

export const CRITERIO_CLASIFICACION = [
  "El nombre no decide: llamar «mentoría» a algo que tiene temario o módulos no lo convierte en Mentoría.",
  "Si tu servicio mezcla ambas cosas, es Formación y cursos.",
  "Si dudas, elige Formación y cursos. Coxiro puede reclasificar tu servicio.",
];

export const rutaCondicionesCategoria = (c: Categoria) => `/condiciones-economicas-proveedor?categoria=${c}`;
