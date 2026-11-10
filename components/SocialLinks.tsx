// Redes sociales de Coxiro. Rellena aquí las direcciones de las cuentas:
// los iconos con la dirección vacía no se muestran.
const REDES = {
  instagram: "https://www.instagram.com/coxiro_hq",
  facebook: "https://www.facebook.com/share/1EuuACtxey/",
  tiktok: "https://www.tiktok.com/@coxiro_hq",
  youtube: "https://www.youtube.com/@COXIRO_HQ",
  linkedin: "https://www.linkedin.com/in/jenny-anne-abriam-98973244a/",
  x: "https://x.com/COXIRO_",
  telegram: "",
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
  tiktok: {
    nombre: "TikTok",
    ruta: <path d="M10 12.5a3.5 3.5 0 1 0 3.5 3.5V3.5c.4 2.6 2 4.2 5 4.5" />,
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
  linkedin: {
    nombre: "LinkedIn",
    ruta: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 11v6M8 7.5v.01M12 17v-6M12 13.5a2.5 2.5 0 0 1 5 0V17" />
      </>
    ),
  },
  x: {
    nombre: "X",
    ruta: <path d="M4 4l16 16M20 4 4 20" />,
  },
  telegram: {
    nombre: "Telegram",
    ruta: <path d="M21.5 3 2.5 10.3l6.3 2.4L11 20l3.2-4 4.8 3.6L21.5 3ZM8.8 12.7l9-6" />,
  },
};

export default function SocialLinks({ className = "", oscuro = false }: { className?: string; oscuro?: boolean }) {
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
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${oscuro ? "border-white/25 text-cx-texto-osc-2 hover:border-cx-celeste hover:text-cx-celeste" : "border-cx-borde text-cx-texto-2 hover:border-cx-celeste hover:text-cx-prof"}`}
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
