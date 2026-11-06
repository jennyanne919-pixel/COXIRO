"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PALABRAS = ["cursos", "mentorías", "consultorías", "servicios IA"];

// Palabra que rota cada 2 s con deslizamiento vertical. Con
// prefers-reduced-motion queda fija en "servicios".
function PalabraQueRota() {
  const [i, setI] = useState(0);
  const [quieta, setQuieta] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setQuieta(mq.matches);
    const alCambiar = () => setQuieta(mq.matches);
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  useEffect(() => {
    if (quieta) return;
    const t = setInterval(() => setI((v) => (v + 1) % PALABRAS.length), 2000);
    return () => clearInterval(t);
  }, [quieta]);

  if (quieta) return <span className="text-cx-celeste">servicios</span>;

  const anterior = (i + PALABRAS.length - 1) % PALABRAS.length;
  return (
    <span
      className="relative inline-grid overflow-hidden align-bottom py-[0.12em] -my-[0.12em] text-cx-celeste"
      aria-hidden="true"
    >
      {PALABRAS.map((p, k) => (
        <span
          key={p}
          className="[grid-area:1/1] transition-all duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
          style={{
            transform: k === i ? "translateY(0)" : k === anterior ? "translateY(-100%)" : "translateY(100%)",
            opacity: k === i ? 1 : 0,
          }}
        >
          {p}
        </span>
      ))}
    </span>
  );
}

function limpiarEnlace(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Hero() {
  const [enlace, setEnlace] = useState("");

  function reservar(e: React.FormEvent) {
    e.preventDefault();
    const slug = limpiarEnlace(enlace);
    try {
      if (slug) localStorage.setItem("coxiro_slug", slug);
    } catch {
      // sin almacenamiento: el nombre viaja igualmente en la URL
    }
    window.location.href = slug
      ? `/registro?role=provider&slug=${encodeURIComponent(slug)}`
      : "/registro?role=provider";
  }

  return (
    <section className="relative overflow-hidden bg-cx-noche text-white">
      {/* Foto de fondo: arriba en móvil, a pantalla completa en escritorio */}
      <div className="relative h-[420px] md:absolute md:inset-0 md:h-auto">
        <Image
          src="/images/hero-mujer.jpg"
          alt="Profesional consultando sus ventas en el portátil"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] md:object-right"
        />
        <div className="absolute inset-0 md:hidden bg-gradient-to-b from-transparent via-transparent to-cx-noche" />
        <div
          className="absolute inset-0 hidden md:block"
          style={{ background: "linear-gradient(90deg, #07142B 0%, rgba(7,20,43,0) 55%)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-14 md:py-24 lg:py-28 md:min-h-[720px] flex items-center">
        <div className="max-w-[620px]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cx-celeste">
            Para profesionales que venden online en España
          </p>
          <h1 className="font-display font-bold text-[48px] md:text-[68px] lg:text-[92px] leading-[0.98] mt-5">
            <span className="sr-only">Vende tus cursos, mentorías, consultorías o servicios IA online</span>
            <span aria-hidden="true">
              Vende tus <PalabraQueRota /> online
            </span>
          </h1>
          <p className="text-2xl md:text-[30px] leading-snug text-[#C9D6EA] mt-6 max-w-[580px]">
            y gana hasta un 10% más desde tu primera venta a tus clientes particulares en España.
          </p>
          <p className="text-base md:text-xl leading-snug text-[#A9B8D0] mt-4 max-w-[560px]">
            Sin cuota mensual y con toda la infraestructura tecnológica incluida: pasarela de pago y facturación.
          </p>

          <p className="mt-8 mb-2 pl-1 text-sm font-semibold uppercase tracking-[0.14em] text-cx-celeste">
            Tu tienda en un solo enlace
          </p>

          <form
            onSubmit={reservar}
            className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-3xl sm:rounded-full bg-white p-2 sm:p-1.5 max-w-[540px] shadow-xl"
          >
            <label htmlFor="hero-enlace" className="sr-only">
              Tu enlace personal en Coxiro
            </label>
            <div className="flex items-center flex-1 min-w-0 pl-4 sm:pl-5">
              <span className="text-[15px] text-cx-texto-2 whitespace-nowrap">coxiro.es/</span>
              <input
                id="hero-enlace"
                type="text"
                value={enlace}
                onChange={(e) => setEnlace(e.target.value)}
                placeholder="tunombre"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent px-1 py-3 text-[15px] text-cx-texto outline-none placeholder:text-cx-texto-2/60"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-cx-noche px-6 py-3 text-sm font-semibold text-white whitespace-nowrap hover:-translate-y-0.5 transition"
            >
              Crear mi enlace
            </button>
          </form>

          <p className="text-sm text-cx-texto-osc-2 mt-3 max-w-[540px]">
            Ponlo en tu bio de Instagram o compártelo por WhatsApp. Tus clientes ven lo que vendes y compran ahí mismo, sin crear cuenta.
          </p>
          <p className="text-sm text-cx-texto-osc-2 mt-4">
            ¿Buscas comprar?{" "}
            <a href="/catalogo" className="text-white underline underline-offset-2 hover:text-cx-celeste">
              Explora el catálogo
            </a>
          </p>
        </div>
      </div>

      {/* Tarjetas flotantes (solo escritorio) */}
      <div className="hidden xl:block pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        <div className="absolute right-[4%] top-[14%] w-[270px] rounded-2xl bg-white p-4 text-cx-texto shadow-2xl animate-float motion-reduce:animate-none">
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-prof">Nueva venta</p>
          <p className="text-sm font-semibold mt-1">Mentoría 1:1 · 3 sesiones</p>
          <p className="font-display font-bold text-3xl mt-1">290,00 €</p>
          <p className="text-xs text-cx-texto-2 mt-1">Pago único con tarjeta</p>
        </div>
        <div className="absolute right-[20%] bottom-[9%] w-[290px] rounded-2xl bg-[#13254A] p-4 text-white shadow-2xl animate-floatSlow motion-reduce:animate-none">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-cx-celeste text-cx-noche">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14l3-2 2 2 2-2 3 2V8z" />
                <path d="M14 3v5h5M9 12h6M9 15h4" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold">Factura emitida</p>
              <p className="text-xs text-cx-texto-osc-2 mt-0.5">Enviada a tu cliente y registrada con VeriFactu</p>
            </div>
          </div>
        </div>
        <p className="absolute right-6 bottom-4 text-xs text-white/60">Datos de ejemplo</p>
      </div>
    </section>
  );
}
