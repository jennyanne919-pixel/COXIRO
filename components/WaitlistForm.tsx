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

export default function WaitlistForm({ fuente = "landing", oscuro = false }: { fuente?: string; oscuro?: boolean }) {
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
      <p className={oscuro ? "text-sm font-medium text-white bg-white/10 border border-white/25 rounded-lg px-4 py-3" : "text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3"}>
        {resultado.yaEstaba
          ? "Ya estabas en la lista — te avisaremos en cuanto abramos."
          : "¡Apuntado! Te avisaremos en cuanto abramos."}
      </p>
    );
  }

  if (oscuro) {
    const campo = "w-full rounded-xl border border-white/20 px-4 py-3 text-base";
    const label = "block text-sm font-medium text-white mb-1.5";
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="wl-nombre" className={label}>Nombre</label>
          <input id="wl-nombre" name="nombre" required placeholder="Tu nombre" style={inputFixStyle} className={campo} />
        </div>
        <div>
          <label htmlFor="wl-email" className={label}>Email</label>
          <input id="wl-email" type="email" name="email" required placeholder="tu@email.com" style={inputFixStyle} className={campo} />
        </div>
        <div>
          <label htmlFor="wl-tipo" className={label}>¿Qué vendes?</label>
          <select id="wl-tipo" name="tipo_servicio" required defaultValue="" style={inputFixStyle} className={campo}>
            <option value="" disabled>Elige una opción</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          disabled={enviando}
          className="rounded-full bg-cx-celeste px-6 py-3.5 text-base font-semibold text-cx-noche hover:brightness-105 transition disabled:opacity-50 mt-1"
        >
          {enviando ? "Enviando..." : "Quiero acceso"}
        </button>
        {resultado?.error && <p className="text-sm text-red-300">{resultado.error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 flex-wrap">
      <input
        name="nombre"
        required
        placeholder="Tu nombre"
        style={inputFixStyle}
        className="rounded-lg border border-cx-borde px-4 py-3 text-sm min-w-[160px]"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="tu@email.com"
        style={inputFixStyle}
        className="rounded-lg border border-cx-borde px-4 py-3 text-sm min-w-[200px]"
      />
      <select
        name="tipo_servicio"
        required
        defaultValue=""
        style={inputFixStyle}
        className="rounded-lg border border-cx-borde px-4 py-3 text-sm"
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
        className="rounded-full bg-cx-celeste px-6 py-3 text-sm font-semibold text-cx-noche hover:brightness-105 transition disabled:opacity-50"
      >
        {enviando ? "Enviando..." : "Quiero acceso"}
      </button>
      {resultado?.error && (
        <p className="text-sm text-red-700 w-full">{resultado.error}</p>
      )}
    </form>
  );
}
