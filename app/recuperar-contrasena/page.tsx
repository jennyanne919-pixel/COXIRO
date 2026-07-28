"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-contrasena`,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setEnviado(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/"><Logo /></a>
        </div>
        <h1 className="text-xl font-medium mb-1">Recupera tu contraseña</h1>
        <p className="text-sm text-stone mb-6">
          Te enviaremos un enlace para crear una nueva
        </p>

        {enviado ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Revisa tu email — te hemos enviado un enlace para crear tu
            contraseña nueva.
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
              className="rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
            />
            <button className="rounded-lg bg-copper text-paper font-semibold text-sm py-2.5 mt-1 hover:bg-copper-dark transition">
              Enviar enlace
            </button>
          </form>
        )}

        <p className="text-sm text-stone mt-5">
          <a href="/login" className="text-ink font-medium underline">
            Volver a iniciar sesión
          </a>
        </p>
      </div>
    </main>
  );
}
