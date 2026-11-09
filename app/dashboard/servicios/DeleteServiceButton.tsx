"use client";

import { BTN_ICON, Icon } from "@/components/dashboard/ui";

export default function DeleteServiceButton({
  id,
  deleteService,
}: {
  id: string;
  deleteService: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={deleteService}
      onSubmit={(e) => {
        if (
          !confirm(
            "¿Seguro que quieres eliminar este servicio? Esta acción no se puede deshacer."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        title="Eliminar servicio"
        aria-label="Eliminar servicio"
        className={`${BTN_ICON} hover:!border-red-300 hover:!text-red-600`}
      >
        <Icon name="trash" className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
