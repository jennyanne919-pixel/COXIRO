// Banner superior: franja celeste con texto que se desplaza en bucle.
// Se pausa al pasar el ratón y queda quieto con prefers-reduced-motion.
const MENSAJES = [
  "Plazas de profesional fundador abiertas",
  "Sin cuota mensual",
  "Gana hasta un 10% más en tus ventas a particulares en España",
  "Factura automática con VeriFactu",
  "Cobros con tarjeta y SEPA",
];

export default function Banner() {
  return (
    <div
      className="bg-cx-celeste text-cx-noche overflow-hidden whitespace-nowrap py-2 text-sm font-semibold"
      role="region"
      aria-label="Anuncios"
    >
      <div className="inline-flex animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copia) => (
          <span key={copia} className="flex items-center" aria-hidden={copia === 1}>
            {MENSAJES.map((m) => (
              <span key={m} className="flex items-center">
                <span className="px-4">{m}</span>
                <span aria-hidden="true">·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
