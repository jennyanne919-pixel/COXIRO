import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Si es la primera vez que entra (no tiene fila en "users"),
      // le damos de alta como cliente por defecto -- quien quiera
      // ser proveedor pasa por el registro normal, ya que ahí se
      // piden datos fiscales imprescindibles (NIF, categoria) que
      // Google no nos da.
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!existingUser) {
        const fullName =
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          data.user.email ??
          "Usuario";

        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          password_hash: "managed_by_supabase_auth",
          role: "client",
          full_name: fullName,
        });

        await supabase.from("clients").insert({
          user_id: data.user.id,
          billing_name: fullName,
          client_type: "particular",
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("No se pudo iniciar sesion con Google")}`
  );
}
