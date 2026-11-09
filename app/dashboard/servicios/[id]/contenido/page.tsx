import { createClient } from "@/lib/supabase/server";
import { deleteContentItem } from "./actions";
import AddContentForm from "./AddContentForm";
import DeleteContentButton from "./DeleteContentButton";
import { notFound } from "next/navigation";
import {
  Badge,
  BTN_SECONDARY,
  Card,
  EmptyState,
  Icon,
  PageHeader,
  type IconName,
} from "@/components/dashboard/ui";

const TYPES: Record<string, { label: string; icon: IconName }> = {
  video: { label: "Vídeo", icon: "play" },
  pdf: { label: "PDF", icon: "doc" },
  audio: { label: "Audio", icon: "play" },
  link: { label: "Enlace", icon: "external" },
  document: { label: "Documento", icon: "doc" },
};

function tamano(bytes?: number | null) {
  if (!bytes) return "";
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

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
      <a href="/dashboard/servicios" className="inline-flex items-center gap-1 text-xs text-cx-texto-2 hover:text-cx-prof mb-3">
        ← Volver a mis servicios
      </a>
      <PageHeader
        title={`Contenido de «${service.title}»`}
        subtitle="Lo que verá el cliente después de pagar"
      />

      <AddContentForm serviceId={service.id} />

      <Card>
        {items?.length ? (
          <ul className="divide-y divide-cx-borde">
            {items.map((item) => {
              const t = TYPES[item.content_type] ?? { label: item.content_type, icon: "doc" as IconName };
              const reproducible = item.r2_key && ["video", "audio"].includes(item.content_type);
              return (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="w-10 h-10 rounded-xl bg-cx-hielo text-cx-prof flex items-center justify-center shrink-0">
                    <Icon name={t.icon} className="w-[18px] h-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-cx-noche truncate">{item.title}</p>
                    <p className="text-xs text-cx-texto-2">
                      {t.label}
                      {item.file_size ? ` · ${tamano(item.file_size)}` : ""}
                    </p>
                  </div>
                  {item.is_free && <Badge tone="verde">Gratis</Badge>}
                  <a
                    href={reproducible ? `/contenido/${item.id}` : `/api/access/${item.id}`}
                    target="_blank"
                    className={BTN_SECONDARY}
                  >
                    <Icon name={reproducible ? "play" : "eye"} className="w-3.5 h-3.5" />
                    Ver
                  </a>
                  <DeleteContentButton
                    itemId={item.id}
                    serviceId={service.id}
                    deleteContentItem={deleteContentItem}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon="folder"
            title="Todavía no has añadido contenido"
            text="Sube un vídeo, un PDF o un enlace con el formulario de arriba."
          />
        )}
      </Card>
    </div>
  );
}
