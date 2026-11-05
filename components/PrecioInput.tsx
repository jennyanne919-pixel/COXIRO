"use client";

import { useState } from "react";
import { totalCliente } from "@/lib/pricing";

// Campo de precio del profesional. Debajo muestra, en directo, el
// precio final que pagará su cliente (impuestos incluidos).
export default function PrecioInput({
  defaultValue,
  required,
  placeholder,
  className,
}: {
  defaultValue?: number | string | null;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [valor, setValor] = useState(
    defaultValue === null || defaultValue === undefined ? "" : String(defaultValue)
  );
  const base = Number(valor);

  return (
    <>
      <input
        name="price"
        type="number"
        step="0.01"
        min="0"
        required={required}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className={className}
      />
      {base > 0 && (
        <p className="text-xs text-stone mt-1">
          Precio final para tu cliente:{" "}
          <span className="font-medium text-ink">
            {totalCliente(base).toFixed(2)} €
          </span>{" "}
          (impuestos incluidos)
        </p>
      )}
    </>
  );
}
