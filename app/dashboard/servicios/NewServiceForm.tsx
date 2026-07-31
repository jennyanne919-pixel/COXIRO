"use client";

import { useState } from "react";
import { TOPICS, SERVICE_TYPES } from "@/lib/topics";

export default function NewServiceForm({
  createService,
}: {
  createService: (formData: FormData) => void;
}) {
  const [type, setType] = useState("consult");
  const esAMedida = type === "custom";
  const esMembresia = type === "membership";

  return (
    <form
      action={createService}
      className="rounded-lg bg-paper p-5 mb-8 grid gap-3 max-w-lg"
    >
      <div>
        <label className="text-xs text-stone block mb-1">Título</label>
        <input
          name="title"
          required
          placeholder="Ej. Consulta laboral inicial"
          className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-stone block mb-1">Descripción</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Qué incluye este servicio"
          className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-stone block mb-1">
          Imagen o logo (opcional, máximo 4 MB)
        </label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-stone block mb-1">
            Precio (€) {esAMedida && "— opcional"}
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required={!esAMedida}
            placeholder="90.00"
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-stone block mb-1">Tipo</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          >
            {SERVICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-stone block mb-1">
          Temática (para que te encuentren en el buscador)
        </label>
        <select
          name="topic"
          required
          className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
        >
          <option value="">Selecciona una temática</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_public" />
        Mostrar en el catálogo público de Coxiro
      </label>

      {esMembresia && (
        <>
          <div>
            <label className="text-xs text-stone block mb-1">
              Frecuencia de cobro
            </label>
            <select
              name="billing_interval"
              required
              className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
            >
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-stone block mb-1">
              Número de pagos (opcional)
            </label>
            <input
              name="total_installments"
              type="number"
              min="1"
              placeholder="Déjalo en blanco para suscripción sin fin"
              className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
            />
            <p className="text-xs text-stone mt-1">
              Ej. "6" para una mentoría de 6 meses con 6 pagos, que se
              detiene sola al final. Déjalo vacío si el cliente debe
              seguir pagando indefinidamente hasta que cancele.
            </p>
          </div>
        </>
      )}

      {esAMedida && (
        <>
          <input type="hidden" name="requires_inquiry" value="on" />
          <div>
            <label className="text-xs text-stone block mb-1">
              Enlace externo de contacto (opcional)
            </label>
            <input
              name="inquiry_url"
              type="url"
              placeholder="https://..."
              className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>
        </>
      )}

      <button className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 mt-1 hover:bg-copper-dark transition">
        Publicar servicio
      </button>
    </form>
  );
}
