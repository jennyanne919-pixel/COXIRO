const FILA_1 = ["Mentores", "Formadores", "Creadores de contenido", "Consultores", "Coaches", "Servicios de IA"];
const FILA_2 = ["Diseñadores", "Profesores de idiomas", "Entrenadores", "Academias online", "Terapeutas online"];

function Fila({ items, anim }: { items: string[]; anim: string }) {
  const lista = [...items, ...items];
  return (
    <div className="cinta-fila flex w-max" style={{ animation: anim }}>
      {lista.map((t, i) => (
        <span
          key={i}
          aria-hidden={i >= items.length}
          className="cinta-texto font-display font-bold text-5xl md:text-[76px] leading-[1.15] px-6 md:px-10 whitespace-nowrap select-none"
        >
          {t}
          <span className="text-cx-prof mx-6 md:mx-10" style={{ WebkitTextStroke: 0 }} aria-hidden="true">•</span>
        </span>
      ))}
    </div>
  );
}

export default function CintaProfesiones() {
  return (
    <section id="para-quien" className="cinta bg-white py-14 md:py-20 overflow-hidden" aria-label="Para quién es Coxiro">
      <style>{`
        @keyframes cintaIzq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes cintaDer{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        .cinta-texto{color:transparent;-webkit-text-stroke:1.5px #0874BD;transition:color .25s}
        .cinta-texto:hover{color:#38C6FF}
        .cinta:hover .cinta-fila{animation-play-state:paused !important}
        @media (prefers-reduced-motion: reduce){.cinta-fila{animation:none !important}}
      `}</style>
      <div className="space-y-2">
        <Fila items={FILA_1} anim="cintaIzq 38s linear infinite" />
        <Fila items={FILA_2} anim="cintaDer 46s linear infinite" />
      </div>
    </section>
  );
}
