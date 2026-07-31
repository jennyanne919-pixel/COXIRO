import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularGananciasPartner } from "@/lib/referrals";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// GET /api/cron/pay-partners
// Solo Vercel Cron puede llamar a esto de verdad (se verifica el
// secreto compartido) -- ningún proveedor ni partner tiene forma de
// accionarlo por su cuenta. Se programa en vercel.json para el día 1
// de cada mes.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Todos los proveedores que tienen al menos un referido
  const { data: partners } = await admin
    .from("providers")
    .select("user_id, stripe_account_id, kyc_status")
    .in(
      "user_id",
      (
        await admin.from("providers").select("referred_by").not("referred_by", "is", null)
      ).data?.map((r) => r.referred_by) ?? []
    );

  const resultados: any[] = [];

  for (const partner of partners ?? []) {
    if (!partner.stripe_account_id || partner.kyc_status !== "verified") {
      resultados.push({ partner: partner.user_id, skipped: "sin cuenta de cobro verificada" });
      continue;
    }

    const { pendiente } = await calcularGananciasPartner(partner.user_id);

    // No merece la pena una transferencia por debajo de 1€
    if (pendiente < 1) {
      resultados.push({ partner: partner.user_id, skipped: "pendiente inferior a 1€", pendiente });
      continue;
    }

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(pendiente * 100),
        currency: "eur",
        destination: partner.stripe_account_id,
      });

      await admin.from("referral_payouts").insert({
        partner_id: partner.user_id,
        amount: pendiente,
        stripe_transfer_id: transfer.id,
      });

      resultados.push({ partner: partner.user_id, pagado: pendiente, transfer_id: transfer.id });
    } catch (err: any) {
      console.error("Error pagando a partner", partner.user_id, err.message);
      resultados.push({ partner: partner.user_id, error: err.message });
    }
  }

  return NextResponse.json({ ejecutado: new Date().toISOString(), resultados });
}
