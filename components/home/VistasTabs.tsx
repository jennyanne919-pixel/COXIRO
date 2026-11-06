"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

const TABS = [
  { id: "panel", label: "Tu panel" },
  { id: "pago", label: "Pantalla de pago" },
] as const;

const VENTAS = [
  { n: "Mentoría 1:1 · 3 sesiones", q: "Marta R.", v: "290 €" },
  { n: "Curso de marca personal", q: "Daniel P.", v: "97 €" },
  { n: "Consultoría exprés", q: "Lucía G.", v: "180 €" },
];

function Panel() {
  return (
    <div className="p-5 md:p-8">
      <p className="font-display font-bold text-2xl text-cx-noche">Hola, Laura</p>
      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-cx-noche text-white p-5">
          <div className="text-xs text-cx-texto-osc-2">Ventas este mes</div>
          <div className="font-display font-bold text-3xl mt-1 text-cx-celeste">4.350 €</div>
        </div>
        <div className="rounded-2xl border border-cx-borde p-5">
          <div className="text-xs text-cx-texto-2">Clientes</div>
          <div className="font-display font-bold text-3xl mt-1 text-cx-noche">23</div>
        </div>
        <div className="rounded-2xl border border-cx-borde p-5">
          <div className="text-xs text-cx-texto-2">Próxima transferencia</div>
          <div className="font-display font-bold text-3xl mt-1 text-cx-noche">1.280 €</div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-cx-borde divide-y divide-cx-borde">
        {VENTAS.map((x) => (
          <div key={x.n} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <div className="font-medium text-cx-noche truncate">{x.n}</div>
              <div className="text-xs text-cx-texto-2">{x.q}</div>
            </div>
            <div className="font-semibold text-cx-prof">{x.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pago() {
  const campo = "rounded-xl border border-cx-borde px-4 py-3 text-cx-texto-2 text-sm bg-white";
  return (
    <div className="p-5 md:p-8 flex justify-center">
      <div className="w-full max-w-md rounded-[28px] border border-cx-borde bg-white p-6 md:p-7 shadow-[0_20px_50px_-25px_rgba(8,35,70,.3)]">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-cx-hielo text-cx-prof font-display font-bold flex items-center justify-center" aria-hidden="true">LM</span>
          <div>
            <div className="font-semibold text-cx-noche leading-tight">Laura Martín</div>
            <div className="text-xs text-cx-texto-2">Mentoría de marca personal</div>
          </div>
        </div>
        <div className="mt-5 font-display font-bold text-4xl text-cx-prof">290 €</div>
        <div className="text-sm text-cx-texto-2">o 3 plazos de 96,67 €</div>
        <div className="mt-5 space-y-3">
          <div className={campo}>Nombre</div>
          <div className={campo}>Email</div>
          <div className={campo}>Tarjeta o cuenta bancaria (SEPA)</div>
        </div>
        <div className="mt-5 rounded-full bg-cx-noche text-white font-semibold text-center py-3.5">Pagar 290 €</div>
        <p className="text-xs text-cx-texto-2 text-center mt-4">
          Sin crear cuenta · Pago seguro con Stripe · Factura en tu email
        </p>
      </div>
    </div>
  );
}

export default function VistasTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("panel");

  function teclas(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      setTab((t) => (t === "panel" ? "pago" : "panel"));
    }
  }

  return (
    <section id="vistas" className="bg-cx-hielo py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <Reveal variant="up" className="text-center">
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] text-cx-noche">
            Así lo ves tú. Así lo ve tu cliente.
          </h2>
          <div
            role="tablist"
            aria-label="Vistas de Coxiro"
            onKeyDown={teclas}
            className="inline-flex mt-8 rounded-full bg-white p-1.5 shadow-sm border border-cx-borde"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`pnl-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-5 md:px-7 py-2.5 text-sm md:text-base font-semibold transition ${
                  tab === t.id ? "bg-cx-noche text-white" : "text-cx-texto-2 hover:text-cx-noche"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal variant="scale" delay={100}>
          <div className="mt-10 rounded-[28px] bg-white border border-cx-borde shadow-[0_30px_70px_-30px_rgba(8,35,70,.35)] overflow-hidden relative">
            <span className="absolute top-3 right-4 text-[11px] text-cx-texto-2">Datos de ejemplo</span>
            <div
              key={tab}
              role="tabpanel"
              id={`pnl-${tab}`}
              aria-labelledby={`tab-${tab}`}
              className="pt-4 animate-tabIn motion-reduce:animate-none"
            >
              {tab === "panel" ? <Panel /> : <Pago />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
