import { sendEmail } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import CreatePasswordEmail from "@/components/emails/CreatePasswordEmail";
import PurchaseConfirmationEmail from "@/components/emails/PurchaseConfirmationEmail";
import ProviderSaleEmail from "@/components/emails/ProviderSaleEmail";
import InternalSaleEmail from "@/components/emails/InternalSaleEmail";
import InternalRegistrationEmail from "@/components/emails/InternalRegistrationEmail";

const EMAIL_INTERNO_COXIRO = "coxiro.info@gmail.com";

export async function sendWelcomeEmail(params: {
  to: string;
  nombre: string;
  esProveedor: boolean;
}) {
  return sendEmail({
    to: params.to,
    subject: "Bienvenido a Coxiro",
    react: WelcomeEmail({ nombre: params.nombre, esProveedor: params.esProveedor }),
    emailType: "welcome",
  });
}

// Genera el enlace de "crear contraseña" con la API de administración
// de Supabase (más seguro y controlado que dejar que Supabase envíe
// su propio email por defecto) y lo manda con nuestra plantilla.
export async function sendCreatePasswordEmail(params: {
  to: string;
  nombre: string;
}) {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: params.to,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/actualizar-contrasena`,
    },
  });

  if (error || !data) {
    console.error("Error generando el enlace de crear contraseña:", error);
    return { success: false, error };
  }

  return sendEmail({
    to: params.to,
    subject: "Hemos creado tu cuenta en Coxiro",
    react: CreatePasswordEmail({
      nombre: params.nombre,
      enlace: data.properties.action_link,
    }),
    emailType: "create_password",
  });
}

export async function sendPurchaseConfirmation(params: {
  to: string;
  nombreCliente: string;
  servicio: string;
  proveedor: string;
  importe: string;
  invoiceUrl: string;
  invoicePdf?: Buffer;
  invoiceNumber?: string;
}) {
  return sendEmail({
    to: params.to,
    subject: "Tu pago se ha completado — Coxiro",
    react: PurchaseConfirmationEmail(params),
    emailType: "purchase_confirmation",
    attachments: params.invoicePdf
      ? [{ filename: `${params.invoiceNumber ?? "factura"}.pdf`, content: params.invoicePdf }]
      : undefined,
  });
}

export async function sendProviderSale(params: {
  to: string;
  nombreProveedor: string;
  cliente: string;
  servicio: string;
  importeTotal: string;
  neto: string;
  invoicePdf?: Buffer;
  invoiceNumber?: string;
}) {
  return sendEmail({
    to: params.to,
    subject: "Tienes una venta nueva — Coxiro",
    react: ProviderSaleEmail(params),
    emailType: "provider_sale",
    attachments: params.invoicePdf
      ? [{ filename: `${params.invoiceNumber ?? "autofactura"}.pdf`, content: params.invoicePdf }]
      : undefined,
  });
}

export async function sendInternalSale(params: {
  cliente: string;
  clienteEmail: string;
  proveedor: string;
  servicio: string;
  importe: string;
  stripePaymentIntentId: string;
}) {
  return sendEmail({
    to: EMAIL_INTERNO_COXIRO,
    subject: `Nueva venta: ${params.importe} — ${params.servicio}`,
    react: InternalSaleEmail({
      ...params,
      fecha: new Date().toLocaleString("es-ES"),
    }),
    emailType: "internal_sale",
  });
}

export async function sendInternalRegistration(params: {
  nombre: string;
  email: string;
  rol: "provider" | "client";
}) {
  return sendEmail({
    to: EMAIL_INTERNO_COXIRO,
    subject: `Nuevo registro: ${params.rol === "provider" ? "profesional" : "cliente"} — ${params.nombre}`,
    react: InternalRegistrationEmail({
      nombre: params.nombre,
      email: params.email,
      rol: params.rol === "provider" ? "Profesional" : "Cliente",
      fecha: new Date().toLocaleString("es-ES"),
    }),
    emailType: "internal_registration",
  });
}
