"use client";

import { useState } from "react";

// Compartir con el menú del móvil (navigator.share) o, si no existe, copia el enlace.
export default function ShareButton({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* el usuario cerró el menú de compartir */
    }
  }

  return (
    <button
      type="button"
      onClick={compartir}
      className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/25 text-white text-sm font-semibold px-4 py-2 hover:bg-white/20 transition"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
      </svg>
      <span aria-live="polite">{copiado ? "Enlace copiado" : "Compartir"}</span>
    </button>
  );
}
