"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variante = "left" | "right" | "up" | "scale";

const DESDE: Record<Variante, string> = {
  left: "translate3d(-90px,0,0)",
  right: "translate3d(90px,0,0)",
  up: "translate3d(0,70px,0)",
  scale: "scale(.85)",
};

// Entrada al hacer scroll. El contenido es visible por defecto (SSR, sin JS,
// movimiento reducido); solo se oculta tras montar, si aún está fuera de pantalla.
export default function Reveal({
  variant = "up",
  delay = 0,
  className = "",
  children,
}: {
  variant?: Variante;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<"visible" | "oculto" | "entrando">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setEstado("oculto");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEstado("entrando");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties =
    estado === "oculto"
      ? { opacity: 0, transform: DESDE[variant] }
      : estado === "entrando"
      ? {
          opacity: 1,
          transform: "none",
          transition: `opacity .8s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        }
      : {};

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
