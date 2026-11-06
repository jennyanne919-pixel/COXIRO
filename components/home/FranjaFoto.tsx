"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";

// Parallax suave: la foto se mueve ~10 % más lento que el scroll.
export default function FranjaFoto() {
  const caja = useRef<HTMLElement>(null);
  const foto = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const mover = () => {
      raf = 0;
      const c = caja.current;
      const f = foto.current;
      if (!c || !f) return;
      const r = c.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const desplaz = (window.innerHeight / 2 - (r.top + r.height / 2)) * 0.1;
      f.style.transform = `translate3d(0,${desplaz.toFixed(1)}px,0)`;
    };
    const alScroll = () => {
      if (!raf) raf = requestAnimationFrame(mover);
    };
    mover();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={caja} className="relative w-full h-[460px] md:h-[560px] overflow-hidden bg-cx-noche">
      <div ref={foto} className="absolute left-0 right-0 -top-[12%] h-[124%] will-change-transform">
        <Image
          src="/images/aula-mentoria.jpg"
          alt="Mentora dando una sesión a un grupo de alumnos"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(7,20,43,.92) 0%, rgba(7,20,43,.92) 20%, rgba(7,20,43,0) 60%)" }}
      />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-8 flex items-center">
        <Reveal variant="left" className="max-w-xl">
          <h2 className="font-display font-bold text-[38px] md:text-[64px] leading-[1.02] text-white">
            Tú das la clase. Del resto se encarga Coxiro.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-[#C9D6EA]">
            Tus alumnos pagan y entran a su contenido sin crear cuenta. Tú te centras en enseñar.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
