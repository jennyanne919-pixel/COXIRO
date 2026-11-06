"use client";

import Link from "next/link";
import { useState } from "react";
import Reveal from "@/components/Reveal";
import { calcularPrecios } from "@/lib/pricing";

// Separador de miles manual (es-ES no agrupa los números de 4 cifras).
const eur = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function Calculadora() {
  const [ventas, setVentas] = useState(3000);
  const p = calcularPrecios(ventas, 10);
  const mes = (p.netoProveedorCents - p.baseCents) / 100;
  const anio = mes * 12;
  const pct = ((ventas - 500) / (30000 - 500)) * 100;

  return (
    <section id="calc" className="bg-cx-hielo py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal variant="left">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cx-prof">Pon tus números</span>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] mt-4 text-cx-noche">
            ¿Cuánto vendes al mes a clientes particulares?
          </h2>
          <div className="mt-10">
            <div className="font-display font-bold text-5xl md:text-6xl text-cx-noche tabular-nums">
              {eur(ventas)} €
            </div>
            <input
              type="range"
              min={500}
              max={30000}
              step={500}
              value={ventas}
              onChange={(e) => setVentas(Number(e.target.value))}
              aria-label="Ventas mensuales a clientes particulares en euros"
              className="calc-range mt-5 w-full"
              style={{ background: `linear-gradient(to right,#0874BD ${pct}%,#D6E6F5 ${pct}%)` }}
            />
            <div className="flex justify-between text-xs text-cx-texto-2 mt-2">
              <span>500 €</span>
              <span>30.000 €</span>
            </div>
          </div>
          <style>{`
            .calc-range{-webkit-appearance:none;appearance:none;height:8px;border-radius:999px;outline:none}
            .calc-range::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#38C6FF;border:4px solid #fff;box-shadow:0 2px 8px rgba(8,116,189,.4);cursor:pointer}
            .calc-range::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#38C6FF;border:4px solid #fff;box-shadow:0 2px 8px rgba(8,116,189,.4);cursor:pointer}
          `}</style>
        </Reveal>

        <Reveal variant="right">
          <div className="bg-cx-noche rounded-[32px] p-8 md:p-12 text-white">
            <p className="text-lg md:text-xl text-[#C9D6EA]">Con Coxiro ganas</p>
            <div className="font-display font-bold text-cx-celeste text-7xl md:text-[96px] leading-none mt-3 tabular-nums break-words">
              {eur(mes)} €
            </div>
            <p className="text-lg mt-2 text-white">extras al mes</p>
            <p className="text-[#C9D6EA] mt-5">
              que son <strong className="text-white">{eur(anio)} €</strong> extras al año en tu bolsillo.
            </p>
            <Link
              href="/registro?role=provider"
              className="inline-block mt-8 rounded-full bg-cx-celeste text-cx-noche font-semibold px-7 py-3.5 hover:brightness-110 transition"
            >
              Quiero empezar a ganar más
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
