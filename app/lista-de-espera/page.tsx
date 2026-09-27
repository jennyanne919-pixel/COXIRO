import Logo from "@/components/Logo";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata = {
  title: "Lista de espera — Coxiro",
  description:
    "Sé de los primeros en unirte a Coxiro y empieza a ganar hasta un 10% más en tus ventas digitales.",
};

export default function ListaDeEsperaPage() {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Logo variant="dark" />
        </div>

        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-copper">
            Acceso anticipado
          </span>
          <h1 className="font-display font-semibold text-3xl mt-3 leading-tight">
            Empieza a ganar hasta un 10% más en tus ventas digitales
          </h1>
          <p className="text-sm text-paper/60 mt-4">
            Apúntate y te avisamos por email en cuanto abramos. Sin
            compromiso, sin spam.
          </p>
        </div>

        <div className="bg-paper rounded-2xl p-6 md:p-8">
          <WaitlistForm fuente="instagram" />
        </div>

        <p className="text-center text-xs text-paper/40 mt-8">
          <a href="/" className="underline hover:text-paper/70 transition">
            Volver a coxiro.com
          </a>
        </p>
      </div>
    </main>
  );
}
