import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ATENCIÓN: esta clave se salta todas las políticas de RLS.
// Úsala solo en código de servidor que nunca se envía al navegador
// (webhooks, cron jobs) -- nunca en un componente "use client".
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
