"use client";

import { useState } from "react";
import { CONDICIONES_RUTA } from "@/lib/condiciones";
import Logo from "@/components/Logo";
import SubmitButton from "@/components/SubmitButton";
import { signUp } from "@/app/auth/actions";
import PasswordRequisitos from "@/components/PasswordRequisitos";
import { passwordValida, PASSWORD_MIN } from "@/lib/password";

export default function RegistroForm({
  searchParams,
}: {
  searchParams: { error?: string; ["check-email"]?: string; ref?: string; role?: string; slug?: string };
}) {
  const [role, setRole] = useState<"provider" | "client">(
    searchParams.role === "client" ? "client" : "provider"
  );
  const [tipo, setTipo] = useState<"autonomo" | "sociedad">("autonomo");
  const sociedad = role === "provider" && tipo === "sociedad";
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center bg-cx-hielo px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/">
            <Logo variant="light" />
          </a>
        </div>
        <h1 className="text-xl font-medium mb-1">Crea tu cuenta</h1>
        <p className="text-sm text-cx-texto-2 mb-6">Empieza a vender tu talento online</p>

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

        <div className="flex rounded-lg border border-cx-borde p-1 mb-4 bg-white">
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`flex-1 rounded-md text-sm font-medium py-2 transition ${
              role === "provider" ? "bg-cx-noche text-white" : "text-cx-texto-2"
            }`}
          >
            Quiero vender
          </button>
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 rounded-md text-sm font-medium py-2 transition ${
              role === "client" ? "bg-cx-noche text-white" : "text-cx-texto-2"
            }`}
          >
            Quiero comprar
          </button>
        </div>

        {role === "provider" && (
          <div className="mb-4">
            <p className="text-xs text-cx-texto-2 mb-1">¿Cómo vas a facturar?</p>
            <div className="flex rounded-lg border border-cx-borde p-1 bg-white">
              <button
                type="button"
                onClick={() => setTipo("autonomo")}
                className={`flex-1 rounded-md text-sm font-medium py-2 transition ${
                  tipo === "autonomo" ? "bg-cx-noche text-white" : "text-cx-texto-2"
                }`}
              >
                Autónomo
              </button>
              <button
                type="button"
                onClick={() => setTipo("sociedad")}
                className={`flex-1 rounded-md text-sm font-medium py-2 transition ${
                  tipo === "sociedad" ? "bg-cx-noche text-white" : "text-cx-texto-2"
                }`}
              >
                Sociedad (SL, SA…)
              </button>
            </div>
          </div>
        )}

        <form action={signUp} className="flex flex-col gap-3">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="legal_type" value={sociedad ? "sociedad" : "autonomo"} />
          <input type="hidden" name="ref" value={searchParams.ref ?? ""} />

          {sociedad && (
            <input
              type="text"
              name="legal_name"
              required
              placeholder="Razón social (ej. Mi Empresa, S.L.)"
              className="rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
            />
          )}

          <input
            type="text"
            name="full_name"
            required
            placeholder={sociedad ? "Nombre del administrador o representante" : "Nombre completo"}
            className="rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
          />

          <input
            type="text"
            name="tax_id"
            required
            autoComplete="off"
            placeholder={sociedad ? "CIF de la sociedad" : "NIF / NIE"}
            className="rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
          />

          {role === "provider" && (
            <>
              <input
                type="text"
                name="business_name"
                defaultValue={searchParams.slug ?? ""}
                placeholder={sociedad ? "Nombre comercial (opcional)" : "Nombre de tu negocio (opcional)"}
                className="rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
              />
              <div>
                <label className="text-xs text-cx-texto-2 block mb-1">
                  ¿Qué ofreces?
                </label>
                <select
                  name="category"
                  required
                  className="w-full rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
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
              </div>
            </>
          )}

          {role === "client" && (
            <div>
              <label className="text-xs text-cx-texto-2 block mb-1">
                Tipo de cliente
              </label>
              <div className="flex rounded-lg border border-cx-borde p-1 bg-white">
                <label className="flex-1 text-center rounded-md text-sm font-medium py-2 bg-cx-noche text-white cursor-pointer">
                  <input
                    type="radio"
                    name="client_type"
                    value="particular"
                    defaultChecked
                    className="hidden"
                  />
                  Particular
                </label>
                <label className="flex-1 text-center rounded-md text-sm font-medium py-2 text-cx-texto-2/70 cursor-not-allowed">
                  <input type="radio" disabled className="hidden" />
                  Empresa
                </label>
              </div>
              <p className="text-xs text-cx-texto-2 mt-1">
                Compra como empresa: próximamente.
              </p>
            </div>
          )}

          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className="rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={PASSWORD_MIN}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cx-texto-2 hover:text-cx-texto"
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

          <PasswordRequisitos password={password} />

          {role === "provider" && (
            <div className="rounded-lg border border-cx-borde bg-cx-hielo px-4 py-3 text-xs text-cx-texto-2">
              <p className="font-semibold text-cx-texto mb-1">Condiciones económicas</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Recibes el precio base de tu servicio (sin impuestos) más un 10 %.</li>
                <li>Cobras a los 7 días de cada venta.</li>
                <li>Sin cuotas de alta ni mensualidad.</li>
              </ul>
              <a href={CONDICIONES_RUTA} target="_blank" className="text-cx-prof underline mt-1.5 inline-block">
                Ver condiciones completas
              </a>
            </div>
          )}

          <label className="flex items-start gap-2 text-xs text-cx-texto-2">
            <input type="checkbox" required className="mt-0.5" />
            <span>
              He leído y acepto los{" "}
              <a href="/terminos" target="_blank" className="text-cx-texto underline">
                Términos y Condiciones
              </a>
              {role === "provider" && " (incluidas las condiciones económicas del proveedor)"}{" "}
              y la{" "}
              <a href="/aviso-legal" target="_blank" className="text-cx-texto underline">
                Política de Privacidad
              </a>
              {role === "provider" && (
                <>
                  , y autorizo a Coxiro a emitir facturas en {sociedad ? "nombre de la sociedad" : "mi nombre"}
                  (autofacturación){sociedad && ", declarando que tengo poder para vincularla"}
                </>
              )}
              .
            </span>
          </label>

          <SubmitButton
            disabled={!passwordValida(password)}
            pendingText="Creando tu cuenta… un momento"
            className="rounded-lg bg-cx-celeste text-cx-noche font-semibold text-sm py-2.5 mt-1 hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear cuenta
          </SubmitButton>
        </form>

        <p className="text-sm text-cx-texto-2 mt-5">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-cx-texto font-medium underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  );
}
