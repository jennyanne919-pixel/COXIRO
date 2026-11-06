"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

// Cada línea pasa de blanco al 14 % a blanco al 100 % según el scroll.
// Sin JS o con movimiento reducido, todo queda al 100 %.
export default function FraseGrande() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setP(clamp((vh * 0.85 - r.top) / (vh * 0.65)));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const op = (i: number) => (p === null ? 1 : 0.14 + 0.86 * clamp((p - i * 0.25) / 0.4));

  return (
    <section ref={ref} className="bg-cx-noche py-24 md:py-36">
      <p className="font-display font-bold text-[40px] sm:text-6xl md:text-7xl xl:text-[80px] leading-[1.02] max-w-[1360px] mx-auto px-6 md:px-8 text-white">
        <span className="block" style={{ opacity: op(0) }}>Tú te dedicas a lo tuyo.</span>
        <span className="block" style={{ opacity: op(1) }}>Del cobro, las facturas y los pagos</span>
        <span className="block" style={{ opacity: op(2) }}>
          se encarga <span className="text-cx-celeste">Coxiro</span>.
        </span>
      </p>
    </section>
  );
}
