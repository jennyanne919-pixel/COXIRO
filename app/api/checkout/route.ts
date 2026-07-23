import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

// GET /api/checkout?service=<id>
// Se llama desde el botón "Pagar y contratar" de la página pública
// del servicio. Crea una sesión de Stripe Checkout: el cliente paga
// el precio completo, Stripe retiene la comisión de Coxiro y
// transfiere el resto directamente a la cuenta del proveedor.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const serviceId = searchParams.get("service");

  if (!serviceId) {
    return NextResponse.json({ error: "Falta el servicio" }, { status: 400 });
  }

  // Cliente normal: solo para identificar quién ha iniciado sesión
  // (esto sí respeta RLS, es la identidad del comprador).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión, mandamos a login y de vuelta aquí tras entrar.
  if (!user) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("next", `/api/checkout?service=${serviceId}`);
    return NextResponse.redirect(loginUrl);
  }

  // Cliente admin: para leer el stripe_account_id y la comisión del
  // proveedor -- RLS bloquearía esto porque el comprador no es el
  // dueño de esa fila. Es seguro aquí porque nunca se envía al
  // navegador, solo se usa para construir la sesión de Stripe.
  const admin = createAdminClient();

  const { data: service } = await admin
    .from("services")
    .select(
      `
      id,
      title,
      price,
      currency,
      provider_id,
      providers ( stripe_account_id, commission_rate, kyc_status )
    `
    )
    .eq("id", serviceId)
    .single();

  const provider = service?.providers as any;

  if (!service || !provider?.stripe_account_id || provider.kyc_status !== "verified") {
    return NextResponse.json(
      { error: "Este servicio no está disponible para cobro todavía" },
      { status: 400 }
    );
  }

  const amountCents = Math.round(Number(service.price) * 100);
  const feeCents = Math.round(
    (amountCents * Number(provider.commission_rate)) / 100
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: service.currency?.toLowerCase() ?? "eur",
          product_data: { name: service.title },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: feeCents,
      transfer_data: { destination: provider.stripe_account_id },
    },
    metadata: {
      service_id: service.id,
      client_id: user.id,
      provider_id: service.provider_id,
      platform_fee: (feeCents / 100).toFixed(2),
    },
    success_url: `${origin}/servicio/${service.id}?paid=1`,
    cancel_url: `${origin}/servicio/${service.id}?cancelled=1`,
  });

  return NextResponse.redirect(session.url!);
}
