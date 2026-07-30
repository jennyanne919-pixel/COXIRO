import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// GET /api/stripe/connect
// Se llama desde un botón "Conecta tu cuenta de cobro" en el dashboard.
// Crea (si no existe) la cuenta Connect Express del proveedor y
// redirige al flujo de onboarding alojado por Stripe.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));
  }

  console.log("[connect] Usuario:", user.id, user.email);
  console.log(
    "[connect] STRIPE_SECRET_KEY empieza por:",
    process.env.STRIPE_SECRET_KEY?.slice(0, 12)
  );

  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  if (providerError) {
    console.error("[connect] Error leyendo el proveedor:", providerError);
  }

  console.log(
    "[connect] stripe_account_id leido de Supabase:",
    provider?.stripe_account_id ?? "(vacio)"
  );

  let accountId = provider?.stripe_account_id;

  // Primera vez: crea la cuenta Express en Stripe
  if (!accountId) {
    console.log("[connect] No hay cuenta guardada, creando una nueva...");

    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    accountId = account.id;
    console.log("[connect] Cuenta nueva creada:", accountId);

    const { error: updateError } = await supabase
      .from("providers")
      .update({ stripe_account_id: accountId })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[connect] Error guardando el stripe_account_id:", updateError);
    } else {
      console.log("[connect] stripe_account_id guardado correctamente en Supabase");
    }
  } else {
    console.log("[connect] Reutilizando cuenta ya guardada:", accountId);
  }

  // Genera el enlace de onboarding (caduca en pocos minutos, se
  // regenera cada vez que se llama a este endpoint)
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/connect`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?stripe=connected`,
      type: "account_onboarding",
    });

    console.log("[connect] Enlace de onboarding generado con exito");
    return NextResponse.redirect(accountLink.url);
  } catch (err: any) {
    console.error("[connect] ERROR creando el account link para", accountId, ":", err?.message);
    return NextResponse.json(
      { error: "Error conectando con Stripe", detail: err?.message, accountId },
      { status: 500 }
    );
  }
}