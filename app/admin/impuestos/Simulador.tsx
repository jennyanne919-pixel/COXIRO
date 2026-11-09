"use client";

import { useState } from "react";
import { irpfEstimado } from "@/lib/admin/irpf";

const eur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", useGrouping: "always" }).format(n);

const input = "w-full rounded-lg border border-cx-borde bg-white px-3 py-2 text-sm mt-1";

// Simulador orientativo: ¿cuántas ventas necesita Coxiro y cuánto queda?
// Usa las reglas reales de lib/pricing.ts: Coxiro se queda con la comisión
// más el punto con el que asume el IPSI (el otro punto del IPSI se paga).
export default function Simulador() {
  const [ventasMes, setVentasMes] = useState("20");
  const [ticket, setTicket] = useState("100");
  const [comision, setComision] = useState("10");
  const [gastosFijos, setGastosFijos] = useState("60");
  const [cuotaSS, setCuotaSS] = useState("80");
  const [melilla, setMelilla] = useState(false);

  const n = Math.max(0, Number(ventasMes.replace(",", ".")) || 0);
  const p = Math.max(0, Number(ticket.replace(",", ".")) || 0);
  const c = Math.max(0, Number(comision.replace(",", ".")) || 0);
  const gf = Math.max(0, Number(gastosFijos.replace(",", ".")) || 0);
  const ss = Math.max(0, Number(cuotaSS.replace(",", ".")) || 0);

  const margenPorVenta = (p * (c + 0.5)) / 100; // comisión + punto de IPSI asumido
  const stripePorVenta = p * 1.21 * 0.015 + 0.25; // 1,5 % + 0,25 € sobre lo que paga el cliente
  const netoPorVenta = margenPorVenta - stripePorVenta;

  const margenMes = n * netoPorVenta;
  const beneficioMes = margenMes - gf - ss;
  const beneficioAnio = beneficioMes * 12;
  // La cuota de autónomos es gasto deducible, ya restada arriba.
  const irpf = irpfEstimado(beneficioAnio, melilla);
  const netoAnio = beneficioAnio - irpf;
  const equilibrio = netoPorVenta > 0 ? Math.ceil((gf + ss) / netoPorVenta) : null;

  const Fila = ({ k, v, fuerte }: { k: string; v: string; fuerte?: boolean }) => (
    <div className={`flex justify-between gap-3 py-2 border-b border-cx-borde last:border-0 text-sm ${fuerte ? "font-semibold text-cx-noche" : "text-cx-texto-2"}`}>
      <span>{k}</span>
      <span className="whitespace-nowrap">{v}</span>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="grid grid-cols-2 gap-3 content-start">
        <label className="text-xs text-cx-texto-2">
          Ventas al mes (nº)
          <input value={ventasMes} onChange={(e) => setVentasMes(e.target.value)} inputMode="decimal" className={input} />
        </label>
        <label className="text-xs text-cx-texto-2">
          Precio base medio (€)
          <input value={ticket} onChange={(e) => setTicket(e.target.value)} inputMode="decimal" className={input} />
        </label>
        <label className="text-xs text-cx-texto-2">
          Comisión (%)
          <input value={comision} onChange={(e) => setComision(e.target.value)} inputMode="decimal" className={input} />
        </label>
        <label className="text-xs text-cx-texto-2">
          Gastos fijos al mes (€)
          <input value={gastosFijos} onChange={(e) => setGastosFijos(e.target.value)} inputMode="decimal" className={input} />
        </label>
        <label className="text-xs text-cx-texto-2 col-span-2">
          Cuota de autónomos al mes (€)
          <input value={cuotaSS} onChange={(e) => setCuotaSS(e.target.value)} inputMode="decimal" className={input} />
        </label>
        <label className="col-span-2 flex items-start gap-2 text-xs text-cx-texto-2">
          <input type="checkbox" checked={melilla} onChange={(e) => setMelilla(e.target.checked)} className="mt-0.5" />
          Aplicar la deducción del 50 % del IRPF por rentas obtenidas en Melilla (pendiente de confirmar con el asesor si te corresponde)
        </label>
      </div>

      <div className="rounded-2xl bg-cx-hielo/60 border border-cx-borde px-4 py-2">
        <Fila k="Margen de Coxiro por venta" v={eur(margenPorVenta)} />
        <Fila k="Comisión de Stripe por venta (estim.)" v={`− ${eur(stripePorVenta)}`} />
        <Fila k="Queda por venta" v={eur(netoPorVenta)} fuerte />
        <Fila k="Margen al mes" v={eur(margenMes)} />
        <Fila k="Beneficio al mes, antes de IRPF" v={eur(beneficioMes)} fuerte />
        <Fila k="Beneficio al año, antes de IRPF" v={eur(beneficioAnio)} />
        <Fila k="IRPF estimado al año" v={`− ${eur(irpf)}`} />
        <Fila k="Neto al año (aprox.)" v={eur(netoAnio)} fuerte />
        <Fila
          k="Ventas/mes para cubrir gastos y cuota"
          v={equilibrio === null ? "No se cubre" : String(equilibrio)}
          fuerte
        />
      </div>
    </div>
  );
}
