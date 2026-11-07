import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));
    }

    console.log("[connect] Usuario:", user.id, user.email);
    console.log(
      "[connect] STRIPE_SECRET_KEY longitud:",
      process.env.STRIPE_SECRET_KEY?.length,
      "| empieza por:",
      process.env.STRIPE_SECRET_KEY?.slice(0, 12)
    );

    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("stripe_account_id, legal_type, legal_name, tax_id")
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

    if (!accountId) {
      console.log("[connect] No hay cuenta guardada, creando una nueva...");

      const capabilities = {
        card_payments: { requested: true },
        transfers: { requested: true },
      };

      // Primero se intenta crear la cuenta con los datos que el profesional
      // dio al registrarse (tipo de negocio, razón social, CIF). Si Stripe
      // rechaza alguno, se crea igualmente sin rellenar nada: el profesional
      // los introduce en el formulario de Stripe y el alta no se bloquea.
      let account;
      try {
        account = await stripe.accounts.create({
          type: "express",
          country: "ES",
          email: user.email,
          business_type: provider?.legal_type === "sociedad" ? "company" : "individual",
          ...(provider?.legal_type === "sociedad" && provider.legal_name
            ? { company: { name: provider.legal_name } }
            : {}),
          capabilities,
        });
      } catch (prefillError: any) {
        console.error(
          "[connect] Stripe rechazó los datos precargados, se reintenta sin ellos:",
          prefillError?.message
        );
        account = await stripe.accounts.create({
          type: "express",
          email: user.email,
          capabilities,
        });
      }

      accountId = account.id;
      console.log("[connect] Cuenta nueva creada:", accountId);

      // Cliente admin: stripe_account_id es un campo protegido que un
      // usuario no puede escribir por sí mismo (ver supabase/security-hardening-1.sql).
      const { error: updateError } = await createAdminClient()
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

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/connect`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?stripe=connected`,
      type: "account_onboarding",
    });

    console.log("[connect] Enlace de onboarding generado con exito");
    return NextResponse.redirect(accountLink.url);
  } catch (err: any) {
    console.error("[connect] ERROR GENERAL:", err?.message, err?.type, err?.code);
    return NextResponse.json(
      {
        error: "Error conectando con Stripe",
        detail: err?.message ?? "desconocido",
        type: err?.type,
      },
      { status: 500 }
    );
  }
}
