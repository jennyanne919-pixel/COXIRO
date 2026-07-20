import { createClient } from "@/lib/supabase/server";
import { addContentItem, updateContentItem } from "./actions";
import { notFound } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  pdf: "PDF",
  link: "Enlace",
  document: "Documento",
};

export default async function ContenidoServicioPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service } = await supabase
    .from("services")
    .select("id, title, provider_id")
    .eq("id", params.id)
    .single();

  // Si no es tu servicio, RLS ya lo habría bloqueado -- esto es
  // además una comprobación explícita para no mostrar nada ajeno.
  if (!service || service.provider_id !== user?.id) {
    notFound();
  }

  const { data: items } = await supabase
    .from("content_items")
    .select("*")
    .eq("service_id", params.id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <a href="/dashboard/servicios" className="text-xs text-stone hover:text-ink">
          ← Volver a mis servicios
        </a>
        <h1 className="text-lg font-medium mt-2">Contenido de "{service.title}"</h1>
        <p className="text-sm text-stone mt-0.5">
          Lo que verá el cliente después de pagar
        </p>
      </div>

      <form
        action={addContentItem}
        className="rounded-lg bg-paper p-5 mb-8 grid gap-3 max-w-lg"
      >
        <input type="hidden" name="service_id" value={service.id} />
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
          <label className="text-xs text-stone block mb-1">
            Enlace (vídeo, PDF, Drive, Zoom...)
          </label>
          <input
            name="file_url"
            type="url"
            required
            placeholder="https://..."
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-stone block mb-1">Tipo</label>
          <select
            name="content_type"
            className="w-full rounded-lg border border-stone/25 bg-white px-3.5 py-2 text-sm"
          >
            <option value="link">Enlace</option>
            <option value="video">Vídeo</option>
            <option value="pdf">PDF</option>
            <option value="document">Documento</option>
          </select>
        </div>
        <button className="rounded-lg bg-copper text-paper text-sm font-semibold py-2.5 mt-1 hover:bg-copper-dark transition">
          Añadir contenido
        </button>
      </form>

      <div className="rounded-lg bg-paper overflow-hidden">
        <div className="grid grid-cols-3 px-3.5 py-2.5 text-xs text-stone border-b border-stone/20">
          <span>Título</span>
          <span>Tipo</span>
          <span>Enlace</span>
        </div>
        {items?.map((item) => (
          <form
            action={updateContentItem}
            key={item.id}
            className="grid grid-cols-3 px-3.5 py-3 text-sm items-center border-b border-stone/20 last:border-0 gap-2"
          >
            <input type="hidden" name="item_id" value={item.id} />
            <input type="hidden" name="service_id" value={service.id} />
            <span>{item.title}</span>
            <span className="text-stone">{TYPE_LABELS[item.content_type] ?? item.content_type}</span>
            <div className="flex gap-2">
              <input
                name="file_url"
                type="url"
                defaultValue={item.file_url}
                className="flex-1 min-w-0 rounded-lg border border-stone/25 bg-white px-2.5 py-1.5 text-xs"
              />
              <button className="text-xs font-medium text-copper hover:underline whitespace-nowrap">
                Guardar
              </button>
            </div>
          </form>
        ))}
        {!items?.length && (
          <p className="text-sm text-stone p-4">
            Todavía no has añadido contenido a este servicio.
          </p>
        )}
      </div>
    </div>
  );
}
