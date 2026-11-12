"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { PROVIDER_NAV, CLIENT_NAV } from "@/components/dashboard/navItems";
import ProviderResumenView, { type VentaFila } from "@/components/dashboard/ProviderResumenView";
import ContenidoView from "@/components/dashboard/ContenidoView";
import ServiceCard from "@/components/dashboard/ServiceCard";
import { BTN_SECONDARY, Icon, PageHeader } from "@/components/dashboard/ui";

const TABS = [
  { id: "panel", label: "Tu panel" },
  { id: "servicios", label: "Tus servicios" },
  { id: "cliente", label: "Tu cliente" },
  { id: "pago", label: "El pago" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Las pantallas de las tres primeras pestañas son los mismos componentes que
// usa el panel real (con datos de ejemplo), para que lo que se enseña aquí
// sea exactamente lo que se ve dentro.
const VENTAS: VentaFila[] = [
  { id: "1", cliente: "Marta Ruiz", servicio: "Mentoría 1:1 · 3 sesiones", importe: 290, estado: "paid", fecha: "2026-11-05T10:00:00Z", facturaHref: "#" },
  { id: "2", cliente: "Daniel Pérez", servicio: "Curso de marca personal", importe: 97, estado: "paid", fecha: "2026-11-03T10:00:00Z", facturaHref: "#" },
  { id: "3", cliente: "Lucía García", servicio: "Consultoría exprés", importe: 180, estado: "pending", fecha: "2026-11-02T10:00:00Z" },
];

const SERVICIOS = [
  { id: "a", title: "Mentoría 1:1 · 3 sesiones", type: "consult", price: 290, is_active: true, is_public: true },
  { id: "b", title: "Consultoría exprés", type: "consult", price: 180, is_active: true, is_public: false },
];

function Marco({
  items,
  activo,
  children,
}: {
  items: typeof PROVIDER_NAV;
  activo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-cx-hielo/40 text-left">
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-cx-noche py-5 px-3 flex-col">
        <div className="px-3 pb-6 font-display font-bold text-white tracking-[0.18em] text-sm">COXIRO</div>
        <DashboardNav items={items} demoActivo={activo} />
      </aside>
      <div className="flex-1 min-w-0 p-5 md:p-8 pt-10 md:pt-10">{children}</div>
    </div>
  );
}

function Panel() {
  return (
    <Marco items={PROVIDER_NAV} activo="Cobros y facturas">
      <ProviderResumenView
        saludo="Hola, Laura"
        verificado
        cobradoMes={4350}
        pendiente={180}
        ventasTotales={23}
        filas={VENTAS}
      />
    </Marco>
  );
}

function Servicios() {
  return (
    <Marco items={PROVIDER_NAV} activo="Mis servicios">
      <PageHeader title="Mis servicios" subtitle="Lo que ofreces a tus clientes, con su precio" />
      <div className="grid gap-4 lg:grid-cols-2">
        {SERVICIOS.map((s) => (
          <ServiceCard
            key={s.id}
            s={s}
            acciones={
              <>
                <span className={BTN_SECONDARY}>
                  <Icon name="folder" className="w-3.5 h-3.5" />
                  Contenido
                </span>
                <span className={BTN_SECONDARY}>
                  <Icon name="pencil" className="w-3.5 h-3.5" />
                  Editar
                </span>
                <span className={BTN_SECONDARY}>
                  <Icon name="link" className="w-3.5 h-3.5" />
                  Compartir
                </span>
              </>
            }
          />
        ))}
      </div>
    </Marco>
  );
}

function Cliente() {
  return (
    <Marco items={CLIENT_NAV} activo="Mi contenido">
      <ContenidoView
        grupos={[
          {
            id: "1",
            titulo: "Mentoría de marca personal",
            profesional: "Laura Martín",
            items: [
              { id: "a", titulo: "Sesión 1 · Posicionamiento", tipo: "video", href: "#", reproducible: true, pos: 1260, dur: 2700 },
              { id: "b", titulo: "Sesión 2 · Tu mensaje", tipo: "video", href: "#", reproducible: true, pos: 0, dur: 0 },
              { id: "c", titulo: "Guía de ejercicios", tipo: "pdf", href: "#", reproducible: false, pos: 0, dur: 0 },
            ],
          },
        ]}
      />
    </Marco>
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
        <div className="mt-5 space-y-3">
          <div className={campo}>Nombre</div>
          <div className={campo}>Email</div>
          <div className={campo}>Tarjeta de crédito o débito</div>
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
  const [tab, setTab] = useState<TabId>("panel");

  function teclas(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    if (e.key === "ArrowRight") setTab(TABS[(i + 1) % TABS.length].id);
    if (e.key === "ArrowLeft") setTab(TABS[(i - 1 + TABS.length) % TABS.length].id);
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
            className="inline-flex flex-wrap justify-center mt-8 rounded-[28px] sm:rounded-full bg-white p-1.5 shadow-sm border border-cx-borde"
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
                className={`rounded-full px-4 md:px-6 py-2.5 text-sm md:text-base font-semibold transition ${
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
            <span className="absolute top-3 right-4 text-[11px] text-cx-texto-2 z-10">Datos de ejemplo</span>
            <div
              key={tab}
              role="tabpanel"
              id={`pnl-${tab}`}
              aria-labelledby={`tab-${tab}`}
              className="animate-tabIn motion-reduce:animate-none"
            >
              {/* Maqueta con datos de ejemplo: sin clics ni foco dentro. */}
              <div inert>
              {tab === "panel" && <Panel />}
              {tab === "servicios" && <Servicios />}
              {tab === "cliente" && <Cliente />}
              {tab === "pago" && <Pago />}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
