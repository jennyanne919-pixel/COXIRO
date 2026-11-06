import Reveal from "@/components/Reveal";

const NUM = "font-display font-bold text-[96px] md:text-[120px] leading-none select-none";
const numStyle = { color: "#EAF6FF", WebkitTextStroke: "2px #0874BD" } as const;
const mock =
  "rounded-3xl border border-cx-borde bg-white p-6 shadow-[0_20px_50px_-20px_rgba(8,35,70,.25)] transition duration-300 hover:-translate-y-2 hover:border-cx-celeste";

function Fila({ n, titulo, texto, invertir, children }: { n: string; titulo: string; texto: string; invertir?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
      <Reveal variant={invertir ? "right" : "left"} className={invertir ? "md:order-2" : ""}>
        <div className={NUM} style={numStyle} aria-hidden="true">{n}</div>
        <h3 className="font-display font-bold text-3xl md:text-4xl text-cx-noche -mt-3">{titulo}</h3>
        <p className="text-cx-texto-2 mt-3 max-w-md text-lg">{texto}</p>
      </Reveal>
      <Reveal variant={invertir ? "left" : "right"} delay={120} className={invertir ? "md:order-1" : ""}>
        {children}
      </Reveal>
    </div>
  );
}

export default function ComoFunciona() {
  return (
    <section id="como" className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal variant="up">
          <h2 className="font-display font-bold text-4xl md:text-[80px] leading-[1] text-cx-noche max-w-4xl">
            De tu conocimiento a tu cuenta en tres pasos
          </h2>
        </Reveal>

        <div className="mt-16 space-y-20 md:space-y-28">
          <Fila n="01" titulo="Sube lo que vendes" texto="Pon título, precio y cómo lo entregas. Publícalo en el catálogo o guárdalo para enviarlo por privado.">
            <div className={mock}>
              <div className="text-xs font-semibold text-cx-texto-2 uppercase tracking-wide">Nuevo servicio</div>
              <div className="mt-3 rounded-xl border border-cx-borde px-4 py-3 text-cx-noche font-medium">Mentoría de marca personal</div>
              <div className="mt-3 rounded-xl border border-cx-borde px-4 py-3 text-cx-noche font-semibold">290 €</div>
              <div className="mt-4 flex items-center justify-between text-sm text-cx-texto">
                <span>Visible en el catálogo público</span>
                <span className="w-10 h-6 rounded-full bg-cx-celeste relative"><span className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white" /></span>
              </div>
              <p className="text-[11px] text-cx-texto-2 mt-4">Datos de ejemplo</p>
            </div>
          </Fila>

          <Fila invertir n="02" titulo="Comparte tu enlace" texto="Cada servicio tiene su enlace de pago. Pégalo donde ya hablas con tus clientes y listo.">
            <div className={`${mock} !bg-cx-noche !border-white/10 text-white`}>
              <div className="text-xs font-semibold text-[#C9D6EA] uppercase tracking-wide">Tu enlace</div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3">
                <span className="truncate font-medium">coxiro.es/p/marca-personal</span>
                <span className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-4 py-1.5">Copiar</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["WhatsApp", "Bio de Instagram", "Email", "Telegram"].map((t) => (
                  <span key={t} className="rounded-full border border-white/25 px-3.5 py-1.5 text-sm text-[#C9D6EA]">{t}</span>
                ))}
              </div>
              <p className="text-[11px] text-[#C9D6EA]/70 mt-4">Datos de ejemplo</p>
            </div>
          </Fila>

          <Fila n="03" titulo="Cobras sin hacer papeleo" texto="Tu cliente paga, la factura se emite automáticamente y el dinero llega a tu cuenta.">
            <div className={`${mock} !p-0 overflow-hidden`}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cx-noche">COX-2026-0142</span>
                  <span className="rounded-full bg-cx-hielo text-cx-prof text-xs font-semibold px-3 py-1">Enviada</span>
                </div>
                <div className="mt-3 text-sm text-cx-texto-2">Pago único · Mentoría de marca personal</div>
                <div className="mt-3 text-sm text-cx-noche">Registro VeriFactu: <strong>Correcto</strong></div>
                <p className="text-[11px] text-cx-texto-2 mt-4">Datos de ejemplo</p>
              </div>
              <div className="bg-cx-noche text-white px-6 py-4 flex items-center justify-between text-sm">
                <span>Transferencia a tu cuenta</span>
                <span className="text-cx-celeste font-semibold">Viernes</span>
              </div>
            </div>
          </Fila>
        </div>
      </div>
    </section>
  );
}
