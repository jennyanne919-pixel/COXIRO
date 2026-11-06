import Image from "next/image";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";

export default function Cierre() {
  return (
    <section id="acceso" className="bg-cx-celeste py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal variant="up">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-cx-noche">Profesionales fundadores</span>
          <h2 className="font-display font-bold text-5xl md:text-[72px] leading-[1] text-cx-noche mt-4">
            Empieza a vender con Coxiro
          </h2>
          <p className="text-lg md:text-xl text-cx-noche mt-5 max-w-2xl">
            Estamos dando de alta a los primeros profesionales uno a uno. Te ayudamos a subir tu catálogo y a dejar listos tus cobros.
          </p>
        </Reveal>
        <div className="mt-10 grid lg:grid-cols-2 gap-6 items-stretch">
          <Reveal variant="left" className="h-[300px] lg:h-[420px]">
            <div className="relative h-full overflow-hidden rounded-[28px]">
              <Image
                src="/images/cierre-hombre.jpg"
                alt="Profesional trabajando con su portátil"
                fill
                sizes="(min-width:1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal variant="right" className="lg:h-[420px]">
            <div className="rounded-[28px] bg-cx-noche p-7 md:p-9 lg:h-full lg:overflow-auto">
              <WaitlistForm fuente="landing" oscuro />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
