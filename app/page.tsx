import WaitlistForm from "@/components/WaitlistForm";
import Banner from "@/components/home/Banner";
import SiteHeader from "@/components/home/SiteHeader";
import Hero from "@/components/home/Hero";
import { createClient } from "@/lib/supabase/server";

const AUDIENCE = [
  "Creadores de contenido",
  "Mentores",
  "Formadores",
  "Diseñadores",
  "Servicios de IA",
  "Consultoría",
  "Otros servicios online",
];

const STEPS = [
  { n: "01", title: "Sube tu servicio", body: "Contenido online, mentoría o consultoría, servicios a medida, servicios de inteligencia artificial. Fija tu precio y tú decides cómo lo entregas: directamente al catálogo público de Coxiro o mediante un enlace privado de pago para tu cliente." },
  { n: "02", title: "Tu cliente paga", body: "Procesamos el cobro y emitimos la factura, tanto a tu cliente como a ti." },
  { n: "03", title: "Tú cobras, sin gestión", body: "Recibes tu pago automáticamente. Sin hojas de cálculo, sin perseguir facturas." },
];

const FEATURES = [
  { title: "Pagos y cobros", body: "Pasarela de pago integrada para cobrar a tus clientes de forma segura.", soon: false },
  { title: "Facturación automática", body: "Factura al proveedor y al cliente final en cada cobro, sin intervención manual.", soon: false },
  { title: "Área privada de contenido y servicios", body: "Sube tus materiales y tus clientes acceden desde su propio espacio.", soon: false },
  { title: "Gestiona tu negocio", body: "Cuánto vendes, quién te compra, qué funciona.", soon: false },
  { title: "Automatizaciones", body: "Recordatorios, flujos y emails que hoy haces a mano.", soon: true },
  { title: "Inteligencia Artificial", body: "Haz crecer tu alcance y apóyate en la inteligencia artificial para crear y vender mejor.", soon: true },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nombreUsuario: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single();
    nombreUsuario = profile?.full_name?.split(" ")[0] ?? "Mi panel";
  }

  return (
    <main>
      <Banner />
      <SiteHeader nombreUsuario={nombreUsuario} />
      <Hero />

      <section id="para-quien" className="py-24 max-w-5xl mx-auto px-8">
        <div className="max-w-lg mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-cx-prof">
            Para quién es Coxiro
          </span>
          <h2 className="font-display font-semibold text-3xl mt-3">
            Cualquier profesional que pueda prestar sus servicios,
            infoproductos o contenido online
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {AUDIENCE.map((a) => (
            <span key={a} className="rounded-full border border-cx-borde bg-white px-4.5 py-2.5 text-sm font-medium">
              {a}
            </span>
          ))}
        </div>
        <p className="text-sm text-cx-texto-2 mt-6">
          Si crees que puedes vender tus servicios online, consúltanos en{" "}
          <a href="mailto:coxiro.info@gmail.com" className="text-cx-prof underline">
            coxiro.info@gmail.com
          </a>
        </p>
      </section>

      <section id="como-funciona" className="py-24 bg-white border-y border-cx-borde">
        <div className="max-w-5xl mx-auto px-8">
          <div className="max-w-lg mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-cx-prof">
              Cómo funciona
            </span>
            <h2 className="font-display font-semibold text-3xl mt-3">
              De tus servicios, infoproductos o contenidos online
              directamente a tu cartera, en tres pasos
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-cx-borde border border-cx-borde rounded-2xl overflow-hidden">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white p-8">
                <div className="font-display text-sm font-semibold text-cx-prof mb-4">{s.n}</div>
                <h3 className="text-lg font-medium mb-2">{s.title}</h3>
                <p className="text-sm text-cx-texto-2">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="incluye" className="py-24 max-w-5xl mx-auto px-8">
        <div className="max-w-lg mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-cx-prof">
            Qué incluye desde el día uno
          </span>
          <h2 className="font-display font-semibold text-3xl mt-3">
            Lo esencial para empezar a cobrar esta semana
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-cx-borde bg-white p-7">
              <div className="w-10 h-10 rounded-lg bg-cx-noche mb-5" />
              <h3 className="text-lg font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-cx-texto-2">{f.body}</p>
              {f.soon && (
                <span className="inline-block mt-3.5 text-[11px] font-semibold uppercase tracking-wide text-cx-texto-2 border border-cx-borde rounded-full px-2.5 py-1">
                  Próximamente
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cx-noche text-white py-24 text-center">
        <p className="font-display text-2xl md:text-3xl font-medium max-w-2xl mx-auto leading-snug px-8">
          No somos un curso más, ni una simple pasarela de pago. Somos{" "}
          <span className="text-cx-celeste">la infraestructura inteligente</span> que hay
          detrás de tu negocio.
        </p>
      </section>

      <section id="acceso" className="py-24 max-w-5xl mx-auto px-8">
        <div className="rounded-2xl border border-cx-borde bg-white p-10 md:p-14 flex flex-wrap items-center justify-between gap-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cx-prof">
              Acceso anticipado
            </span>
            <h2 className="font-display font-semibold text-2xl mt-3 max-w-sm">
              Empieza a ganar hasta un 10% más en tus ventas digitales
            </h2>
          </div>
          <WaitlistForm fuente="landing" />
        </div>
      </section>

    </main>
  );
}
