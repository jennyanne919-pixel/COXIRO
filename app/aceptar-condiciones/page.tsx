import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { tieneAceptacionVigente } from "@/lib/acceptances";
import { CONDICIONES_RUTA, CONDICIONES_VERSION } from "@/lib/condiciones";
import { aceptarCondiciones } from "./actions";

export const metadata: Metadata = {
  title: "Condiciones del proveedor — Coxiro",
  robots: { index: false, follow: false },
};

export default async function AceptarCondicionesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "provider") redirect("/dashboard");
  if (await tieneAceptacionVigente(supabase, user.id)) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-cx-hielo flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-cx-borde p-8">
        <Logo variant="light" />
        <h1 className="font-display text-2xl font-semibold mt-6 mb-2">Condiciones del proveedor</h1>
        <p className="text-sm text-cx-texto-2 mb-4">
          Hemos actualizado las condiciones económicas y de facturación que se aplican a tus ventas
          (versión {CONDICIONES_VERSION}). Para seguir usando tu panel necesitamos que las aceptes una vez.
        </p>
        <ul className="text-sm text-cx-texto space-y-1.5 mb-4 list-disc pl-5">
          <li>Recibes el precio base de tu servicio (sin impuestos) más un 10 %.</li>
          <li>El pago de cada venta se hace efectivo a los 7 días.</li>
          <li>Coxiro emite en tu nombre la factura por el servicio (facturación por el destinatario).</li>
        </ul>
        <p className="text-sm mb-6">
          <a href={CONDICIONES_RUTA} target="_blank" className="text-cx-prof underline">
            Leer las condiciones completas
          </a>
        </p>
        {sp.error && (
          <p className="text-sm text-red-600 mb-4">No se pudo guardar. Inténtalo de nuevo.</p>
        )}
        <form action={aceptarCondiciones}>
          <p className="text-xs text-cx-texto-2 mb-3">
            Al pulsar el botón aceptas estas condiciones y los{" "}
            <a href="/terminos" target="_blank" className="underline">Términos y Condiciones</a>. Guardamos la
            fecha, la versión y tu IP como prueba de la aceptación.
          </p>
          <button className="w-full rounded-lg bg-cx-celeste text-cx-noche font-semibold text-sm py-2.5 hover:brightness-105 transition">
            Acepto las condiciones
          </button>
        </form>
      </div>
    </main>
  );
}
