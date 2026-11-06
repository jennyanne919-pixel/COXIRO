"use client";

import { useState } from "react";
import { baseDesdeTotal, calcularPrecios, totalCliente } from "@/lib/pricing";

const eur = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

const aTexto = (n: number) =>
  Number.isFinite(n) && n > 0 ? String(Math.round(n * 10000) / 10000) : "";

// Precio del servicio con dos casillas enlazadas: el profesional escribe
// el precio de su producto (sin impuestos) o el precio final que paga su
// cliente (impuestos incluidos) y la otra se calcula sola. El formulario
// guarda siempre el precio base, en el campo oculto "price".
export default function PrecioInput({
  defaultValue,
  required,
  opcional,
  comision = 10,
  className,
}: {
  defaultValue?: number | string | null;
  required?: boolean;
  opcional?: boolean;
  comision?: number;
  className?: string;
}) {
  const inicial = Number(defaultValue ?? 0);
  const [base, setBase] = useState(aTexto(inicial));
  const [final, setFinal] = useState(inicial > 0 ? aTexto(totalCliente(inicial)) : "");

  const baseNum = Number(base) > 0 ? Number(base) : 0;
  const p = baseNum > 0 ? calcularPrecios(baseNum, comision) : null;
  const clase = className ?? "w-full rounded-lg border border-cx-borde bg-white px-3.5 py-2 text-sm";

  return (
    <div>
      <input type="hidden" name="price" value={baseNum > 0 ? String(baseNum) : ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-cx-texto-2 block mb-1">
            Precio de tu producto, sin impuestos (€){opcional && " — opcional"}
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required={required}
            placeholder="1000.00"
            value={base}
            onChange={(e) => {
              setBase(e.target.value);
              const n = Number(e.target.value);
              setFinal(n > 0 ? aTexto(totalCliente(n)) : "");
            }}
            className={clase}
          />
        </div>
        <div>
          <label className="text-xs text-cx-texto-2 block mb-1">
            O el precio final al cliente, impuestos incluidos (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="1210.00"
            value={final}
            onChange={(e) => {
              setFinal(e.target.value);
              const n = Number(e.target.value);
              setBase(n > 0 ? aTexto(baseDesdeTotal(n)) : "");
            }}
            className={clase}
          />
        </div>
      </div>
      <p className="text-xs text-cx-texto-2 mt-1">Escribe uno de los dos; el otro se calcula solo.</p>

      {p && (
        <div className="mt-3 rounded-lg border border-cx-borde bg-white px-3.5 py-3 text-xs text-cx-texto-2 grid gap-1">
          <div className="flex justify-between gap-3">
            <span>Tu cliente pagará (impuestos incluidos)</span>
            <span className="font-medium text-cx-texto">{eur(p.totalCents / 100)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Tú recibirás con Coxiro</span>
            <span className="font-semibold text-cx-prof">{eur(p.netoProveedorCents / 100)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Sin Coxiro recibirías</span>
            <span className="font-medium text-cx-texto">{eur(p.baseCents / 100)}</span>
          </div>
          {p.netoProveedorCents > p.baseCents && (
            <p className="text-cx-prof font-medium pt-1">
              Con Coxiro te quedas {eur((p.netoProveedorCents - p.baseCents) / 100)} más en cada venta.
            </p>
          )}
          <p className="text-[11px] pt-1">
            «Sin Coxiro» es lo que te quedaría vendiendo por tu cuenta, con los impuestos
            habituales y antes de comisiones de cobro. Con Coxiro, el importe ya lleva
            descontada nuestra comisión y además tienes la infraestructura tecnológica cubierta.
          </p>
        </div>
      )}
    </div>
  );
}
