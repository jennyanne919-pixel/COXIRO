import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { updateService } from "../../actions";
import { TOPICS } from "@/lib/topics";

export default async function EditarServicioPage({
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
    .select("*")
    .eq("id", id)
    .single();

  if (!service || service.provider_id !== user?.id) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-lg font-medium">Editar servicio</h1>
        <p className="text-sm text-stone mt-0.5">
          Cambia el título, la descripción, el precio o la temática
        </p>
      </div>

      <form action={updateService} className="space-y-4 bg-paper rounded-lg p-5">
        <input type="hidden" name="id" value={service.id} />

        <div>
          <label className="text-xs font-medium text-stone block mb-1">Título</label>
          <input
            type="text"
            name="title"
            defaultValue={service.title}
            required
            className="w-full rounded-lg border border-stone/25 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone block mb-1">Descripción</label>
          <textarea
            name="description"
            defaultValue={service.description ?? ""}
            rows={4}
            className="w-full rounded-lg border border-stone/25 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone block mb-1">Precio (€)</label>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            defaultValue={service.price}
            required
            className="w-full rounded-lg border border-stone/25 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone block mb-1">Temática</label>
          <select
            name="topic"
            defaultValue={service.topic ?? ""}
            className="w-full rounded-lg border border-stone/25 bg-white px-3 py-2 text-sm"
          >
            <option value="">Sin especificar</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-copper px-5 py-2.5 text-sm font-semibold text-paper hover:bg-copper-dark transition"
          >
            Guardar cambios
          </button>
          <a
            href="/dashboard/servicios"
            className="text-sm text-stone hover:underline"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
