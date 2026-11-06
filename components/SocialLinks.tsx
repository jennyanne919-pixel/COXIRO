// Redes sociales de Coxiro. Rellena aquí las direcciones de las cuentas:
// los iconos con la dirección vacía no se muestran.
const REDES = {
  instagram: "",
  facebook: "",
  youtube: "",
};

const ICONOS: Record<keyof typeof REDES, { nombre: string; ruta: React.ReactNode }> = {
  instagram: {
    nombre: "Instagram",
    ruta: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  facebook: {
    nombre: "Facebook",
    ruta: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5A.5.5 0 0 1 14 8Z" />,
  },
  youtube: {
    nombre: "YouTube",
    ruta: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
      </>
    ),
  },
};

export default function SocialLinks({ className = "" }: { className?: string }) {
  const activas = (Object.keys(REDES) as (keyof typeof REDES)[]).filter((k) => REDES[k]);
  if (activas.length === 0) return null;
  return (
    <ul className={`flex items-center gap-3 ${className}`} aria-label="Redes sociales">
      {activas.map((k) => (
        <li key={k}>
          <a
            href={REDES[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ICONOS[k].nombre}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cx-borde text-cx-texto-2 hover:border-cx-celeste hover:text-cx-prof transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICONOS[k].ruta}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
