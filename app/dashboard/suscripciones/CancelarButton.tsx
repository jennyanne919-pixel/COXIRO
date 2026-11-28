"use client";

import { BTN_SECONDARY } from "@/components/dashboard/ui";

export default function CancelarButton({
  id,
  cancelar,
  mensaje,
  etiqueta,
}: {
  id: string;
  cancelar: (formData: FormData) => Promise<void>;
  mensaje?: string;
  etiqueta?: string;
}) {
  return (
    <form
      action={cancelar}
      onSubmit={(e) => {
        if (
          !confirm(
            mensaje ??
              "¿Dar de baja esta suscripción? No se cobrarán más cuotas. El cliente conservará el acceso hasta el final del periodo que ya ha pagado. No se reembolsa nada: los reembolsos los gestiona Coxiro."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={`${BTN_SECONDARY} hover:!border-red-300 hover:!text-red-600`}>
        {etiqueta ?? "Dar de baja"}
      </button>
    </form>
  );
}
