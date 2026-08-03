"use client";

import { useEffect, useRef } from "react";

// Colores de marca -- reflejan los mismos valores de
// tailwind.config.ts (colors.ink / colors.copper). Se dejan como
// constantes porque el lienzo (canvas) no puede leer clases de
// Tailwind directamente, solo valores de color en JS.
const COPPER = "226,112,58"; // #E2703A en formato "r,g,b"
const PAPER = "247,243,236"; // #F7F3EC en formato "r,g,b"

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export default function NodeBackground({
  containerRef,
  textRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let exclusion = { x: 0, y: 0, halfW: 0, halfH: 0 };
    let rafId: number | null = null;
    let cancelled = false;

    function recalcExclusionZone() {
      if (!textRef.current || !container) return;
      const containerRect = container.getBoundingClientRect();
      const textRect = textRef.current.getBoundingClientRect();
      // Centro y semiancho/semialto del bloque de texto, en
      // coordenadas relativas al propio contenedor del hero -- se
      // recalcula cada vez que cambia el tamaño real, nunca con
      // valores fijos.
      exclusion = {
        x: textRect.left - containerRect.left + textRect.width / 2,
        y: textRect.top - containerRect.top + textRect.height / 2,
        halfW: textRect.width / 2 + 40,
        halfH: textRect.height / 2 + 40,
      };
    }

    function inExclusionZone(x: number, y: number) {
      return (
        Math.abs(x - exclusion.x) < exclusion.halfW &&
        Math.abs(y - exclusion.y) < exclusion.halfH
      );
    }

    function particleCountForWidth(width: number) {
      if (width < 480) return 0; // móviles pequeños: sin animación, por rendimiento
      if (width < 900) return 24;
      return 60;
    }

    function spawnParticle(): Particle {
      let x = 0;
      let y = 0;
      let tries = 0;
      do {
        x = Math.random() * w;
        y = Math.random() * h;
        tries++;
      } while (inExclusionZone(x, y) && tries < 20);
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.6 + 0.6,
      };
    }

    function setup() {
      const rect = container!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      recalcExclusionZone();

      const targetCount = particleCountForWidth(w);
      particles = Array.from({ length: targetCount }, spawnParticle);
    }

    const LINK_DIST = 130;

    function drawStaticFrame() {
      ctx!.clearRect(0, 0, w, h);
      drawLinks();
      drawNodes();
    }

    function drawLinks() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.35;
            ctx!.strokeStyle = `rgba(${COPPER},${alpha})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
    }

    function drawNodes() {
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${COPPER},0.10)`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${PAPER},0.85)`;
        ctx!.fill();
      }
    }

    function draw() {
      if (cancelled) return;
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      drawLinks();
      drawNodes();

      rafId = requestAnimationFrame(draw);
    }

    setup();

    if (particles.length > 0) {
      if (prefersReducedMotion) {
        // Accesibilidad: si el usuario pidió reducir el movimiento,
        // se dibuja un único fotograma fijo, sin animación continua.
        drawStaticFrame();
      } else {
        draw();
      }
    }

    // Recalcula tamaño y zona de exclusión cuando cambie el
    // contenedor del hero (nunca con valores fijos).
    const resizeObserver = new ResizeObserver(() => {
      setup();
      if (particles.length > 0 && (prefersReducedMotion || rafId === null)) {
        drawStaticFrame();
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [containerRef, textRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
