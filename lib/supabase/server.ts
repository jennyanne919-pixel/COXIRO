import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Usar este cliente en Server Components, Server Actions y Route Handlers.
// A partir de Next.js 15, cookies() es asíncrono -- por eso esta
// función también lo es ahora, y hay que hacerle "await" en cada sitio
// donde se llama.
export async function createClient() {
  const cookieStore = await cookies();

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
            // Se puede ignorar con seguridad: esto ocurre cuando se llama
            // desde un Server Component durante el renderizado, donde
            // Next.js no permite escribir cookies. El middleware ya se
            // encarga de mantener la sesión actualizada en cada petición.
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
