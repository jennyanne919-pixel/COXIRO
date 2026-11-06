import Link from "next/link";
import Reveal from "@/components/Reveal";

const FAQ = [
  { q: "¿Tengo que pagar una cuota mensual?", a: "No. Las funcionalidades no tienen cuota. Solo se cobraría el alojamiento si subes mucho contenido." },
  { q: "¿Mis clientes tienen que registrarse?", a: "No. Pagan con nombre, email y tarjeta o cuenta bancaria, y reciben su factura por email." },
  { q: "¿Quién emite las facturas?", a: "Coxiro, en cada cobro: la factura de tu cliente y tu autofactura, registradas con VeriFactu." },
  { q: "¿Puedo cobrar a plazos o con suscripción?", a: "Sí. Eliges el número de plazos o una cuota periódica, y los cobros por SEPA se hacen solos." },
];

export function Partners() {
  return (
    <section id="partners" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal variant="scale">
          <div className="rounded-[32px] border border-cx-borde p-8 md:p-14 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cx-prof">Programa de partners</span>
              <h2 className="font-display font-bold text-3xl md:text-5xl leading-[1.05] text-cx-noche mt-4 max-w-xl">
                Recomienda Coxiro y llévate el 1% de lo que facture cada profesional que traigas
              </h2>
              <p className="text-lg text-cx-texto-2 mt-4">Todos los meses, mientras siga activo, sin tope.</p>
              <Link
                href="/herramientas/partners"
                className="inline-block mt-7 rounded-full bg-cx-noche text-white font-semibold px-7 py-3.5 hover:-translate-y-0.5 transition"
              >
                Ver programa
              </Link>
            </div>
            <div className="font-display font-bold text-[96px] md:text-[160px] leading-none text-cx-celeste" aria-hidden="true">
              1%
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="bg-cx-hielo py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <Reveal variant="up">
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] text-cx-noche">Preguntas frecuentes</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} variant="up" delay={i * 70}>
              <details className="group rounded-2xl bg-white border border-cx-borde px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-cx-noche [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-3xl font-light leading-none text-cx-prof transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-cx-texto-2">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
