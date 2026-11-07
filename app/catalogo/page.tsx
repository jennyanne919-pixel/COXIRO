import { createAdminClient } from "@/lib/supabase/admin";
import Logo from "@/components/Logo";
import { TOPICS } from "@/lib/topics";
import { totalCliente } from "@/lib/pricing";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string; tema?: string }>;
}) {
  const sp = await searchParams;
  const categoriaActiva = ["curso", "mentoria", "membresia", "medida", "otros"].includes(sp.categoria ?? "")
    ? sp.categoria!
    : "curso";
  const busqueda = sp.q?.trim() ?? "";
  const temaActivo = sp.tema ?? "";

  const supabase = createAdminClient();

  let query = supabase
    .from("services")
    .select(
      `
      id,
      title,
      description,
      price,
      currency,
      type,
      topic,
      image_url,
      requires_inquiry,
      providers ( business_name, slug )
    `
    )
    .eq("is_public", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (busqueda) {
    query = query.or(`title.ilike.%${busqueda}%,description.ilike.%${busqueda}%`);
  }
  if (temaActivo) {
    query = query.eq("topic", temaActivo);
  }

  const { data: services } = await query;

  const cursos = services?.filter((s) => s.type === "content" || s.type === "course") ?? [];
  const mentorias = services?.filter((s) => s.type === "consult") ?? [];
  const membresias = services?.filter((s) => s.type === "membership") ?? [];
  const aMedida = services?.filter((s) => s.type === "custom") ?? [];
  const otrosServicios = services?.filter((s) => s.type === "other") ?? [];

  const listas: Record<string, typeof services> = {
    curso: cursos,
    mentoria: mentorias,
    membresia: membresias,
    medida: aMedida,
    otros: otrosServicios,
  };
  const listaActiva = listas[categoriaActiva] ?? [];

  const qs = (extra: Record<string, string>) => {
    const params = new URLSearchParams({
      categoria: categoriaActiva,
      ...(busqueda ? { q: busqueda } : {}),
      ...(temaActivo ? { tema: temaActivo } : {}),
      ...extra,
    });
    return `?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="sticky top-0 z-50 bg-cx-hielo/90 backdrop-blur border-b border-cx-borde">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-8 py-4">
          <a href="/">
            <Logo variant="light" />
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-full border border-cx-borde bg-white px-5 py-2.5 text-sm font-semibold text-cx-texto hover:border-cx-celeste transition"
            >
              Entrar
            </a>
            <a
              href="/registro?role=client"
              className="rounded-full bg-cx-celeste px-5 py-2.5 text-sm font-semibold text-cx-noche hover:brightness-105 transition"
            >
              Regístrate
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="text-xs text-cx-texto-2 uppercase tracking-wide font-semibold mb-2">
          Productos digitales
        </p>
        <h1 className="text-3xl font-display font-semibold mb-6">
          Catálogo de Coxiro
        </h1>

        <form method="GET" className="mb-6 flex gap-2">
          <input type="hidden" name="categoria" value={categoriaActiva} />
          {temaActivo && <input type="hidden" name="tema" value={temaActivo} />}
          <input
            type="text"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por tema (ej. inglés, trading, cocina...)"
            className="flex-1 rounded-lg border border-cx-borde bg-white px-4 py-2.5 text-sm"
          />
          <button className="rounded-full bg-cx-noche text-white px-5 py-2.5 text-sm font-semibold hover:bg-cx-noche/90 transition">
            Buscar
          </button>
        </form>

        <div className="flex gap-2 mb-4 border-b border-cx-borde flex-wrap">
          <a
            href={`/catalogo${qs({ categoria: "curso" })}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              categoriaActiva === "curso"
                ? "border-cx-celeste text-cx-texto"
                : "border-transparent text-cx-texto-2 hover:text-cx-texto"
            }`}
          >
            Cursos / Formación ({cursos.length})
          </a>
          <a
            href={`/catalogo${qs({ categoria: "mentoria" })}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              categoriaActiva === "mentoria"
                ? "border-cx-celeste text-cx-texto"
                : "border-transparent text-cx-texto-2 hover:text-cx-texto"
            }`}
          >
            Mentoría ({mentorias.length})
          </a>
          <a
            href={`/catalogo${qs({ categoria: "membresia" })}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              categoriaActiva === "membresia"
                ? "border-cx-celeste text-cx-texto"
                : "border-transparent text-cx-texto-2 hover:text-cx-texto"
            }`}
          >
            Membresías y suscripciones ({membresias.length})
          </a>
          <a
            href={`/catalogo${qs({ categoria: "medida" })}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              categoriaActiva === "medida"
                ? "border-cx-celeste text-cx-texto"
                : "border-transparent text-cx-texto-2 hover:text-cx-texto"
            }`}
          >
            Servicios IA ({aMedida.length})
          </a>
          <a
            href={`/catalogo${qs({ categoria: "otros" })}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              categoriaActiva === "otros"
                ? "border-cx-celeste text-cx-texto"
                : "border-transparent text-cx-texto-2 hover:text-cx-texto"
            }`}
          >
            Otros servicios ({otrosServicios.length})
          </a>
        </div>

        {/* Filtro por temática */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <a
            href={`/catalogo${qs({ tema: "" })}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
              !temaActivo
                ? "bg-cx-noche text-white border-cx-noche"
                : "border-cx-borde text-cx-texto-2 hover:border-cx-noche"
            }`}
          >
            Todas las temáticas
          </a>
          {TOPICS.map((t) => (
            <a
              key={t}
              href={`/catalogo${qs({ tema: t })}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                temaActivo === t
                  ? "bg-cx-noche text-white border-cx-noche"
                  : "border-cx-borde text-cx-texto-2 hover:border-cx-noche"
              }`}
            >
              {t}
            </a>
          ))}
        </div>

        <div className="grid gap-3">
          {listaActiva?.map((s) => {
            const provider = s.providers as any;
            return (
              <a
                key={s.id}
                href={`/servicio/${s.id}`}
                className="flex items-center gap-4 rounded-lg bg-white border border-cx-borde px-5 py-4 hover:border-cx-celeste transition"
              >
                {s.image_url ? (
                  <img
                    src={s.image_url}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-cx-hielo flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{s.title}</p>
                  {s.description && (
                    <p className="text-sm text-cx-texto-2 mt-0.5 line-clamp-1">
                      {s.description}
                    </p>
                  )}
                  <p className="text-xs text-cx-texto-2 mt-1">
                    {provider?.business_name ?? "Profesional en Coxiro"}
                    {s.topic && ` · ${s.topic}`}
                  </p>
                </div>
                <p className="font-display font-semibold whitespace-nowrap ml-4">
                  {s.requires_inquiry ? "A medida" : `${totalCliente(Number(s.price)).toFixed(2)} €`}
                </p>
              </a>
            );
          })}
          {!listaActiva?.length && (
            <div className="text-sm text-cx-texto-2">
              {(() => {
                if (!busqueda && !temaActivo) {
                  return <p>Todavía no hay servicios publicados en esta categoría.</p>;
                }
                const otraCategoria = Object.entries(listas).find(
                  ([key, lista]) => key !== categoriaActiva && (lista?.length ?? 0) > 0
                );
                const NOMBRES: Record<string, string> = {
                  curso: "Cursos / Formación",
                  mentoria: "Mentoría",
                  membresia: "Membresías y suscripciones",
                  medida: "Servicios IA",
                  otros: "Otros servicios",
                };
                return otraCategoria ? (
                  <p>
                    No hay resultados en esta categoría, pero sí hay{" "}
                    {otraCategoria[1]?.length} en{" "}
                    <a
                      href={`/catalogo${qs({ categoria: otraCategoria[0] })}`}
                      className="text-cx-prof underline font-medium"
                    >
                      {NOMBRES[otraCategoria[0]]}
                    </a>
                    .
                  </p>
                ) : (
                  <p>Ninguna coincidencia con ese filtro, en ninguna categoría.</p>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
