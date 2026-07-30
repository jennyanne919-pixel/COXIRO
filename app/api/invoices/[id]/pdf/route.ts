import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const admin = createAdminClient();

  const { data: invoice } = await admin
    .from("invoices")
    .select("*, transactions ( client_id, provider_id )")
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  const tx = invoice.transactions as any;

  const autorizado =
    (invoice.type === "client_invoice" && tx?.client_id === user.id) ||
    (invoice.type === "provider_settlement" && tx?.provider_id === user.id);

  if (!autorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const verifyUrl = `${new URL(request.url).origin}/verificar-factura/${invoice.id}`;
  const pdfBuffer = await generateInvoicePdf(invoice, verifyUrl);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
