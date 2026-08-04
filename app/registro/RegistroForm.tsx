"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { signUp } from "@/app/auth/actions";

export default function RegistroForm({
  searchParams,
}: {
  searchParams: { error?: string; ["check-email"]?: string; ref?: string; role?: string };
}) {
  const [role, setRole] = useState<"provider" | "client">(
    searchParams.role === "client" ? "client" : "provider"
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/">
            <Logo variant="light" />
          </a>
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
            Quiero vender
          </button>
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 rounded-md text-sm font-medium py-2 transition ${
              role === "client" ? "bg-ink text-paper" : "text-stone"
            }`}
          >
            Quiero comprar
          </button>
        </div>

        <form action={signUp} className="flex flex-col gap-3">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="ref" value={searchParams.ref ?? ""} />

          <input
            type="text"
            name="full_name"
            required
            placeholder="Nombre completo"
            className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />

          <input
            type="text"
            name="tax_id"
            required
            autoComplete="off"
            placeholder="NIF / NIE"
            className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />

          {role === "provider" && (
            <>
              <input
                type="text"
                name="business_name"
                placeholder="Nombre de tu negocio (opcional)"
                className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
              />
              <div>
                <label className="text-xs text-stone block mb-1">
                  ¿Qué ofreces?
                </label>
                <select
                  name="category"
                  required
                  className="w-full rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Mentor / Coach">Mentor / Coach</option>
                  <option value="Creador de contenido">Creador de contenido</option>
                  <option value="Cursos online">Cursos online</option>
                  <option value="Inteligencia Artificial">
                    Inteligencia Artificial
                  </option>
                  <option value="Servicios">Servicios</option>
                </select>
                <p className="text-xs text-stone mt-1">
                  De momento solo damos de alta mentorías, cursos y servicios
                  de IA — pronto
                  abriremos más categorías.
                </p>
              </div>
            </>
          )}

          {role === "client" && (
            <div>
              <label className="text-xs text-stone block mb-1">
                Tipo de cliente
              </label>
              <div className="flex rounded-lg border border-stone/25 p-1 bg-white">
                <label className="flex-1 text-center rounded-md text-sm font-medium py-2 bg-ink text-paper cursor-pointer">
                  <input
                    type="radio"
                    name="client_type"
                    value="particular"
                    defaultChecked
                    className="hidden"
                  />
                  Particular
                </label>
                <label className="flex-1 text-center rounded-md text-sm font-medium py-2 text-stone/40 cursor-not-allowed">
                  <input type="radio" disabled className="hidden" />
                  Empresa
                </label>
              </div>
              <p className="text-xs text-stone mt-1">
                Compra como empresa: próximamente.
              </p>
            </div>
          )}

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
              minLength={6}
              placeholder="Contraseña (mínimo 6 caracteres)"
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

          <label className="flex items-start gap-2 text-xs text-stone">
            <input type="checkbox" required className="mt-0.5" />
            <span>
              He leído y acepto los{" "}
              <a href="/legal/terminos" target="_blank" className="text-ink underline">
                Términos y Condiciones
              </a>{" "}
              y la{" "}
              <a href="/legal/privacidad" target="_blank" className="text-ink underline">
                Política de Privacidad
              </a>
              {role === "provider" && (
                <>
                  , y autorizo a Coxiro a emitir facturas en mi nombre
                  (autofacturación)
                </>
              )}
              .
            </span>
          </label>

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
