import Banner from "@/components/home/Banner";
import SiteHeader from "@/components/home/SiteHeader";
import Hero from "@/components/home/Hero";
import CintaProfesiones from "@/components/home/CintaProfesiones";
import Calculadora from "@/components/home/Calculadora";
import ComoFunciona from "@/components/home/ComoFunciona";
import FranjaFoto from "@/components/home/FranjaFoto";
import VistasTabs from "@/components/home/VistasTabs";
import FuncionesGrid from "@/components/home/FuncionesGrid";
import FraseGrande from "@/components/home/FraseGrande";
import { Partners, Faq } from "@/components/home/PartnersFaq";
import Cierre from "@/components/home/Cierre";
import { createClient } from "@/lib/supabase/server";

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

      <CintaProfesiones />
      <Calculadora />
      <ComoFunciona />
      <FranjaFoto />

      <VistasTabs />
      <FuncionesGrid />
      <FraseGrande />
      <Partners />
      <Faq />
      <Cierre />
    </main>
  );
}
