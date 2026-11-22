"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

// Botón de guardar que dice "Guardando…" mientras se envía y "Guardado ✓"
// unos segundos al terminar, para que se vea que el cambio se ha hecho.
export default function GuardarBtn({
  className,
  children = "Guardar cambios",
}: {
  className: string;
  children?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  const estabaEnviando = useRef(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (pending) {
      estabaEnviando.current = true;
      setGuardado(false);
      return;
    }
    if (estabaEnviando.current) {
      estabaEnviando.current = false;
      setGuardado(true);
      const t = setTimeout(() => setGuardado(false), 3000);
      return () => clearTimeout(t);
    }
  }, [pending]);

  return (
    <button type="submit" disabled={pending} aria-live="polite" className={`${className} ${pending ? "opacity-70 cursor-wait" : ""}`}>
      {pending ? "Guardando…" : guardado ? "Guardado ✓" : children}
    </button>
  );
}
