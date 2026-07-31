import { createClient } from "@/lib/supabase/server";
import { deleteContentItem } from "./actions";
import AddContentForm from "./AddContentForm";
import { notFound } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  pdf: "PDF",
  audio: "Audio",
  link: "Enlace",
  document: "Documento",
};

export default async function ContenidoServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service } = await supabase
    .from("services")
    .select("id, title, provider_id")
    .eq("id", id)
    .single();

  if (!service || service.provider_id !== user?.id) {
    notFound();
  }

  const { data: items } = await supabase
    .from("content_items")
    .select("*")
    .eq("service_id", id)
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

      <AddContentForm serviceId={service.id} />

      <div className="rounded-lg bg-paper overflow-hidden">
        <div className="grid grid-cols-4 px-3.5 py-2.5 text-xs text-stone border-b border-stone/20">
          <span className="col-span-2">Título</span>
          <span>Tipo</span>
          <span></span>
        </div>
        {items?.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-4 px-3.5 py-3 text-sm items-center border-b border-stone/20 last:border-0 gap-2"
          >
            <span className="col-span-2">
              {item.title}
              {item.is_free && (
                <span className="ml-2 text-[10px] font-semibold uppercase text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                  Gratis
                </span>
              )}
            </span>
            <span className="text-stone">{TYPE_LABELS[item.content_type] ?? item.content_type}</span>
            <form action={deleteContentItem}>
              <input type="hidden" name="item_id" value={item.id} />
              <input type="hidden" name="service_id" value={service.id} />
              <button className="text-xs text-red-600 hover:underline justify-self-end">
                Eliminar
              </button>
            </form>
          </div>
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
