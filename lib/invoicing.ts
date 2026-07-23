import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Datos fiscales de la propia Coxiro (emisor en las facturas al
// cliente, y quien liquida la comisión al proveedor). Rellenar con
// los datos reales antes de facturar con clientes de verdad.
export const COXIRO_TAX_ID = process.env.COXIRO_TAX_ID ?? "PENDIENTE-DE-CONFIGURAR";
export const COXIRO_LEGAL_NAME = process.env.COXIRO_LEGAL_NAME ?? "Coxiro (nombre legal pendiente)";

/**
 * Obtiene el siguiente número correlativo para una serie de
 * facturación ("CLI" o "PROV"), sin huecos ni repeticiones.
 * Usa el cliente admin porque esta tabla está bloqueada por RLS
 * para cualquier otro uso.
 */
export async function getNextInvoiceNumber(series: "CLI" | "PROV") {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("increment_invoice_counter", {
    p_series: series,
  });

  if (error || data == null) {
    throw new Error(
      `No se pudo generar el número de factura de la serie ${series}: ${error?.message}`
    );
  }

  const seq = data as number;
  return `${series}-${String(seq).padStart(6, "0")}`;
}

/**
 * Calcula el hash encadenado de una factura: incluye el hash de la
 * factura anterior de la misma serie, de forma que cualquier
 * alteración posterior de una factura antigua rompería la cadena
 * completa -- es el mecanismo central que exige VeriFactu.
 */
export function computeInvoiceHash(params: {
  invoiceNumber: string;
  issuedAt: string;
  issuerTaxId: string;
  recipientTaxId: string;
  total: number;
  previousHash: string | null;
}) {
  const canonical = [
    params.invoiceNumber,
    params.issuedAt,
    params.issuerTaxId,
    params.recipientTaxId,
    params.total.toFixed(2),
    params.previousHash ?? "GENESIS",
  ].join("|");

  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Devuelve el hash de la última factura emitida en una serie, para
 * poder encadenar la siguiente. Null si es la primera de la serie.
 */
export async function getLastHash(series: "CLI" | "PROV") {
  const admin = createAdminClient();

  const { data } = await admin
    .from("invoices")
    .select("hash")
    .like("invoice_number", `${series}-%`)
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.hash ?? null;
}
