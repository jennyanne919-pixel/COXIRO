"use client";

import { useState } from "react";

// Conectar con Stripe tarda unos segundos (se crea la cuenta y el enlace
// de alta). Al pulsar, el botón se bloquea y avisa, para que nadie lo
// pulse varias veces y se creen cuentas de Stripe duplicadas.
export default function ConectarStripeBoton({
  className,
  children = "Conectar con Stripe",
}: {
  className: string;
  children?: React.ReactNode;
}) {
  const [cargando, setCargando] = useState(false);

  return (
    <a
      href="/api/stripe/connect"
      aria-busy={cargando}
      aria-disabled={cargando}
      onClick={(e) => {
        if (cargando) {
          e.preventDefault();
          return;
        }
        setCargando(true);
      }}
      className={`${className} ${cargando ? "opacity-70 pointer-events-none" : ""}`}
    >
      {cargando ? "Conectando con Stripe… un momento" : children}
    </a>
  );
}
