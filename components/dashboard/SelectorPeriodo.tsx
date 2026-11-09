import { etiquetaPeriodo } from "@/lib/admin/contabilidad";

// Selector de año y trimestre por enlaces (sin JavaScript en cliente).
export default function SelectorPeriodo({
  base,
  anio,
  trimestre,
  anios,
}: {
  base: string;
  anio: number;
  trimestre: number;
  anios: number[];
}) {
  const chip = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium border whitespace-nowrap ${
      on ? "bg-cx-noche text-white border-cx-noche" : "bg-white border-cx-borde text-cx-texto-2 hover:border-cx-celeste"
    }`;
  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        {anios.map((a) => (
          <a key={a} href={`${base}?a=${a}&t=${trimestre}`} className={chip(a === anio)}>
            {a}
          </a>
        ))}
        <span className="w-px bg-cx-borde mx-1" />
        {[0, 1, 2, 3, 4].map((t) => (
          <a key={t} href={`${base}?a=${anio}&t=${t}`} className={chip(t === trimestre)}>
            {t === 0 ? "Año completo" : `T${t}`}
          </a>
        ))}
      </div>
      <p className="text-xs text-cx-texto-2">Mostrando: {etiquetaPeriodo(anio, trimestre)}</p>
    </div>
  );
}
