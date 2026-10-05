"use client";

import { useEffect, useRef, useState } from "react";

// Desplegable "Entra" de la cabecera (escritorio).
// Antes era solo CSS con :hover y un hueco de 8px entre el boton y el
// menu: al mover el raton hacia el menu se pasaba por ese hueco, dejaba
// de estar "encima" y el menu desaparecia antes de poder pulsar nada.
// Ahora: se abre al pasar el raton O al pulsar, no hay hueco entre el
// boton y el menu, y se cierra al pulsar fuera, al salir con el raton o
// con la tecla Escape.
export default function EntraMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPressOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPressOutside);
    document.addEventListener("touchstart", onPressOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPressOutside);
      document.removeEventListener("touchstart", onPressOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg border border-copper px-4 py-2.5 text-sm font-semibold text-copper hover:bg-copper/5 transition whitespace-nowrap flex items-center gap-1"
      >
        Entra
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-2 z-50 min-w-[220px]">
          <div className="bg-white border border-stone/20 rounded-lg shadow-lg py-2">
            <a href="/login" className="block px-4 py-3 text-sm hover:bg-paper">
              <p className="font-medium">Acceder a mis compras</p>
            </a>
            <a href="/login" className="block px-4 py-3 text-sm hover:bg-paper">
              <p className="font-medium">Gestionar mi negocio</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
