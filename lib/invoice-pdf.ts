import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export async function generateInvoicePdf(
  invoice: {
    invoice_number: string;
    type: string;
    issuer_name: string | null;
    issuer_tax_id: string | null;
    recipient_name: string | null;
    recipient_tax_id: string | null;
    issued_at: string;
    concept: string | null;
    tax_base: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    hash: string | null;
  },
  verifyUrl: string
): Promise<Buffer> {
  const qrPng = await QRCode.toBuffer(verifyUrl, { margin: 1, width: 200 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const qrImage = await pdfDoc.embedPng(qrPng);

  const ink = rgb(0.086, 0.094, 0.114); // #16181D
  const stone = rgb(0.541, 0.541, 0.51); // #8A8A82

  let y = 780;

  const title = invoice.type === "client_invoice" ? "FACTURA" : "AUTOFACTURA";
  page.drawText(title, { x: 50, y, size: 20, font: fontBold, color: ink });
  page.drawText(invoice.invoice_number, { x: 50, y: y - 22, size: 11, font, color: stone });

  y -= 60;
  page.drawText("Emisor", { x: 50, y, size: 9, font: fontBold, color: stone });
  page.drawText(invoice.issuer_name ?? "-", { x: 50, y: y - 14, size: 11, font, color: ink });
  page.drawText(`NIF: ${invoice.issuer_tax_id ?? "-"}`, { x: 50, y: y - 28, size: 10, font, color: stone });

  page.drawText("Destinatario", { x: 320, y, size: 9, font: fontBold, color: stone });
  page.drawText(invoice.recipient_name ?? "-", { x: 320, y: y - 14, size: 11, font, color: ink });
  page.drawText(`NIF: ${invoice.recipient_tax_id ?? "No facilitado"}`, {
    x: 320,
    y: y - 28,
    size: 10,
    font,
    color: stone,
  });

  y -= 70;
  page.drawText(
    `Fecha: ${new Date(invoice.issued_at).toLocaleDateString("es-ES")}`,
    { x: 50, y, size: 10, font, color: stone }
  );

  y -= 40;
  page.drawText("Concepto", { x: 50, y, size: 9, font: fontBold, color: stone });
  page.drawText(invoice.concept ?? "-", { x: 50, y: y - 16, size: 11, font, color: ink });

  y -= 60;
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: stone });

  y -= 24;
  const row = (label: string, value: string, bold = false) => {
    page.drawText(label, { x: 350, y, size: 10, font, color: stone });
    page.drawText(value, {
      x: 545 - (bold ? fontBold : font).widthOfTextAtSize(value, bold ? 12 : 10),
      y,
      size: bold ? 12 : 10,
      font: bold ? fontBold : font,
      color: ink,
    });
    y -= 18;
  };

  row("Base imponible", `${Number(invoice.tax_base).toFixed(2)} €`);
  row(`IVA (${invoice.tax_rate}%)`, `${Number(invoice.tax_amount).toFixed(2)} €`);
  row("TOTAL", `${Number(invoice.total).toFixed(2)} €`, true);

  page.drawImage(qrImage, { x: 50, y: 60, width: 80, height: 80 });
  page.drawText("Verificación (VeriFactu)", { x: 140, y: 128, size: 9, font: fontBold, color: stone });
  page.drawText(`Huella: ${invoice.hash?.slice(0, 32)}...`, {
    x: 140,
    y: 112,
    size: 8,
    font,
    color: stone,
  });
  page.drawText(verifyUrl, { x: 140, y: 98, size: 8, font, color: stone });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
