import { createAdminClient } from "@/lib/supabase/admin";

export const CATEGORIAS = [
  "Comisiones Stripe",
  "Hosting y software",
  "Cuota de autónomos (Seguridad Social)",
  "Asesoría y gestoría",
  "Publicidad y marketing",
  "Equipos y material",
  "Formación",
  "Impuestos y tasas",
  "Otros",
] as const;

export const CATEGORIA_STRIPE = "Comisiones Stripe";

// Estimación de la comisión de Stripe por cobro con tarjeta europea
// estándar: 1,5 % + 0,25 €. Tarjetas no europeas cuestan más.
export const STRIPE_PORCENTAJE = 0.015;
export const STRIPE_FIJO = 0.25;

export type Factura = {
  id: string;
  transaction_id: string | null;
  type: "client_invoice" | "provider_settlement" | string;
  invoice_number: string;
  fecha: string; // YYYY-MM-DD en hora de Madrid
  tax_base: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  recipient_name: string | null;
  issuer_name: string | null;
};

export type Gasto = {
  id: string;
  fecha: string;
  concepto: string;
  proveedor: string | null;
  categoria: string;
  base: number;
  cuota: number;
  total: number;
  deducible: boolean;
  notas: string | null;
};

export type Cobro = { id: string; fecha: string; amount_total: number };

export type DatosAnio = {
  anio: number;
  facturas: Factura[];
  gastos: Gasto[];
  cobros: Cobro[];
};

export const fechaMadrid = (iso: string) =>
  new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

export function hoyMadrid() {
  return fechaMadrid(new Date().toISOString());
}

// Trimestre 0 = año completo; 1 a 4 = trimestres naturales.
export function enTrimestre(fecha: string, anio: number, t: number) {
  if (!fecha.startsWith(String(anio))) return false;
  if (t === 0) return true;
  const mes = Number(fecha.slice(5, 7));
  return Math.ceil(mes / 3) === t;
}

export function etiquetaPeriodo(anio: number, t: number) {
  return t === 0 ? `Año ${anio}` : `${t}.º trimestre de ${anio}`;
}

export function leerPeriodo(sp: { a?: string; t?: string }) {
  const hoy = hoyMadrid();
  const anioHoy = Number(hoy.slice(0, 4));
  const tHoy = Math.ceil(Number(hoy.slice(5, 7)) / 3);
  const a = Number(sp.a);
  const t = Number(sp.t);
  const anio = Number.isInteger(a) && a >= 2025 && a <= anioHoy + 1 ? a : anioHoy;
  const trimestre = Number.isInteger(t) && t >= 0 && t <= 4 ? t : sp.a ? 0 : tHoy;
  return { anio, trimestre };
}

export async function cargarAnio(anio: number): Promise<DatosAnio> {
  const admin = createAdminClient();
  const desde = `${anio - 1}-12-30`;
  const hasta = `${anio + 1}-01-02`;

  const [{ data: inv }, { data: gas }, { data: tx }] = await Promise.all([
    admin
      .from("invoices")
      .select(
        "id, transaction_id, type, invoice_number, issued_at, tax_base, tax_rate, tax_amount, total, recipient_name, issuer_name"
      )
      .in("type", ["client_invoice", "provider_settlement"])
      .gte("issued_at", desde)
      .lte("issued_at", hasta)
      .order("issued_at", { ascending: true }),
    admin
      .from("expenses")
      .select("id, fecha, concepto, proveedor, categoria, base, cuota, total, deducible, notas")
      .gte("fecha", `${anio}-01-01`)
      .lte("fecha", `${anio}-12-31`)
      .order("fecha", { ascending: true }),
    admin
      .from("transactions")
      .select("id, amount_total, created_at")
      .eq("status", "paid")
      .gte("created_at", desde)
      .lte("created_at", hasta),
  ]);

  const facturas: Factura[] = (inv ?? [])
    .map((i: any) => ({
      id: i.id,
      transaction_id: i.transaction_id,
      type: i.type,
      invoice_number: i.invoice_number,
      fecha: fechaMadrid(i.issued_at),
      tax_base: Number(i.tax_base),
      tax_rate: Number(i.tax_rate),
      tax_amount: Number(i.tax_amount),
      total: Number(i.total),
      recipient_name: i.recipient_name,
      issuer_name: i.issuer_name,
    }))
    .filter((f) => f.fecha.startsWith(String(anio)));

  const gastos: Gasto[] = (gas ?? []).map((g: any) => ({
    ...g,
    base: Number(g.base),
    cuota: Number(g.cuota),
    total: Number(g.total),
  }));

  const cobros: Cobro[] = (tx ?? [])
    .map((t: any) => ({
      id: t.id,
      fecha: fechaMadrid(t.created_at),
      amount_total: Number(t.amount_total),
    }))
    .filter((c) => c.fecha.startsWith(String(anio)));

  return { anio, facturas, gastos, cobros };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export type Resumen = {
  nVentas: number;
  cobrado: number; // total pagado por los clientes (con impuesto)
  ventasBase: number; // base facturada a clientes
  impuestoRepercutido: number; // IPSI incluido en esas facturas
  compras: number; // liquidaciones a profesionales
  margen: number; // ventas - compras
  gastos: number; // gastos deducibles registrados
  stripeEstimado: number; // comisión estimada de Stripe
  stripeIncluido: boolean; // true si se resta la estimación (no hay gastos Stripe)
  beneficio: number;
};

export function resumir(d: DatosAnio, t: number): Resumen {
  const fs = d.facturas.filter((f) => enTrimestre(f.fecha, d.anio, t));
  const cli = fs.filter((f) => f.type === "client_invoice");
  const prov = fs.filter((f) => f.type === "provider_settlement");
  const gs = d.gastos.filter((g) => enTrimestre(g.fecha, d.anio, t));
  const cs = d.cobros.filter((c) => enTrimestre(c.fecha, d.anio, t));

  const ventasBase = cli.reduce((s, f) => s + f.tax_base, 0);
  const impuestoRepercutido = cli.reduce((s, f) => s + f.tax_amount, 0);
  const cobrado = cli.reduce((s, f) => s + f.total, 0);
  const compras = prov.reduce((s, f) => s + f.tax_base, 0);
  const margen = ventasBase - compras;
  const gastos = gs.filter((g) => g.deducible).reduce((s, g) => s + g.total, 0);
  const hayStripe = gs.some((g) => g.categoria === CATEGORIA_STRIPE);
  const stripeEstimado = cs.reduce(
    (s, c) => s + c.amount_total * STRIPE_PORCENTAJE + STRIPE_FIJO,
    0
  );
  const stripeIncluido = !hayStripe && cs.length > 0;
  const beneficio = margen - gastos - (stripeIncluido ? stripeEstimado : 0);

  return {
    nVentas: cli.length,
    cobrado: r2(cobrado),
    ventasBase: r2(ventasBase),
    impuestoRepercutido: r2(impuestoRepercutido),
    compras: r2(compras),
    margen: r2(margen),
    gastos: r2(gastos),
    stripeEstimado: r2(stripeEstimado),
    stripeIncluido,
    beneficio: r2(beneficio),
  };
}
