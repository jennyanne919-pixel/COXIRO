import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// GET /api/stripe/dashboard
// Lleva al vendedor a SU panel de Stripe (Express Dashboard) con un
// enlace de acceso de un solo uso, sin tener que iniciar sesión de nuevo.
// Si todavía no tiene cuenta de Stripe, o no terminó el alta (Stripe no
// permite crear el enlace en ese caso), lo manda al alta de Stripe
// Connect para que la termine.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  if (!provider?.stripe_account_id) {
    return NextResponse.redirect(`${origin}/api/stripe/connect`);
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(
      provider.stripe_account_id
    );
    return NextResponse.redirect(loginLink.url);
  } catch (err: any) {
    console.error(
      "[stripe/dashboard] No se pudo crear el enlace de acceso:",
      err?.message
    );
    return NextResponse.redirect(`${origin}/api/stripe/connect`);
  }
}
