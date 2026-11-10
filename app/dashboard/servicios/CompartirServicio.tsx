"use client";

import { useEffect, useRef, useState } from "react";
import { BTN_SECONDARY, Icon } from "@/components/dashboard/ui";

// Botón "Compartir": abre un menú con WhatsApp, Telegram, email, LinkedIn,
// X, copiar enlace y (en el móvil) la hoja de compartir del propio teléfono,
// que añade Instagram, Messenger, SMS, etc. El enlace es el de la página
// pública del servicio (funciona aunque el servicio esté como privado).
const ICONOS: Record<string, React.ReactNode> = {
  whatsapp: (
    <>
      <path d="M3 21l1.65-4.85A8.5 8.5 0 1 1 8 19.4L3 21z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.5-2-1-.8.7a3.5 3.5 0 0 1-1.6-1.6l.7-.8-1-2L9 9.5z" />
    </>
  ),
  telegram: <path d="M21.5 3 2.5 10.3l6.3 2.4L11 20l3.2-4 4.8 3.6L21.5 3ZM8.8 12.7l9-6" />,
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v6M8 7.5v.01M12 17v-6M12 13.5a2.5 2.5 0 0 1 5 0V17" />
    </>
  ),
  x: <path d="M4 4l16 16M20 4 4 20" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.6 6.8-4.2M8.6 13.4l6.8 4.2" />
    </>
  ),
};

export default function CompartirServicio({ id, title }: { id: string; title: string }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [hayShare, setHayShare] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/servicio/${id}`;
  const mensaje = `${title}\n${url}`;

  useEffect(() => {
    setHayShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  const enc = encodeURIComponent;
  const canales = [
    { k: "whatsapp", nombre: "WhatsApp", href: `https://wa.me/?text=${enc(mensaje)}` },
    { k: "telegram", nombre: "Telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` },
    { k: "email", nombre: "Email", href: `mailto:?subject=${enc(title)}&body=${enc(`Te paso esto, mira:\n\n${title}\n${url}`)}` },
    { k: "linkedin", nombre: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { k: "x", nombre: "X", href: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}` },
  ];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copia el enlace manualmente:", url);
    }
  }

  async function compartirNativo() {
    try {
      await navigator.share({ title, text: title, url });
      setAbierto(false);
    } catch {
      /* el usuario canceló */
    }
  }

  const item =
    "flex items-center gap-2.5 w-full text-left text-sm text-cx-noche rounded-lg px-3 py-2 hover:bg-cx-hielo transition";
  const svg = (k: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-cx-prof shrink-0">
      {ICONOS[k]}
    </svg>
  );

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className={BTN_SECONDARY}
      >
        <Icon name="link" className="w-3.5 h-3.5" />
        Compartir
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute left-0 bottom-full mb-2 z-30 w-56 rounded-2xl bg-white border border-cx-borde shadow-lg p-2"
        >
          {canales.map((c) => (
            <a
              key={c.k}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setAbierto(false)}
              className={item}
            >
              {svg(c.k)}
              {c.nombre}
            </a>
          ))}
          {hayShare && (
            <button type="button" role="menuitem" onClick={compartirNativo} className={item}>
              {svg("share")}
              Más opciones…
            </button>
          )}
          <button type="button" role="menuitem" onClick={copiar} className={`${item} border-t border-cx-borde rounded-t-none mt-1`}>
            <Icon name={copiado ? "check" : "link"} className="w-[18px] h-[18px] text-cx-prof shrink-0" />
            {copiado ? "¡Enlace copiado!" : "Copiar enlace"}
          </button>
        </div>
      )}
    </div>
  );
}
