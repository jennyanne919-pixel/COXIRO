"use client";

import { BTN_ICON, Icon } from "@/components/dashboard/ui";

export default function DeleteServiceButton({
  id,
  deleteService,
  tieneVentas = false,
}: {
  id: string;
  deleteService: (formData: FormData) => Promise<void>;
  tieneVentas?: boolean;
}) {
  return (
    <form
      action={deleteService}
      onSubmit={(e) => {
        if (
          !confirm(
            tieneVentas
              ? "Este servicio ya tiene ventas, así que no se borra del todo: se archiva. Dejará de aparecer y de venderse, y quienes ya lo compraron conservarán su acceso. ¿Archivarlo?"
              : "¿Seguro que quieres eliminar este servicio? Se borrará también su contenido. Esta acción no se puede deshacer."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        title={tieneVentas ? "Archivar servicio" : "Eliminar servicio"}
        aria-label={tieneVentas ? "Archivar servicio" : "Eliminar servicio"}
        className={`${BTN_ICON} hover:!border-red-300 hover:!text-red-600`}
      >
        <Icon name="trash" className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
