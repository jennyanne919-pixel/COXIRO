"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";

type Enlace = { titulo: string; texto: string; href: string };
type Columna = { titulo: string; items: Enlace[] };
type Promo = { etiqueta: string; titulo: string; texto: string; cta: string; href: string };
type Menu = { clave: string; etiqueta: string; columnas: Columna[]; promo: Promo };

const MENUS: Menu[] = [
  {
    clave: "productos",
    etiqueta: "Productos digitales",
    columnas: [
      {
        titulo: "Formación",
        items: [
          { titulo: "Cursos online", texto: "Vídeo, lecciones y progreso del alumno", href: "/herramientas/publica-tu-contenido" },
          { titulo: "Membresías", texto: "Cuota mensual con cobro automático", href: "/herramientas/suscripciones" },
        ],
      },
      {
        titulo: "Servicios",
        items: [
          { titulo: "Mentorías", texto: "Sesiones 1:1 o en grupo, con pago previo", href: "/herramientas/publica-tu-contenido" },
          { titulo: "Consultoría", texto: "Trabajos a medida con enlace privado", href: "/herramientas/publica-tu-contenido" },
        ],
      },
      {
        titulo: "Nuevos formatos",
        items: [
          { titulo: "Servicios de IA", texto: "Automatizaciones, agentes y trabajos con IA", href: "/catalogo" },
          { titulo: "Comprar un servicio", texto: "Explora el catálogo de profesionales", href: "/catalogo" },
        ],
      },
    ],
    promo: {
      etiqueta: "PLAZAS LIMITADAS",
      titulo: "Profesionales fundadores",
      texto: "Te damos de alta uno a uno y te ayudamos a subir tu catálogo.",
      cta: "Quiero acceso",
      href: "/#acceso",
    },
  },
  {
    clave: "herramientas",
    etiqueta: "Herramientas",
    columnas: [
      {
        titulo: "Cobros",
        items: [
          { titulo: "Tarjeta y SEPA", texto: "Pago único, a plazos o suscripción", href: "/herramientas/pasarela-de-pagos" },
          { titulo: "Enlaces privados de pago", texto: "Cobra sin publicar nada", href: "/herramientas/publica-tu-contenido" },
        ],
      },
      {
        titulo: "Facturación",
        items: [
          { titulo: "Facturas automáticas", texto: "Para tu cliente y para ti, en cada cobro", href: "/herramientas/pasarela-de-pagos" },
          { titulo: "VeriFactu incluido", texto: "Cumples desde el primer día", href: "/herramientas/pasarela-de-pagos" },
        ],
      },
      {
        titulo: "Tu negocio",
        items: [
          { titulo: "Área privada de contenido", texto: "Tus clientes entran desde su espacio", href: "/herramientas/publica-tu-contenido" },
          { titulo: "Panel de ventas", texto: "Cuánto vendes y quién te compra", href: "/herramientas/dashboard" },
          { titulo: "Emails automáticos", texto: "Confirmaciones y avisos sin hacerlos a mano", href: "/herramientas/dashboard" },
        ],
      },
    ],
    promo: {
      etiqueta: "PON TUS NÚMEROS",
      titulo: "¿Cuánto ganas de más?",
      texto: "Mueve el deslizador con tus ventas de un mes y lo ves al momento.",
      cta: "Calcularlo",
      href: "/#calc",
    },
  },
  {
    clave: "recursos",
    etiqueta: "Recursos",
    columnas: [
      {
        titulo: "Aprende",
        items: [
          { titulo: "Cómo funciona", texto: "De tu conocimiento a tu cuenta en tres pasos", href: "/#como" },
          { titulo: "Preguntas frecuentes", texto: "Resolvemos tus dudas", href: "/ayuda" },
        ],
      },
      {
        titulo: "Para quién",
        items: [
          { titulo: "Profesionales online", texto: "Mentores, formadores, creadores y consultores", href: "/#para-quien" },
          { titulo: "Calculadora de beneficio", texto: "Pon tus números", href: "/#calc" },
        ],
      },
      {
        titulo: "Contacto",
        items: [
          { titulo: "Escríbenos", texto: "coxiro.info@gmail.com", href: "mailto:coxiro.info@gmail.com" },
        ],
      },
    ],
    promo: {
      etiqueta: "PROGRAMA DE PARTNERS",
      titulo: "Gana un 1% recomendando",
      texto: "Cada mes, de lo que facture cada profesional que traigas.",
      cta: "Ver programa",
      href: "/herramientas/partners",
    },
  },
];

