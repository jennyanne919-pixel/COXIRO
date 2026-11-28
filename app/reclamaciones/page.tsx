import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { enviarReclamacion } from "./actions";

export const metadata: Metadata = {
  title: "Reclamaciones — Coxiro",
};

const CAMPO = "w-full rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm";

export default async function ReclamacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; ref?: string; error?: string; sinacuse?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="px-8 py-5">
        <a href="/">
          <Logo variant="light" />
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-xs text-cx-texto-2 uppercase tracking-wide font-semibold mb-2">Atención al cliente</p>
        <h1 className="text-3xl font-display font-semibold mb-4">Reclamaciones</h1>

        {sp.ok ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-5 py-4 leading-relaxed">
            <p className="font-semibold mb-1">Hemos recibido tu reclamación.</p>
            <p>
              Tu referencia es <strong>{sp.ref}</strong>.{" "}
              {sp.sinacuse
                ? "No hemos podido enviarte el justificante por correo: guarda esta referencia y escríbenos a coxiro.info@gmail.com si no tienes noticias en 48 horas."
                : "Te hemos enviado un justificante a tu correo. Revisa también la carpeta de spam."}{" "}
              Te responderemos de forma motivada en un plazo objetivo de 14 días naturales.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-cx-texto-2 mb-6 leading-relaxed">
              Cuéntanos qué ha pasado y qué solicitas. Recibirás un justificante por correo con una referencia y te
              responderemos de forma motivada. También puedes escribir a{" "}
              <a href="mailto:coxiro.info@gmail.com" className="underline">
                coxiro.info@gmail.com
              </a>
              . Si lo que quieres es desistir de una compra, indícalo en el asunto.
            </p>

            {sp.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-5">
                {sp.error === "datos"
                  ? "Revisa los datos: nombre, correo válido, asunto, descripción (mínimo 10 caracteres) y la casilla de privacidad."
                  : "No hemos podido registrar tu reclamación ahora mismo. No se ha enviado. Inténtalo de nuevo en unos minutos o escribe a coxiro.info@gmail.com."}
              </div>
            )}

            <form action={enviarReclamacion} className="grid gap-4">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Nombre y apellidos</span>
                <input name="nombre" required minLength={2} maxLength={120} autoComplete="name" className={CAMPO} />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Correo electrónico</span>
                <input name="email" type="email" required maxLength={200} autoComplete="email" className={CAMPO} />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">
                  Pedido o servicio <span className="text-cx-texto-2 font-normal">(opcional)</span>
                </span>
                <input
                  name="pedido"
                  maxLength={120}
                  placeholder="Nombre del servicio, fecha de compra o número de factura"
                  className={CAMPO}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Asunto</span>
                <input name="asunto" required minLength={3} maxLength={150} className={CAMPO} />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">¿Qué ha ocurrido?</span>
                <textarea name="mensaje" required minLength={10} maxLength={3000} rows={6} className={CAMPO} />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">
                  ¿Qué solicitas? <span className="text-cx-texto-2 font-normal">(opcional)</span>
                </span>
                <textarea name="peticion" maxLength={1000} rows={3} className={CAMPO} />
              </label>

              {/* Campo trampa para bots */}
              <div aria-hidden="true" className="hidden">
                <label>
                  No rellenar
                  <input name="web" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <label className="flex items-start gap-2 text-xs text-cx-texto-2 leading-snug">
                <input type="checkbox" name="acepto" required className="mt-0.5" />
                <span>
                  Entiendo que Coxiro tratará estos datos para atender mi reclamación, según la{" "}
                  <a href="/aviso-legal" target="_blank" className="underline">
                    política de privacidad
                  </a>
                  .
                </span>
              </label>

              <div>
                <button className="rounded-full bg-cx-noche text-white px-6 py-3 text-sm font-semibold hover:-translate-y-0.5 transition">
                  Enviar reclamación
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
