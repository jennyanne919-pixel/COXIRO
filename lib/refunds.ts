import { createAdminClient } from "@/lib/supabase/admin";

// Efectos en nuestra base de datos cuando una venta se reembolsa del todo:
// la venta queda marcada y el acceso al contenido de ESA compra se corta.
// Es idempotente (se puede llamar dos veces sin problema), porque la llama
// tanto la acción del administrador como el aviso de Stripe.
export async function aplicarReembolsoEnBD(transactionId: string) {
  const supabase = createAdminClient();

  await supabase
    .from("transactions")
    .update({ status: "refunded" })
    .eq("id", transactionId)
    .eq("status", "paid");

  await supabase
    .from("content_access")
    .update({ expires_at: new Date().toISOString() })
    .eq("transaction_id", transactionId)
    .is("expires_at", null);
}