function Flecha({ girada }: { girada: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
      className={`transition-transform duration-200 ${girada ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function SiteHeader({ nombreUsuario }: { nombreUsuario: string | null }) {
  const [abierto, setAbierto] = useState<string | null>(null); // menú de escritorio
  const [movil, setMovil] = useState(false); // panel móvil
  const [acordeon, setAcordeon] = useState<string | null>(null);
  const envoltorio = useRef<HTMLDivElement>(null);

  // Cierra con Escape y al hacer clic fuera.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierto(null);
        setMovil(false);
      }
    }
    function onPress(e: MouseEvent | TouchEvent) {
      if (envoltorio.current && !envoltorio.current.contains(e.target as Node)) {
        setAbierto(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPress);
    document.addEventListener("touchstart", onPress);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPress);
      document.removeEventListener("touchstart", onPress);
    };
  }, []);

  // Bloquea el scroll de la página con el panel móvil abierto.
  useEffect(() => {
    document.body.style.overflow = movil ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [movil]);

  const menuAbierto = MENUS.find((m) => m.clave === abierto) ?? null;

  const botonPrincipal = nombreUsuario ? (
    <a
      href="/dashboard"
      className="rounded-full bg-cx-celeste px-5 py-2.5 text-sm font-semibold text-cx-noche hover:brightness-105 hover:-translate-y-0.5 transition whitespace-nowrap"
    >
      Hola, {nombreUsuario} · Mi panel
    </a>
  ) : (
    <a
      href="/registro?role=provider"
      className="rounded-full bg-cx-celeste px-5 py-2.5 text-sm font-semibold text-cx-noche hover:brightness-105 hover:-translate-y-0.5 transition whitespace-nowrap"
    >
      Empieza a vender
    </a>
  );

  return (
    <div
      ref={envoltorio}
      className="sticky top-0 z-50 bg-cx-noche border-b border-white/10"
      onMouseLeave={() => setAbierto(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAbierto(null);
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-5 px-6 lg:px-8 py-2">
        <a href="/" className="flex-shrink-0" aria-label="Coxiro, inicio">
          <span className="hidden lg:block">
            <Logo variant="dark" size={30} />
          </span>
          <span className="lg:hidden">
            <Logo variant="dark" size={24} />
          </span>
        </a>

        {/* Escritorio */}
        <nav className="hidden lg:flex items-center gap-5 text-[15px] font-medium text-white" aria-label="Principal">
          {MENUS.map((m) => (
            <div key={m.clave} onMouseEnter={() => setAbierto(m.clave)}>
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={abierto === m.clave}
                aria-controls={`panel-${m.clave}`}
                onFocus={() => setAbierto(m.clave)}
                onClick={() => setAbierto(abierto === m.clave ? null : m.clave)}
                className="flex items-center gap-1.5 py-3 whitespace-nowrap hover:text-cx-celeste transition"
              >
                {m.etiqueta}
                <Flecha girada={abierto === m.clave} />
              </button>
            </div>
          ))}
          <a href="/herramientas/partners" className="py-3 hover:text-cx-celeste transition whitespace-nowrap">
            Partners
          </a>
          <a href="/ayuda" className="py-3 hover:text-cx-celeste transition whitespace-nowrap">
            Ayuda
          </a>
        </nav>

        <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
          {!nombreUsuario && (
            <a href="/login" className="text-[15px] font-medium text-white hover:text-cx-celeste transition">
              Entrar
            </a>
          )}
          {botonPrincipal}
        </div>

        {/* Móvil */}
        <div className="lg:hidden flex items-center gap-3">
          {nombreUsuario ? (
            <a
              href="/dashboard"
              className="rounded-full bg-cx-celeste px-4 py-2 text-sm font-semibold text-cx-noche whitespace-nowrap"
            >
              Mi panel
            </a>
          ) : (
            <a
              href="/registro?role=provider"
              className="rounded-full bg-cx-celeste px-4 py-2 text-sm font-semibold text-cx-noche whitespace-nowrap"
            >
              Empieza a vender
            </a>
          )}
          <button
            type="button"
            onClick={() => setMovil(true)}
            aria-label="Abrir menú"
            aria-expanded={movil}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel desplegable de escritorio */}
      {menuAbierto && (
        <div className="hidden lg:block absolute left-0 right-0 top-full pt-3">
          <div className="max-w-6xl mx-auto px-6">
            <div
              id={`panel-${menuAbierto.clave}`}
              className="animate-panelIn grid grid-cols-[1fr_1fr_1fr_300px] gap-6 rounded-3xl border border-[#24406F] bg-[#0B1A36] p-6 shadow-2xl"
            >
              {menuAbierto.columnas.map((c) => (
                <div key={c.titulo}>
                  <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-cx-texto-osc-2">
                    {c.titulo}
                  </p>
                  <ul className="grid gap-1">
                    {c.items.map((it) => (
                      <li key={it.titulo}>
                        <a
                          href={it.href}
                          onClick={() => setAbierto(null)}
                          className="block rounded-xl px-3 py-2.5 hover:bg-[#13254A] focus-visible:bg-[#13254A] outline-none transition"
                        >
                          <span className="block text-[15px] font-semibold text-white">{it.titulo}</span>
                          <span className="block text-[13px] text-cx-texto-osc-2">{it.texto}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex flex-col rounded-2xl bg-cx-celeste p-5 text-cx-noche">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]">{menuAbierto.promo.etiqueta}</p>
                <p className="font-display font-bold text-2xl leading-tight mt-2">{menuAbierto.promo.titulo}</p>
                <p className="text-sm mt-2">{menuAbierto.promo.texto}</p>
                <a
                  href={menuAbierto.promo.href}
                  onClick={() => setAbierto(null)}
                  className="mt-auto self-start rounded-full bg-cx-noche px-5 py-2.5 text-sm font-semibold text-white hover:-translate-y-0.5 transition"
                >
                  {menuAbierto.promo.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel móvil a pantalla completa */}
      {movil && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-cx-noche overflow-y-auto" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="flex items-center justify-between px-6 py-2 border-b border-white/10">
            <Logo variant="dark" size={24} />
            <button
              type="button"
              onClick={() => setMovil(false)}
              aria-label="Cerrar menú"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {MENUS.map((m) => (
              <div key={m.clave} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setAcordeon(acordeon === m.clave ? null : m.clave)}
                  aria-expanded={acordeon === m.clave}
                  className="w-full flex items-center justify-between py-4 text-lg font-semibold text-white"
                >
                  {m.etiqueta}
                  <Flecha girada={acordeon === m.clave} />
                </button>
                {acordeon === m.clave && (
                  <div className="pb-4 grid gap-4">
                    {m.columnas.map((c) => (
                      <div key={c.titulo}>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cx-texto-osc-2 mb-1">{c.titulo}</p>
                        {c.items.map((it) => (
                          <a
                            key={it.titulo}
                            href={it.href}
                            onClick={() => setMovil(false)}
                            className="block rounded-xl py-2"
                          >
                            <span className="block text-[15px] font-semibold text-white">{it.titulo}</span>
                            <span className="block text-[13px] text-cx-texto-osc-2">{it.texto}</span>
                          </a>
                        ))}
                      </div>
                    ))}
                    <a
                      href={m.promo.href}
                      onClick={() => setMovil(false)}
                      className="rounded-2xl bg-cx-celeste p-4 text-cx-noche"
                    >
                      <span className="block text-[11px] font-bold uppercase tracking-[0.14em]">{m.promo.etiqueta}</span>
                      <span className="block font-display font-bold text-xl mt-1">{m.promo.titulo}</span>
                      <span className="block text-sm font-semibold mt-1 underline">{m.promo.cta}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
            <a href="/herramientas/partners" onClick={() => setMovil(false)} className="block py-4 text-lg font-semibold text-white border-b border-white/10">
              Partners
            </a>
            <a href="/ayuda" onClick={() => setMovil(false)} className="block py-4 text-lg font-semibold text-white border-b border-white/10">
              Ayuda
            </a>
            <div className="mt-6 grid gap-3">
              {nombreUsuario ? (
                <a href="/dashboard" className="rounded-full bg-cx-celeste px-6 py-3.5 text-center font-semibold text-cx-noche">
                  Hola, {nombreUsuario} · Mi panel
                </a>
              ) : (
                <>
                  <a href="/registro?role=provider" className="rounded-full bg-cx-celeste px-6 py-3.5 text-center font-semibold text-cx-noche">
                    Empieza a vender
                  </a>
                  <a href="/login" className="rounded-full border border-white/25 px-6 py-3.5 text-center font-semibold text-white">
                    Entrar
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
