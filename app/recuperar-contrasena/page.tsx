"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { pedirRecuperacion } from "./actions";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { ok } = await pedirRecuperacion(email);

    if (!ok) {
      setError("Escribe un email válido.");
      return;
    }

    setEnviado(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cx-hielo px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/"><Logo /></a>
        </div>
        <h1 className="text-xl font-medium mb-1">Recupera tu contraseña</h1>
        <p className="text-sm text-cx-texto-2 mb-6">
          Te enviaremos un enlace para crear una nueva
        </p>

        {enviado ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Si ese email tiene cuenta en Coxiro, te llegará un enlace en un
            minuto o dos. Mira también en el correo no deseado.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
            />
            <button className="rounded-lg bg-cx-celeste text-cx-noche font-semibold text-sm py-2.5 mt-1 hover:brightness-105 transition">
              Enviar enlace
            </button>
          </form>
        )}

        <p className="text-sm text-cx-texto-2 mt-5">
          <a href="/login" className="text-cx-texto font-medium underline">
            Volver a iniciar sesión
          </a>
        </p>
      </div>
    </main>
  );
}
