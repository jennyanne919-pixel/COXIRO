"use client";

import { useState } from "react";
import { joinWaitlist } from "@/app/waitlist/actions";

const TIPOS = [
  { value: "infoproducto", label: "Infoproducto" },
  { value: "mentoria", label: "Mentoría" },
  { value: "curso", label: "Curso" },
  { value: "ia", label: "Servicios de IA" },
  { value: "consultoria", label: "Consultoría" },
  { value: "otro", label: "Otro" },
];

// Fuerza colores explícitos en los campos. Dentro del navegador integrado
// de Instagram/Facebook (el webview in-app), el texto que escribe el
// usuario heredaba un esquema de color distinto y se quedaba invisible
// (blanco sobre blanco) aunque el campo sí recibía el valor. Con esto se
// fija el color de fondo y de texto explícitamente, incluyendo las
// propiedades -webkit- que ese webview respeta por encima del CSS normal.
const inputFixStyle: React.CSSProperties = {
  color: "#1a1a1a",
  backgroundColor: "#ffffff",
  WebkitTextFillColor: "#1a1a1a",
  colorScheme: "light",
};

export default function WaitlistForm({ fuente = "landing" }: { fuente?: string }) {
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ success: boolean; error?: string; yaEstaba?: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const formData = new FormData(e.currentTarget);
    formData.set("fuente", fuente);
    const res = await joinWaitlist(formData);
    setResultado(res);
    setEnviando(false);
  }

  if (resultado?.success) {
    return (
      <p className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
        {resultado.yaEstaba
          ? "Ya estabas en la lista — te avisaremos en cuanto abramos."
          : "¡Apuntado! Te avisaremos en cuanto abramos."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 flex-wrap">
      <input
        name="nombre"
        required
        placeholder="Tu nombre"
        style={inputFixStyle}
        className="rounded-lg border border-stone/25 px-4 py-3 text-sm min-w-[160px]"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="tu@email.com"
        style={inputFixStyle}
        className="rounded-lg border border-stone/25 px-4 py-3 text-sm min-w-[200px]"
      />
      <select
        name="tipo_servicio"
        required
        defaultValue=""
        style={inputFixStyle}
        className="rounded-lg border border-stone/25 px-4 py-3 text-sm"
      >
        <option value="" disabled>
          ¿Qué vendes?
        </option>
        {TIPOS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <button
        disabled={enviando}
        className="rounded-lg bg-copper px-6 py-3 text-sm font-semibold text-paper hover:bg-copper-dark transition disabled:opacity-50"
      >
        {enviando ? "Enviando..." : "Quiero acceso"}
      </button>
      {resultado?.error && (
        <p className="text-sm text-red-700 w-full">{resultado.error}</p>
      )}
    </form>
  );
}
