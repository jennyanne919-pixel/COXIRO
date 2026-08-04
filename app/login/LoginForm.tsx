"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { signIn, signInWithGoogle } from "@/app/auth/actions";

export default function LoginForm({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [modo, setModo] = useState<"comprador" | "vendedor" | null>(null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/">
            <Logo variant="light" />
          </a>
        </div>
        <h1 className="text-xl font-medium mb-1">Inicia sesión</h1>
        <p className="text-sm text-stone mb-6">
          {modo === "vendedor"
            ? "Accede para gestionar tu negocio"
            : modo === "comprador"
            ? "Accede a tus compras"
            : "Accede a tu panel de Coxiro"}
        </p>

        {!modo ? (
          <div className="grid gap-3">
            <button
              onClick={() => setModo("comprador")}
              className="text-left rounded-lg border border-stone/20 bg-white p-4 hover:border-copper transition"
            >
              <p className="text-sm font-semibold">Acceder a mis compras</p>
              <p className="text-xs text-stone mt-0.5">Entra como comprador</p>
            </button>
            <button
              onClick={() => setModo("vendedor")}
              className="text-left rounded-lg border border-stone/20 bg-white p-4 hover:border-copper transition"
            >
              <p className="text-sm font-semibold">Gestionar mi negocio</p>
              <p className="text-xs text-stone mt-0.5">Entra como profesional</p>
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setModo(null)}
              className="text-xs text-stone hover:text-ink mb-4"
            >
              ← Volver
            </button>

            {searchParams.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {searchParams.error}
          </p>
        )}

        <form action={signInWithGoogle} className="mb-4">
          <button className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-stone/25 bg-white py-2.5 text-sm font-medium hover:bg-paper transition">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5Z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.4 0-13.8 4.1-17.2 10.2Z" />
              <path fill="#4CAF50" d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.5C29.4 35.8 26.8 36.7 24 36.7c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 40.6 16.2 45 24 45Z" />
              <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5C41.4 36.1 44 30.5 44 24c0-1.4-.1-2.7-.4-3.5Z" />
            </svg>
            Continuar con Google
          </button>
        </form>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-stone/20 flex-1" />
          <span className="text-xs text-stone">o con tu email</span>
          <div className="h-px bg-stone/20 flex-1" />
        </div>

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
          </>
        )}
      </div>
    </main>
  );
}
