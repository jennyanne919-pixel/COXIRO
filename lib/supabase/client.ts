import { createBrowserClient } from "@supabase/ssr";

// Usar este cliente dentro de componentes marcados "use client".
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
