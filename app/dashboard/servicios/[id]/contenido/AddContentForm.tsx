"use client";

import { useState } from "react";
import { addContentItem } from "./actions";

const TYPE_OPTIONS = [
  { value: "video", label: "Vídeo (se sube a Coxiro)" },
  { value: "pdf", label: "PDF (se sube a Coxiro)" },
  { value: "audio", label: "Audio (se sube a Coxiro)" },
  { value: "document", label: "Documento (se sube a Coxiro)" },
  { value: "link", label: "Enlace externo (Zoom, Drive...)" },
];

export default function AddContentForm({ serviceId }: { serviceId: string }) {
  const [contentType, setContentType] = useState("video");
  const [file, setFile] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");

  const esArchivo = contentType !== "link";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (esArchivo) {
      if (!file) {
        setError("Selecciona un archivo");
        return;
      }

      setSubiendo(true);
      setProgreso(0);

      try {
        // 1. Pedimos un enlace de subida firmado para este archivo
        const res = await fetch("/api/r2/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId,
            fileName: file.name,
            contentType: file.type,
          }),
        });

        if (!res.ok) throw new Error("No se pudo iniciar la subida");
        const { uploadUrl, key } = await res.json();

        // 2. Subimos el archivo DIRECTO a R2, con barra de progreso
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              setProgreso(Math.round((evt.loaded / evt.total) * 100));
            }
          };
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject());
          xhr.onerror = () => reject();
          xhr.send(file);
        });

        // 3. Guardamos los metadatos en nuestra base de datos
        formData.set("r2_key", key);
        formData.set("file_size", String(file.size));
        await addContentItem(formData);

        form.reset();
        setFile(null);
      } catch (err) {
        setError("Error subiendo el archivo. Inténtalo de nuevo.");
      } finally {
        setSubiendo(false);
      }
    } else {
      await addContentItem(formData);
      form.reset();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-paper p-5 mb-8 grid gap-3 max-w-lg"
    >
      <input type="hidden" name="service_id" value={serviceId} />

      <div>
        <label className="text-xs text-stone block mb-1">Título</label>
        <input
          name="title"
          required
          placeholder="Ej. Sesión grabada 1"
          className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-stone block mb-1">Tipo</label>
        <select
          name="content_type"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {esArchivo ? (
        <div>
          <label className="text-xs text-stone block mb-1">Archivo</label>
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-xs"
          />
        </div>
      ) : (
        <div>
          <label className="text-xs text-stone block mb-1">
            Enlace (Zoom, Drive, Vimeo...)
          </label>
          <input
            name="file_url"
            type="url"
            required
            placeholder="https://..."
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_free" />
        Contenido gratuito (visible sin comprar, tipo vídeo de presentación)
      </label>

      {subiendo && (
        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
          <div
            className="bg-copper h-full transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        disabled={subiendo}
        className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 mt-1 hover:bg-copper-dark transition disabled:opacity-50"
      >
        {subiendo ? `Subiendo... ${progreso}%` : "Añadir contenido"}
      </button>
    </form>
  );
}
