import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

const TIPOS = [
  { value: "infoproducto", label: "Infoproducto" },
  { value: "mentoria", label: "Mentoría" },
  { value: "curso", label: "Curso" },
  { value: "ia", label: "Servicios de IA" },
  { value: "consultoria", label: "Consultoría" },
  { value: "otro", label: "Otro" },
];

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; fuente?: string }>;
}) {
  const sp = await searchParams;

  // Protección simple: solo los emails de la lista ADMIN_EMAILS (env
  // var, separados por coma) pueden ver esto -- no hay un sistema de
  // roles de administrador todavía, así que se hace con esta lista.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    redirect("/login");
  }

  const admin = createAdminClient();

  let query = admin.from("waitlist").select("*").order("created_at", { ascending: false });
  if (sp.tipo) query = query.eq("tipo_servicio", sp.tipo);
  if (sp.fuente) query = query.eq("fuente", sp.fuente);

  const { data: registros } = await query;

  const { count: totalGeneral } = await admin
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  const fuentesUnicas = [
    ...new Set((await admin.from("waitlist").select("fuente")).data?.map((r) => r.fuente) ?? []),
  ].filter(Boolean);

  const qs = (extra: Record<string, string>) => {
    const params = new URLSearchParams({
      ...(sp.tipo ? { tipo: sp.tipo } : {}),
      ...(sp.fuente ? { fuente: sp.fuente } : {}),
      ...extra,
    });
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  return (
    <main className="min-h-screen bg-cx-hielo p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-1">Lista de espera</h1>
        <p className="text-sm text-cx-texto-2 mb-8">{totalGeneral ?? 0} personas apuntadas en total</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          <a
            href={`/admin/waitlist${qs({ tipo: "" })}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
              !sp.tipo ? "bg-cx-noche text-white border-cx-noche" : "border-cx-borde text-cx-texto-2"
            }`}
          >
            Todos los tipos
          </a>
          {TIPOS.map((t) => (
            <a
              key={t.value}
              href={`/admin/waitlist${qs({ tipo: t.value })}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
                sp.tipo === t.value ? "bg-cx-noche text-white border-cx-noche" : "border-cx-borde text-cx-texto-2"
              }`}
            >
              {t.label}
            </a>
          ))}
        </div>

        {fuentesUnicas.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            <a
              href={`/admin/waitlist${qs({ fuente: "" })}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
                !sp.fuente ? "bg-cx-celeste text-cx-noche border-cx-celeste" : "border-cx-borde text-cx-texto-2"
              }`}
            >
              Todas las fuentes
            </a>
            {fuentesUnicas.map((f) => (
              <a
                key={f}
                href={`/admin/waitlist${qs({ fuente: f as string })}`}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
                  sp.fuente === f ? "bg-cx-celeste text-cx-noche border-cx-celeste" : "border-cx-borde text-cx-texto-2"
                }`}
              >
                {f}
              </a>
            ))}
          </div>
        )}

        <div className="rounded-lg bg-white border border-cx-borde overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-2.5 text-xs text-cx-texto-2 border-b border-cx-borde">
            <span className="col-span-2">Nombre / Email</span>
            <span>Vende</span>
            <span>Fuente</span>
            <span>Fecha</span>
          </div>
          {registros?.map((r) => (
            <div key={r.id} className="grid grid-cols-5 px-4 py-3 text-sm border-b border-cx-borde last:border-0">
              <div className="col-span-2">
                <p className="font-medium">{r.nombre}</p>
                <p className="text-xs text-cx-texto-2">{r.email}</p>
              </div>
              <span className="text-cx-texto-2">{TIPOS.find((t) => t.value === r.tipo_servicio)?.label ?? r.tipo_servicio}</span>
              <span className="text-cx-texto-2">{r.fuente ?? "—"}</span>
              <span className="text-cx-texto-2">{new Date(r.created_at).toLocaleDateString("es-ES")}</span>
            </div>
          ))}
          {!registros?.length && (
            <p className="text-sm text-cx-texto-2 p-4">Nadie con este filtro todavía.</p>
          )}
        </div>
      </div>
    </main>
  );
}
