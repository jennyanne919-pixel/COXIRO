"use client";

import { useState } from "react";
import { BTN_SECONDARY, Icon } from "@/components/dashboard/ui";

// Copia el enlace directo al servicio (funciona este o no marcado como
// publico en el catalogo -- la pagina /servicio/[id] no depende de eso).
// Sirve para mandar un enlace exclusivo por WhatsApp, email, etc. sin que
// el servicio tenga que aparecer en ningun listado.
export default function CopyLinkButton({ id }: { id: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiarEnlace = async () => {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/servicio/${id}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar el enlace:", err);
      // Fallback por si el navegador bloquea el portapapeles.
      window.prompt("Copia el enlace manualmente:", url);
    }
  };

  return (
    <button type="button" onClick={copiarEnlace} className={BTN_SECONDARY}>
      <Icon name={copiado ? "check" : "link"} className="w-3.5 h-3.5" />
      {copiado ? "¡Copiado!" : "Copiar enlace"}
    </button>
  );
}
