import { cambiarVista } from "@/lib/admin/vista-actions";

// Interruptor para administradores: saltar entre panel de administración,
// de proveedor y de cliente con la misma cuenta.
export default function CambiarVista({
  actual,
  className = "",
}: {
  actual: "admin" | "proveedor" | "cliente";
  className?: string;
}) {
  const opciones: { v: "admin" | "proveedor" | "cliente"; label: string }[] = [
    { v: "admin", label: "Administración" },
    { v: "proveedor", label: "Panel de proveedor" },
    { v: "cliente", label: "Panel de cliente" },
  ];
  return (
    <div className={className}>
      <p className="px-3 pb-1 text-[10px] uppercase tracking-wide text-cx-celeste">Ver como</p>
      <form action={cambiarVista} className="flex flex-col gap-1">
        {opciones.map((o) => (
          <button
            key={o.v}
            name="vista"
            value={o.v}
            disabled={o.v === actual}
            className={`text-left text-xs rounded-lg px-3 py-1.5 transition ${
              o.v === actual
                ? "bg-white/10 text-white font-medium cursor-default"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </form>
    </div>
  );
}
