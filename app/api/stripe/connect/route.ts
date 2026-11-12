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
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("stripe_account_id, legal_type, legal_name, tax_id")
      .eq("user_id", user.id)
      .single();

    if (providerError) {
      console.error("[connect] Error leyendo el proveedor:", providerError);
    }

    // Solo los profesionales pueden abrir una cuenta de cobro: así un cliente
    // no puede crear cuentas de Stripe sueltas.
    if (!provider) {
      return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_SITE_URL));
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

      // Clave de idempotencia por usuario: si el profesional pulsa el botón
      // varias veces seguidas (o dos peticiones llegan a la vez), Stripe
      // devuelve la MISMA cuenta en vez de crear una nueva cada vez.
      const claveBase = `coxiro-connect-${user.id}`;

      const crearCuenta = async () => {
        // Primero se intenta con los datos que el profesional dio al
        // registrarse (tipo de negocio, razón social). Si Stripe rechaza
        // alguno, se crea igualmente sin rellenar nada: el profesional los
        // introduce en el formulario de Stripe y el alta no se bloquea.
        try {
          return await stripe.accounts.create(
            {
              type: "express",
              country: "ES",
              email: user.email,
              business_type: provider?.legal_type === "sociedad" ? "company" : "individual",
              ...(provider?.legal_type === "sociedad" && provider.legal_name
                ? { company: { name: provider.legal_name } }
                : {}),
              capabilities,
            },
            { idempotencyKey: `${claveBase}-a` }
          );
        } catch (prefillError: any) {
          if (prefillError?.type === "StripeIdempotencyError") throw prefillError;
          console.error(
            "[connect] Stripe rechazó los datos precargados, se reintenta sin ellos:",
            prefillError?.message
          );
          return await stripe.accounts.create(
            { type: "express", email: user.email, capabilities },
            { idempotencyKey: `${claveBase}-b` }
          );
        }
      };

      let account;
      for (let intento = 0; ; intento++) {
        try {
          account = await crearCuenta();
          break;
        } catch (e: any) {
          // Otra petición del mismo usuario está creando la cuenta ahora
          // mismo: se espera un poco y se reutiliza lo que ella guarde.
          if (e?.type !== "StripeIdempotencyError" || intento >= 3) throw e;
          await new Promise((r) => setTimeout(r, 1500));
          const { data: ya } = await createAdminClient()
            .from("providers")
            .select("stripe_account_id")
            .eq("user_id", user.id)
            .single();
          if (ya?.stripe_account_id) {
            account = { id: ya.stripe_account_id } as { id: string };
            break;
          }
        }
      }

      accountId = account.id;
      console.log("[connect] Cuenta nueva creada:", accountId);

      // Cliente admin: stripe_account_id es un campo protegido que un
      // usuario no puede escribir por sí mismo (ver supabase/security-hardening-1.sql).
      const { error: updateError } = await createAdminClient()
        .from("providers")
        .update({ stripe_account_id: accountId })
        .eq("user_id", user.id)
        .is("stripe_account_id", null);

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
