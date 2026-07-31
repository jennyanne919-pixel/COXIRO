import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";

// Ruta de confirmación propia -- necesaria porque @supabase/ssr no
// procesa bien la sesión cuando se usa el enlace tal cual lo genera
// generateLink(). Aquí se verifica el token en el servidor (dejando
// las cookies de sesión bien puestas) antes de mandar al usuario a
// la página final.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("El enlace no es válido o ha caducado")}`
  );
}
