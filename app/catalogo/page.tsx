import { createAdminClient } from "@/lib/supabase/admin";
import Logo from "@/components/Logo";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const categoriaActiva = sp.categoria === "mentoria" ? "mentoria" : "curso";
  const busqueda = sp.q?.trim() ?? "";

  // Página pública: cliente admin, seleccionando solo columnas
  // seguras del proveedor (nunca stripe_account_id ni tax_id).
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
      providers ( business_name, slug )
    `
    )
    .eq("is_public", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Buscador por título o descripción (por ahora sin categorías por
  // tema -- cuando existan, se añade aquí un filtro adicional).
  if (busqueda) {
    query = query.or(`title.ilike.%${busqueda}%,description.ilike.%${busqueda}%`);
  }

  const { data: services } = await query;

  const cursos = services?.filter((s) => s.type !== "consult") ?? [];
  const mentorias = services?.filter((s) => s.type === "consult") ?? [];
  const listaActiva = categoriaActiva === "mentoria" ? mentorias : cursos;

  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-stone/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-8 py-4">
          <a href="/">
            <Logo variant="light" />
          </a>
          <a
            href="/registro"
            className="rounded-lg bg-copper px-5 py-2.5 text-sm font-semibold text-paper hover:bg-copper-dark transition"
          >
            Regístrate
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">
          Productos digitales
        </p>
        <h1 className="text-3xl font-display font-semibold mb-6">
          Catálogo de Coxiro
        </h1>

        {/* Buscador: formulario GET, sin necesitar JavaScript */}
        <form method="GET" className="mb-6 flex gap-2">
          <input type="hidden" name="categoria" value={categoriaActiva} />
          <input
            type="text"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por tema (ej. inglés, trading, cocina...)"
            className="flex-1 rounded-lg border border-stone/25 bg-white px-4 py-2.5 text-sm"
          />
          <button className="rounded-lg bg-ink text-paper px-5 py-2.5 text-sm font-semibold hover:bg-ink/90 transition">
            Buscar
          </button>
        </form>

        <div className="flex gap-2 mb-8 border-b border-stone/20">
          <a
            href={`/catalogo?categoria=curso${busqueda ? `&q=${encodeURIComponent(busqueda)}` : ""}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              categoriaActiva === "curso"
                ? "border-copper text-ink"
                : "border-transparent text-stone hover:text-ink"
            }`}
          >
            Curso online ({cursos.length})
          </a>
          <a
            href={`/catalogo?categoria=mentoria${busqueda ? `&q=${encodeURIComponent(busqueda)}` : ""}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              categoriaActiva === "mentoria"
                ? "border-copper text-ink"
                : "border-transparent text-stone hover:text-ink"
            }`}
          >
            Mentoría ({mentorias.length})
          </a>
        </div>

        <div className="grid gap-3">
          {listaActiva.map((s) => {
            const provider = s.providers as any;
            return (
              <a
                key={s.id}
                href={`/servicio/${s.id}`}
                className="flex items-center justify-between rounded-lg bg-white border border-stone/20 px-5 py-4 hover:border-copper transition"
              >
                <div>
                  <p className="font-medium">{s.title}</p>
                  {s.description && (
                    <p className="text-sm text-stone mt-0.5 line-clamp-1">
                      {s.description}
                    </p>
                  )}
                  <p className="text-xs text-stone mt-1">
                    {provider?.business_name ?? "Profesional en Coxiro"}
                  </p>
                </div>
                <p className="font-display font-semibold whitespace-nowrap ml-4">
                  {Number(s.price).toFixed(2)} €
                </p>
              </a>
            );
          })}
          {!listaActiva.length && (
            <p className="text-sm text-stone">
              {busqueda
                ? `Ninguna coincidencia para "${busqueda}" en esta categoría.`
                : `Todavía no hay ${categoriaActiva === "mentoria" ? "mentorías" : "cursos"} publicados en el catálogo.`}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
