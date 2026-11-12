"use client";

import { BTN_SECONDARY } from "@/components/dashboard/ui";

export default function CancelarButton({
  id,
  cancelar,
}: {
  id: string;
  cancelar: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={cancelar}
      onSubmit={(e) => {
        if (
          !confirm(
            "¿Dar de baja esta suscripción? No se cobrarán más cuotas. El cliente conservará el acceso hasta el final del periodo que ya ha pagado. No se reembolsa nada: los reembolsos los gestiona Coxiro."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={`${BTN_SECONDARY} hover:!border-red-300 hover:!text-red-600`}>
        Dar de baja
      </button>
    </form>
  );
}
