import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaybackUrl } from "@/lib/r2";
import { notFound, redirect } from "next/navigation";
import Logo from "@/components/Logo";
import VideoPlayer from "./VideoPlayer";

export default async function ReproductorPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/contenido/${itemId}`);
  }

  const admin = createAdminClient();

  const { data: item } = await admin
    .from("content_items")
    .select("id, title, service_id, content_type, r2_key, file_url, is_free")
    .eq("id", itemId)
    .single();

  if (!item) notFound();

  if (!item.is_free) {
    const { data: access } = await admin
      .from("content_access")
      .select("id")
      .eq("client_id", user.id)
      .eq("service_id", item.service_id)
      .maybeSingle();

    if (!access) {
      return (
        <main className="min-h-screen bg-paper flex items-center justify-center px-6">
          <p className="text-sm text-stone">No tienes acceso a este contenido.</p>
        </main>
      );
    }
  }

  // Si no es un vídeo o audio subido a R2 (ej. un PDF o un enlace
  // externo), no hace falta reproductor -- se redirige directo.
  const esReproducible = item.r2_key && ["video", "audio"].includes(item.content_type);

  if (!esReproducible) {
    redirect(`/api/access/${itemId}`);
  }

  const src = await getPlaybackUrl(item.r2_key!);

  const { data: progress } = await admin
    .from("content_progress")
    .select("position_seconds")
    .eq("client_id", user.id)
    .eq("content_item_id", itemId)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-ink">
      <header className="px-6 py-4">
        <a href="/dashboard/contenido">
          <Logo variant="dark" />
        </a>
      </header>
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="text-paper text-lg font-medium mb-4">{item.title}</h1>
        <VideoPlayer
          src={src}
          title={item.title}
          contentItemId={item.id}
          resumeAt={Number(progress?.position_seconds ?? 0)}
          isAudio={item.content_type === "audio"}
        />
      </div>
    </main>
  );
}
