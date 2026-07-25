import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

// GET /api/checkout?service=<id>
// Ya NO exige sesión iniciada: el cliente paga directamente, Stripe le
// pide su email y los datos de la tarjeta, y la cuenta de Coxiro se
// crea automáticamente después del pago (ver webhook). Si el visitante
// SÍ tiene sesión iniciada, se usa esa cuenta directamente, sin pedirle
// el email de nuevo.
// Fuerza a que esta ruta se ejecute de verdad en cada visita, nunca
// desde una respuesta guardada en caché -- imprescindible, ya que
// cada llamada debe crear una sesión de pago NUEVA en Stripe.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const serviceId = searchParams.get("service");

  if (!serviceId) {
    return NextResponse.json({ error: "Falta el servicio" }, { status: 400 });
  }

  // Cliente normal: solo para saber si YA hay sesión iniciada (caso
  // opcional). Si no la hay, seguimos igualmente, sin bloquear nada.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    // Si ya hay sesión, pre-rellenamos el email para ir más rápido.
    // Si no, Stripe se lo pide él mismo durante el pago.
    customer_email: user?.email,
    billing_address_collection: "auto",
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
      // Si ya había sesión, guardamos directamente su id. Si no,
      // se queda vacío y el webhook resuelve/crea la cuenta por email.
      client_id: user?.id ?? "",
      provider_id: service.provider_id,
      platform_fee: (feeCents / 100).toFixed(2),
    },
    success_url: `${origin}/servicio/${service.id}?paid=1`,
    cancel_url: `${origin}/servicio/${service.id}?cancelled=1`,
  });

  return NextResponse.redirect(session.url!);
}
