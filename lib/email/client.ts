import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = "Coxiro <no-reply@coxiro.com>";

// Punto único de envío -- todas las funciones de email pasan por
// aquí, así el registro en email_logs queda garantizado siempre,
// sin tener que acordarse de hacerlo en cada función suelta.
export async function sendEmail(params: {
  to: string;
  subject: string;
  react: React.ReactElement;
  emailType: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const admin = createAdminClient();

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      react: params.react,
      attachments: params.attachments,
    });

    if (error) {
      console.error(`[email:${params.emailType}] Error de Resend:`, error);
      await admin.from("email_logs").insert({
        to_email: params.to,
        email_type: params.emailType,
        status: "error",
        error_message: error.message,
      });
      return { success: false, error };
    }

    await admin.from("email_logs").insert({
      to_email: params.to,
      email_type: params.emailType,
      resend_id: data?.id,
      status: "sent",
    });

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error(`[email:${params.emailType}] Error inesperado:`, err);
    await admin.from("email_logs").insert({
      to_email: params.to,
      email_type: params.emailType,
      status: "error",
      error_message: err?.message ?? "Error desconocido",
    });
    return { success: false, error: err };
  }
}
