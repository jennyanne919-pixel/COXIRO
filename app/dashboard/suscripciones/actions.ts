"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { sendSubscriptionCancelled } from "@/lib/email/send";

// El proveedor da de baja una suscripción de uno de SUS clientes. No se
// reembolsa nada (los reembolsos solo los gestiona el administrador): se
// dejan de cobrar las cuotas siguientes y el cliente conserva el acceso
// hasta el final del periodo que ya pagó. Al llegar esa fecha, Stripe avisa
// con "customer.subscription.deleted" y el webhook retira el acceso.
export async function cancelarSuscripcion(formData: FormData) {
  const subscriptionId = String(formData.get("id") ?? "");
  if (!subscriptionId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Solo puede cancelar las suscripciones donde él es el proveedor.
  const admin = createAdminClient();
  const { data: fila } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id, client_id, service_id")
    .eq("stripe_subscription_id", subscriptionId)
    .eq("provider_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!fila) return;

  let fechaFin: Date | null = null;
  try {
    const st = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    fechaFin = new Date(st.current_period_end * 1000);
  } catch (err: any) {
    console.error("[cancelarSuscripcion] Error en Stripe:", err?.message);
    return;
  }

  // Aviso al cliente de que se ha dado de baja (y hasta cuándo conserva el acceso).
  try {
    const [{ data: cliente }, { data: usuario }, { data: servicio }, { data: proveedor }] =
      await Promise.all([
        admin.from("clients").select("billing_name").eq("user_id", fila.client_id).maybeSingle(),
        admin.from("users").select("email").eq("id", fila.client_id).maybeSingle(),
        admin.from("services").select("title").eq("id", fila.service_id).maybeSingle(),
        admin.from("providers").select("business_name").eq("user_id", user.id).maybeSingle(),
      ]);
    if (usuario?.email) {
      await sendSubscriptionCancelled({
        to: usuario.email,
        nombreCliente: cliente?.billing_name ?? "",
        servicio: servicio?.title ?? "tu servicio",
        proveedor: proveedor?.business_name ?? "Tu profesional",
        fechaFin: fechaFin.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });
    }
  } catch (err: any) {
    console.error("[cancelarSuscripcion] Error enviando el aviso:", err?.message);
  }

  revalidatePath("/dashboard/suscripciones");
}
