import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// GET /api/stripe/connect
// Se llama desde un botón "Conecta tu cuenta de cobro" en el dashboard.
// Crea (si no existe) la cuenta Connect Express del proveedor y
// redirige al flujo de onboarding alojado por Stripe.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  let accountId = provider?.stripe_account_id;

  // Primera vez: crea la cuenta Express en Stripe
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    accountId = account.id;

    await supabase
      .from("providers")
      .update({ stripe_account_id: accountId })
      .eq("user_id", user.id);
  }

  // Genera el enlace de onboarding (caduca en pocos minutos, se
  // regenera cada vez que se llama a este endpoint)
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/connect`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?stripe=connected`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}
