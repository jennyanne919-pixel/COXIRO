import { publicarComentario, borrarComentario, resolverComentario } from "@/app/curso/[serviceId]/comentarios";

export type Comentario = {
  id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  is_instructor: boolean;
  resolved: boolean;
  created_at: string;
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Formulario({
  serviceId,
  itemId,
  parentId,
  placeholder,
  boton,
}: {
  serviceId: string;
  itemId: string;
  parentId?: string;
  placeholder: string;
  boton: string;
}) {
  return (
    <form action={publicarComentario} className="grid gap-2">
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="item_id" value={itemId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <textarea
        name="body"
        required
        maxLength={2000}
        rows={parentId ? 2 : 3}
        placeholder={placeholder}
        className="w-full rounded-xl border border-cx-borde bg-white px-3 py-2 text-sm text-cx-noche focus:outline-none focus:border-cx-celeste"
      />
      <div>
        <button className="rounded-full bg-cx-celeste text-cx-noche text-sm font-semibold px-4 py-1.5 hover:brightness-105 transition">
          {boton}
        </button>
      </div>
    </form>
  );
}

export default function Dudas({
  serviceId,
  itemId,
  userId,
  esDueno,
  comentarios,
  nombres,
  aviso,
}: {
  serviceId: string;
  itemId: string;
  userId: string;
  esDueno: boolean;
  comentarios: Comentario[];
  nombres: Record<string, string>;
  aviso?: "limite" | "error";
}) {
  const raices = comentarios.filter((c) => !c.parent_id);
  const respuestas = (id: string) => comentarios.filter((c) => c.parent_id === id);

  const Burbuja = ({ c }: { c: Comentario }) => (
    <div className="flex gap-3">
      <span
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
          c.is_instructor ? "bg-cx-celeste text-cx-noche" : "bg-cx-hielo text-cx-prof"
        }`}
        aria-hidden="true"
      >
        {(nombres[c.author_id] ?? "?").trim().charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-cx-texto-2">
          <span className="font-medium text-cx-noche">{nombres[c.author_id] ?? "Alumno"}</span>
          {c.is_instructor && (
            <span className="ml-1.5 rounded-full bg-cx-celeste/25 text-cx-noche px-1.5 py-0.5 text-[10px] font-medium">
              Profesional
            </span>
          )}
          <span className="ml-2">{fecha(c.created_at)}</span>
        </p>
        <p className="text-sm text-cx-noche mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
        {(c.author_id === userId || esDueno) && (
          <form action={borrarComentario} className="mt-1">
            <input type="hidden" name="comment_id" value={c.id} />
            <button className="text-[11px] text-cx-texto-2 hover:text-red-600 underline">Borrar</button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <section id="dudas" className="mt-6 rounded-2xl bg-white border border-cx-borde p-5 sm:p-7">
      <h2 className="font-display font-bold text-lg text-cx-noche">Dudas y comentarios</h2>
      <p className="text-xs text-cx-texto-2 mt-0.5">
        {esDueno
          ? "Las dudas de tus alumnos en esta lección. Cada respuesta les llega por email."
          : "Pregunta aquí lo que no te quede claro; el profesional te responderá y te avisaremos por email."}
      </p>

      {aviso === "limite" && (
        <p className="mt-3 rounded-xl bg-amber-50 text-amber-800 text-sm px-4 py-2">
          Has enviado muchos mensajes seguidos. Espera un rato y vuelve a intentarlo.
        </p>
      )}
      {aviso === "error" && (
        <p className="mt-3 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-2">
          No hemos podido guardar el mensaje. Inténtalo de nuevo.
        </p>
      )}

      <div className="mt-4">
        <Formulario
          serviceId={serviceId}
          itemId={itemId}
          placeholder={esDueno ? "Escribe una nota para tus alumnos…" : "Escribe tu duda…"}
          boton={esDueno ? "Publicar" : "Enviar duda"}
        />
      </div>

      <div className="mt-6 grid gap-5">
        {raices.length === 0 && <p className="text-sm text-cx-texto-2">Todavía no hay mensajes en esta lección.</p>}
        {[...raices].reverse().map((c) => {
          const rs = respuestas(c.id);
          const sinResponder = !c.is_instructor && !rs.some((r) => r.is_instructor);
          return (
            <div key={c.id} className="rounded-xl border border-cx-borde p-4 grid gap-3">
              <Burbuja c={c} />
              <div className="flex items-center gap-2 flex-wrap">
                {c.resolved && (
                  <span className="text-[11px] rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">Resuelta</span>
                )}
                {esDueno && sinResponder && !c.resolved && (
                  <span className="text-[11px] rounded-full bg-amber-50 text-amber-700 px-2 py-0.5">Sin responder</span>
                )}
                {esDueno && !c.is_instructor && (
                  <form action={resolverComentario}>
                    <input type="hidden" name="comment_id" value={c.id} />
                    <input type="hidden" name="valor" value={c.resolved ? "0" : "1"} />
                    <button className="text-[11px] text-cx-texto-2 hover:text-cx-prof underline">
                      {c.resolved ? "Reabrir" : "Marcar como resuelta"}
                    </button>
                  </form>
                )}
              </div>
              {rs.length > 0 && (
                <div className="grid gap-3 pl-4 border-l-2 border-cx-celeste/40">
                  {rs.map((r) => (
                    <Burbuja key={r.id} c={r} />
                  ))}
                </div>
              )}
              <details className="group">
                <summary className="text-xs font-medium text-cx-prof cursor-pointer list-none hover:underline">
                  Responder
                </summary>
                <div className="mt-2">
                  <Formulario
                    serviceId={serviceId}
                    itemId={itemId}
                    parentId={c.id}
                    placeholder="Escribe tu respuesta…"
                    boton="Responder"
                  />
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </section>
  );
}
