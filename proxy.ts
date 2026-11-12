import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Obligatorio con @supabase/ssr en Next.js App Router: refresca la
// sesión en cada petición para que las cookies no caduquen mientras
// el usuario navega.
//
// Renombrado de "middleware" a "proxy": Next.js 16 dejó de ejecutar
// el archivo middleware.ts (sin dar error, simplemente lo ignora en
// silencio) -- este es su sustituto oficial, con el mismo comportamiento.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Debe cubrir TODAS las páginas con sesión (curso, contenido, servicio…): si no,
  // el token caduca a la hora y el alumno es expulsado aunque siga conectado.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|api/stripe/webhook|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
