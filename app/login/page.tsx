import Logo from "@/components/Logo";
import { signIn } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Logo />
        </div>
        <h1 className="text-xl font-medium mb-1">Inicia sesión</h1>
        <p className="text-sm text-stone mb-6">Accede a tu panel de Coxiro</p>

        {sp.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {sp.error}
          </p>
        )}

        <form action={signIn} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={sp.next ?? ""} />
          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Contraseña"
            className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />
          <button className="rounded-lg bg-copper text-paper font-semibold text-sm py-2.5 mt-1 hover:bg-copper-dark transition">
            Entrar
          </button>
        </form>

        <p className="text-sm text-stone mt-3">
          <a href="/recuperar-contrasena" className="text-ink underline">
            ¿Olvidaste tu contraseña?
          </a>
        </p>

        <p className="text-sm text-stone mt-5">
          ¿Todavía no tienes cuenta?{" "}
          <a href="/registro" className="text-ink font-medium underline">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}
