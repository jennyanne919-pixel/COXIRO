import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AJUSTES_POR_DEFECTO,
  CATEGORIAS,
  esCategoria,
  type AjusteCategoria,
  type AjustesCategorias,
  type Categoria,
} from "@/lib/categorias";
import { IVA_PORCENTAJE } from "@/lib/pricing";

const r4 = (n: number) => Math.round(n * 10000) / 10000;

// Ajustes vigentes de cada categoría (tabla category_settings, editable en Admin).
export async function cargarAjustes(admin: SupabaseClient = createAdminClient()): Promise<AjustesCategorias> {
  const ajustes: AjustesCategorias = { ...AJUSTES_POR_DEFECTO };
  const { data } = await admin
    .from("category_settings")
    .select("category, modo, porcentaje, impuesto_tipo, impuesto_pct");
  for (const r of data ?? []) {
    if (!esCategoria(r.category)) continue;
    ajustes[r.category] = {
      categoria: r.category,
      modo: r.modo === "gancho" ? "gancho" : "comision",
      porcentaje: Number(r.porcentaje),
      impuesto_tipo: r.impuesto_tipo === "IPSI" ? "IPSI" : "IVA",
      impuesto_pct: Number(r.impuesto_pct),
    };
  }
  return ajustes;
}

// Lo que recibe el proveedor, como proporción del precio sin impuestos:
// gancho del 6 % => 1,06; comisión del 5 % => 0,95.
export function proporcionProveedor(a: AjusteCategoria): number {
  return a.modo === "gancho" ? 1 + a.porcentaje / 100 : 1 - a.porcentaje / 100;
}

// Traducción al «comisión» de lib/pricing.ts (donde retiene Coxiro = comisión + 1 %
// del precio sin impuestos): el cliente paga siempre precio sin impuestos × 1,21 y
// el proveedor recibe proporcionProveedor × precio sin impuestos.
//   gancho 6 %  => 14        comisión 5 %  => 25
export function comisionEquivalente(a: AjusteCategoria): number {
  return r4((1 + IVA_PORCENTAJE / 100 - proporcionProveedor(a)) * 100 - 1);
}

export type Regimen = {
  usaCategoria: boolean; // false = condiciones anteriores (profesionales previos a la fase 44)
  categoria: Categoria;
  ajuste: AjusteCategoria;
  comisionLegado: number;
};

// Qué condiciones se aplican HOY a un profesional:
//  - si ya aceptó las condiciones de su categoría, las de su categoría;
//  - si no (profesionales anteriores a la fase 44), las suyas de siempre
//    (providers.commission_rate), hasta que acepte las nuevas.
export async function regimenProveedor(admin: SupabaseClient, providerId: string): Promise<Regimen> {
  const { data: p } = await admin
    .from("providers")
    .select("commission_rate, fiscal_category")
    .eq("user_id", providerId)
    .maybeSingle();
  const comisionLegado = Number(p?.commission_rate ?? 10);
  const categoria: Categoria = esCategoria(p?.fiscal_category) ? p.fiscal_category : "formacion";

  const { data: acept } = await admin
    .from("provider_acceptances")
    .select("id")
    .eq("user_id", providerId)
    .eq("document", CATEGORIAS[categoria].documento)
    .limit(1);

  const ajustes = await cargarAjustes(admin);
  return { usaCategoria: !!acept?.length, categoria, ajuste: ajustes[categoria], comisionLegado };
}

// Comisión (en el formato de lib/pricing.ts) que se aplica HOY a un profesional.
export async function comisionEfectiva(admin: SupabaseClient, providerId: string): Promise<number> {
  const r = await regimenProveedor(admin, providerId);
  return r.usaCategoria ? comisionEquivalente(r.ajuste) : r.comisionLegado;
}
