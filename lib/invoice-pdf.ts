import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const formatEUR = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Datos fijos de Coxiro mientras no exista NIF/CIF de autónoma dado de alta.
const COXIRO_NAME = "Coxiro";
const COXIRO_ADDRESS = "Grupo Gómez Jordana, Portal 5, 2º D, 52006 Melilla, España";
const COXIRO_TAX_ID_PENDING = "(pendiente de alta como autónoma)";

export async function generateInvoicePdf(
  invoice: {
    invoice_number: string;
    type: string;
    issuer_name: string | null;
    issuer_tax_id: string | null;
    issuer_address?: string | null;
    recipient_name: string | null;
    recipient_tax_id: string | null;
    recipient_address?: string | null;
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
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Wordmark "coxiro" con la tipografía de marca (Space Grotesk). Si el
  // archivo de la fuente no está presente en el proyecto, usamos Helvetica
  // Bold como respaldo para que la generación de PDF nunca falle.
  let wordmarkFont = fontBold;
  try {
    const fontPath = path.join(process.cwd(), "assets/fonts/SpaceGrotesk-VariableFont_wght.ttf");
    const fontBytes = fs.readFileSync(fontPath);
    const embedded = await pdfDoc.embedFont(fontBytes);
    // Fuerza el acceso a las métricas del glifo aquí mismo -- si el archivo
    // de la fuente está corrupto o mal parseado, fontkit lanza el error en
    // este punto (no al leer el archivo), así que lo comprobamos ya para
    // poder caer a Helvetica Bold sin romper el resto del PDF.
    embedded.widthOfTextAtSize("coxiro", 20);
    wordmarkFont = embedded;
  } catch (err) {
    console.error("[invoice-pdf] No se pudo usar Space Grotesk, uso Helvetica Bold:", err);
    // se queda con Helvetica Bold
  }

  const qrImage = await pdfDoc.embedPng(qrPng);

  const ink = rgb(0.086, 0.094, 0.114); // #16181D
  const stone = rgb(0.541, 0.541, 0.51); // #8A8A82
  const boxBg = rgb(0.949, 0.949, 0.945);
  const white = rgb(1, 1, 1);

  const isClientInvoice = invoice.type === "client_invoice";
  const fecha = new Date(invoice.issued_at).toLocaleDateString("es-ES");
  const precioUnico = formatEUR(Number(invoice.total));

  let y = 800;

  // ---- Cabecera ----
  page.drawText("coxiro", { x: 50, y, size: 20, font: wordmarkFont, color: ink });
  const title = isClientInvoice ? "Factura" : "Autofactura";
  const titleWidth = fontBold.widthOfTextAtSize(title, 22);
  page.drawText(title, { x: 545 - titleWidth, y: y + 2, size: 22, font: fontBold, color: ink });

  y -= 40;
  // Caja "Número / Fecha" arriba a la derecha, estilo Paygram
  const boxX = 395;
  const boxW = 150;
  page.drawRectangle({ x: boxX, y: y - 4, width: boxW, height: 42, color: boxBg });
  page.drawText("Número", { x: boxX + 10, y: y + 20, size: 8, font: fontBold, color: stone });
  page.drawText(invoice.invoice_number, { x: boxX + 10, y: y + 8, size: 10, font, color: ink });
  page.drawText("Fecha", { x: boxX + 10, y: y - 2, size: 8, font: fontBold, color: stone });
  page.drawText(fecha, { x: boxX + 10, y: y - 14, size: 10, font, color: ink });

  y -= 70;

  // ---- Emisor / Destinatario ----
  // En la factura al cliente, el emisor es Coxiro. En la autofactura al
  // proveedor, el destinatario es Coxiro (el emisor es el propio proveedor).
  const issuerName = isClientInvoice ? invoice.issuer_name ?? COXIRO_NAME : invoice.issuer_name ?? "-";
  const issuerTaxId = isClientInvoice
    ? invoice.issuer_tax_id ?? COXIRO_TAX_ID_PENDING
    : invoice.issuer_tax_id ?? "-";
  const issuerAddress = isClientInvoice ? invoice.issuer_address ?? COXIRO_ADDRESS : invoice.issuer_address;

  const recipientName = isClientInvoice ? invoice.recipient_name ?? "-" : invoice.recipient_name ?? COXIRO_NAME;
  const recipientTaxId = isClientInvoice
    ? invoice.recipient_tax_id ?? "No facilitado"
    : invoice.recipient_tax_id ?? COXIRO_TAX_ID_PENDING;
  const recipientAddress = isClientInvoice
    ? invoice.recipient_address
    : invoice.recipient_address ?? COXIRO_ADDRESS;

  const emisorLabel = isClientInvoice ? "Documento emitido por:" : "Facturado por:";
  const destLabel = isClientInvoice ? "" : "Facturado a:";

  page.drawText(emisorLabel, { x: 50, y, size: 9, font: fontBold, color: stone });
  page.drawText(issuerName, { x: 50, y: y - 16, size: 11, font: fontBold, color: ink });
  page.drawText(`NIF/CIF: ${issuerTaxId}`, { x: 50, y: y - 30, size: 9, font, color: stone });
  if (issuerAddress) {
    page.drawText(issuerAddress, { x: 50, y: y - 42, size: 9, font, color: stone });
  }

  if (destLabel) {
    page.drawText(destLabel, { x: 320, y, size: 9, font: fontBold, color: stone });
  }
  page.drawText(recipientName, { x: 320, y: y - 16, size: 11, font: fontBold, color: ink });
  page.drawText(`NIF/CIF: ${recipientTaxId}`, {
    x: 320,
    y: y - 30,
    size: 9,
    font,
    color: stone,
  });
  if (recipientAddress) {
    page.drawText(recipientAddress, { x: 320, y: y - 42, size: 9, font, color: stone });
  }

  y -= 90;

  // ---- Tabla de concepto ----
  page.drawRectangle({ x: 50, y: y - 4, width: 495, height: 22, color: ink });
  page.drawText("Concepto", { x: 58, y: y + 2, size: 9, font: fontBold, color: white });
  page.drawText("Cantidad", { x: 360, y: y + 2, size: 9, font: fontBold, color: white });
  page.drawText("Precio", { x: 430, y: y + 2, size: 9, font: fontBold, color: white });
  page.drawText("Total", { x: 500, y: y + 2, size: 9, font: fontBold, color: white });

  y -= 26;
  page.drawText(invoice.concept ?? "-", { x: 58, y, size: 10, font, color: ink });
  page.drawText("1", { x: 368, y, size: 10, font, color: ink });
  page.drawText(`${precioUnico} €`, { x: 430, y, size: 10, font, color: ink });
  page.drawText(`${precioUnico} €`, { x: 495, y, size: 10, font, color: ink });

  y -= 30;
  page.drawLine({ start: { x: 50, y: y + 10 }, end: { x: 545, y: y + 10 }, thickness: 0.5, color: stone });

  // ---- Totales ----
  const totalRow = (label: string, value: string, bold = false) => {
    page.drawText(label, {
      x: 400,
      y,
      size: bold ? 11 : 10,
      font: bold ? fontBold : font,
      color: bold ? ink : stone,
    });
    const valW = (bold ? fontBold : font).widthOfTextAtSize(value, bold ? 12 : 10);
    page.drawText(value, { x: 545 - valW, y, size: bold ? 12 : 10, font: bold ? fontBold : font, color: ink });
    y -= 18;
  };

  if (isClientInvoice) {
    // Sin desglose de IPSI a la vista del cliente -- solo subtotal y total.
    totalRow("Subtotal", `${precioUnico} €`);
    totalRow("Total (EUR)", `${precioUnico} €`, true);
  } else {
    const base = formatEUR(Number(invoice.tax_base));
    const ipsi = formatEUR(Number(invoice.tax_amount));
    totalRow("Sub total", `${base} €`);
    totalRow("Base imponible", `${base} €`);
    totalRow("IVA (0,00 %)", "0,00 €");
    totalRow("Ret. I.R.P.F. (0,00 %)", "0,00 €");
    totalRow(`Ipsi (${Number(invoice.tax_rate).toFixed(2)} %)`, `${ipsi} €`);
    totalRow("TOTAL", `${formatEUR(Number(invoice.total))} €`, true);
  }

  y -= 20;

  // ---- Pie legal ----
  const legalText = isClientInvoice
    ? "Operación exenta de IVA según la Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido."
    : "Operación con inversión del sujeto pasivo conforme al artículo 84.Uno.2º de la Ley 37/1992.";
  page.drawText(legalText, { x: 50, y, size: 8, font, color: stone });

  // ---- Verificación VeriFactu ----
  const yQR = 110;
  page.drawImage(qrImage, { x: 50, y: yQR - 70, width: 70, height: 70 });
  page.drawText("Verificación (VeriFactu)", { x: 132, y: yQR, size: 9, font: fontBold, color: stone });
  page.drawText(`Huella: ${invoice.hash?.slice(0, 32) ?? "-"}...`, {
    x: 132,
    y: yQR - 16,
    size: 8,
    font,
    color: stone,
  });
  page.drawText(verifyUrl, { x: 132, y: yQR - 30, size: 8, font, color: stone });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
