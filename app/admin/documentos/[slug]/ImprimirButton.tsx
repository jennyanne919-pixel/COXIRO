"use client";

import { BTN_SECONDARY } from "@/components/dashboard/ui";

// Abre el cuadro de impresión del navegador: ahí se elige "Guardar como PDF".
export default function ImprimirButton() {
  return (
    <button type="button" onClick={() => window.print()} className={BTN_SECONDARY}>
      Guardar como PDF
    </button>
  );
}
