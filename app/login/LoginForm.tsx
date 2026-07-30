"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { signIn } from "@/app/auth/actions";

export default function LoginForm({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/">
            <Logo variant="light" />
          </a>
        </div>
        <h1 className="text-xl font-medium mb-1">Inicia sesión</h1>
        <p className="text-sm text-stone mb-6">Accede a tu panel de Coxiro</p>

        {searchParams.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {searchParams.error}
          </p>
        )}

        <form action={signIn} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={searchParams.next ?? ""} />
          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Contraseña"
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
