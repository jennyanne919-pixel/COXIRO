"use client";

import { useState } from "react";
import { addFileBlock } from "./actions";

// Sube un archivo (vídeo, audio, PDF, documento...) a R2 y lo añade como
// bloque de la lección. La subida va directa del navegador a R2.
export default function AddFileBlockForm({
  serviceId,
  itemId,
}: {
  serviceId: string;
  itemId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Selecciona un archivo");
      return;
    }

    setSubiendo(true);
    setProgreso(0);
    try {
      const res = await fetch("/api/r2/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(cuerpo?.error ?? "No se pudo iniciar la subida");
      }
      const { uploadUrl, key } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) setProgreso(Math.round((evt.loaded / evt.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Error subiendo el archivo")));
        xhr.onerror = () => reject(new Error("Error subiendo el archivo"));
        xhr.send(file);
      });

      const fd = new FormData();
      fd.set("service_id", serviceId);
      fd.set("item_id", itemId);
      fd.set("r2_key", key);
      fd.set("mime", file.type);
      fd.set("title", titulo || file.name);
      const r = await addFileBlock(fd);
      if (!r.ok) throw new Error(r.error ?? "No se pudo guardar");

      setFile(null);
      setTitulo("");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err?.message || "Error subiendo el archivo. Inténtalo de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título (opcional)"
        className="w-full rounded-lg border border-cx-borde bg-white px-3.5 py-2 text-sm"
      />
      <input
        type="file"
        required
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full rounded-lg border border-cx-borde bg-white px-3.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-cx-noche file:text-white file:px-3 file:py-1.5 file:text-xs"
      />
      <p className="text-[11px] text-cx-texto-2">
        Vídeo (mp4, mov, webm), audio, PDF, imágenes, Word, Excel, PowerPoint o zip.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {subiendo && (
        <div className="h-2 rounded-full bg-cx-hielo overflow-hidden">
          <div className="h-full bg-cx-celeste" style={{ width: `${progreso}%` }} />
        </div>
      )}
      <button
        disabled={subiendo}
        className="rounded-lg bg-cx-celeste text-cx-noche text-sm font-semibold py-2 hover:brightness-105 transition disabled:opacity-60"
      >
        {subiendo ? `Subiendo… ${progreso} %` : "Subir y añadir"}
      </button>
    </form>
  );
}
