"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { signUp } from "@/app/auth/actions";

export default function RegistroPage({
  searchParams,
}: {
  searchParams: { error?: string; ["check-email"]?: string };
}) {
  const [role, setRole] = useState<"provider" | "client">("provider");

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Logo />
        </div>
        <h1 className="text-xl font-medium mb-1">Crea tu cuenta</h1>
        <p className="text-sm text-stone mb-6">Empieza a vender tu talento online</p>

        {searchParams.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {searchParams.error}
          </p>
        )}
        {searchParams["check-email"] && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4">
            Revisa tu email para confirmar la cuenta.
          </p>
        )}

        <div className="flex rounded-lg border border-stone/25 p-1 mb-4 bg-white">
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`flex-1 rounded-md text-sm font-medium py-2 transition ${
              role === "provider" ? "bg-ink text-paper" : "text-stone"
            }`}
          >
            Soy profesional
          </button>
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 rounded-md text-sm font-medium py-2 transition ${
              role === "client" ? "bg-ink text-paper" : "text-stone"
            }`}
          >
            Soy cliente
          </button>
        </div>

        <form action={signUp} className="flex flex-col gap-3">
          <input type="hidden" name="role" value={role} />

          <input
            type="text"
            name="full_name"
            required
            placeholder="Nombre completo"
            className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />

          {role === "provider" && (
            <input
              type="text"
              name="business_name"
              placeholder="Nombre de tu negocio (opcional)"
              className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
            />
          )}

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
            minLength={6}
            placeholder="Contraseña (mínimo 6 caracteres)"
            className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />
          <button className="rounded-lg bg-copper text-paper font-semibold text-sm py-2.5 mt-1 hover:bg-copper-dark transition">
            Crear cuenta
          </button>
        </form>

        <p className="text-sm text-stone mt-5">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-ink font-medium underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  );
}
