import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Usar este cliente en Server Components, Server Actions y Route Handlers.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Se puede ignorar: ocurre al llamarse desde un Server
            // Component durante el renderizado. El middleware ya
            // mantiene la sesión actualizada en cada petición.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Igual que arriba.
          }
        },
      },
    }
  );
}