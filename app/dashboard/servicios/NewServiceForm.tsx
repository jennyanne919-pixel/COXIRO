"use client";

import { useState } from "react";

export default function NewServiceForm({
  createService,
}: {
  createService: (formData: FormData) => void;
}) {
  const [type, setType] = useState("consult");
  const esAMedida = type === "custom";

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
            <option value="consult">Consulta</option>
            <option value="content">Contenido</option>
            <option value="course">Curso</option>
            <option value="custom">Servicios a medida</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_public" />
        Mostrar en el catálogo público de Coxiro
      </label>

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
