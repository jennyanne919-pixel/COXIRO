"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      return;
    }

    setOk(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Logo />
        </div>
        <h1 className="text-xl font-medium mb-1">Crea tu contraseña nueva</h1>
        <p className="text-sm text-stone mb-6">
          Esta será la contraseña que uses a partir de ahora
        </p>

        {ok ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Contraseña actualizada. Entrando a tu panel...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <input
              type="password"
              required
              minLength={6}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
            />
            <button className="rounded-lg bg-copper text-paper font-semibold text-sm py-2.5 mt-1 hover:bg-copper-dark transition">
              Guardar contraseña
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
