import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const COXIRO_TAX_ID = process.env.COXIRO_TAX_ID ?? "PENDIENTE-DE-CONFIGURAR";
export const COXIRO_LEGAL_NAME = process.env.COXIRO_LEGAL_NAME ?? "Coxiro (nombre legal pendiente)";

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
