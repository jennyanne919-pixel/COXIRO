import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  Card,
  EmptyState,
  Icon,
  PageHeader,
  type IconName,
} from "./ui";

export type ContenidoItem = {
  id: string;
  titulo: string;
  tipo: string; // video | audio | pdf | link | document
  href: string;
  reproducible: boolean;
  pos: number; // segundos vistos
  dur: number; // segundos totales (0 si no se conoce)
  interno?: boolean; // se abre en la misma pestaña (vista del curso)
  completada?: boolean;
};

export type ContenidoGrupo = {
  id: string;
  titulo: string;
  profesional: string;
  items: ContenidoItem[];
};

const TIPOS: Record<string, { label: string; icon: IconName }> = {
  video: { label: "Vídeo", icon: "play" },
  audio: { label: "Audio", icon: "play" },
  pdf: { label: "PDF", icon: "doc" },
  link: { label: "Enlace", icon: "external" },
  document: { label: "Documento", icon: "doc" },
  lesson: { label: "Lección", icon: "play" },
};

// Vista pura de "Mi contenido". La usa el panel real y la maqueta de la web.
export default function ContenidoView({ grupos }: { grupos: ContenidoGrupo[] }) {
  return (
    <div>
      <PageHeader title="Mi contenido" subtitle="Todo lo que has comprado, en un solo lugar" />

      {grupos.length ? (
        <div className="grid gap-5">
          {grupos.map((g) => (
            <Card key={g.id} className="overflow-hidden">
              <div className="px-5 py-4 border-b border-cx-borde bg-cx-hielo/40">
                <p className="font-display font-bold text-cx-noche">{g.titulo}</p>
                <p className="text-xs text-cx-texto-2 mt-0.5">{g.profesional}</p>
              </div>
              {g.items.length ? (
                <ul className="divide-y divide-cx-borde">
                  {g.items.map((it) => {
                    const t = TIPOS[it.tipo] ?? { label: it.tipo, icon: "doc" as IconName };
                    const visto = it.reproducible && it.dur > 0 && it.pos >= it.dur - 10;
                    const pct = it.dur > 0 ? Math.min(100, Math.round((it.pos / it.dur) * 100)) : 0;
                    const empezado = it.reproducible && it.pos > 5;
                    return (
                      <li key={it.id} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="w-10 h-10 rounded-xl bg-cx-hielo text-cx-prof flex items-center justify-center shrink-0">
                          <Icon name={t.icon} className="w-[18px] h-[18px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-cx-noche truncate">{it.titulo}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-cx-texto-2">{t.label}</span>
                            {it.completada && (
                              <span className="text-xs text-cx-prof font-medium">Completada ✓</span>
                            )}
                            {empezado && (
                              <>
                                {it.dur > 0 && (
                                  <span className="h-1 w-20 rounded-full bg-cx-borde overflow-hidden">
                                    <span
                                      className="block h-full bg-cx-celeste"
                                      style={{ width: `${visto ? 100 : pct}%` }}
                                    />
                                  </span>
                                )}
                                <span className="text-xs text-cx-prof font-medium">
                                  {visto ? "Visto" : it.dur > 0 ? `${pct} %` : "En curso"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <a
                          href={it.href}
                          target={it.reproducible || it.interno ? "_self" : "_blank"}
                          className={BTN_SECONDARY}
                        >
                          <Icon name={it.reproducible || it.interno ? "play" : "external"} className="w-3.5 h-3.5" />
                          {empezado && !visto ? "Continuar" : it.reproducible || it.interno ? "Ver" : "Abrir"}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-cx-texto-2 px-5 py-4">
                  El profesional todavía no ha subido contenido para esto.
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="play"
            title="Todavía no tienes contenido"
            text="Cuando compres un servicio con contenido, lo encontrarás aquí."
            action={
              <a href="/catalogo" className={BTN_PRIMARY}>
                <Icon name="globe" />
                Ver el catálogo
              </a>
            }
          />
        </Card>
      )}
    </div>
  );
}
