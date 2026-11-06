import Reveal from "@/components/Reveal";

const I = {
  tarjeta: (<><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></>),
  factura: (<><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" /></>),
  candado: (<><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
  enlace: (<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>),
  grafico: (<><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></>),
  correo: (<><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>),
};

const ITEMS = [
  { icon: I.tarjeta, t: "Cobros con tarjeta y SEPA", d: "Pago único, a plazos o suscripción. Los cobros por SEPA se hacen solos." },
  { icon: I.factura, t: "Facturas automáticas", d: "La factura de tu cliente y tu autofactura, en cada cobro y con VeriFactu." },
  { icon: I.candado, t: "Área privada de contenido", d: "Tus alumnos entran a lo que han comprado, sin crear cuenta." },
  { icon: I.enlace, t: "Enlaces privados de pago", d: "Cobra sin publicar nada: un enlace por cliente o por servicio." },
  { icon: I.grafico, t: "Tu negocio de un vistazo", d: "Cuánto vendes, quién te compra y qué funciona." },
  { icon: I.correo, t: "Emails automáticos", d: "Confirmaciones de compra y avisos a tu cliente, sin que hagas nada." },
];

export default function FuncionesGrid() {
  return (
    <section id="todo" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal variant="up">
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] text-cx-noche max-w-3xl">
            Todo lo que necesitas para cobrar, desde el primer día
          </h2>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ITEMS.map((x, i) => (
            <Reveal key={x.t} variant="up" delay={(i % 3) * 90} className="h-full">
              <div className="h-full rounded-3xl border border-cx-borde bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-cx-celeste hover:shadow-[0_24px_50px_-24px_rgba(8,116,189,.35)]">
                <span className="w-12 h-12 rounded-xl bg-cx-hielo text-cx-prof flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {x.icon}
                  </svg>
                </span>
                <h3 className="font-display font-bold text-[26px] leading-tight text-cx-noche mt-5">{x.t}</h3>
                <p className="text-base text-cx-texto-2 mt-2">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
