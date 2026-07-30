"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
          <a href="/">
            <Logo variant="light" />
          </a>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-10-7-10-7a19.42 19.42 0 0 1 4.06-5.06M9.9 4.24A9.12 9.12 0 0 1 12 5c6 0 10 7 10 7a19.5 19.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <button className="rounded-lg bg-copper text-paper font-semibold text-sm py-2.5 mt-1 hover:bg-copper-dark transition">
              Guardar contraseña
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
