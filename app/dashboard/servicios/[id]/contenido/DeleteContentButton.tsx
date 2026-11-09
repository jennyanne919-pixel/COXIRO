"use client";

import { BTN_ICON, Icon } from "@/components/dashboard/ui";

export default function DeleteContentButton({
  itemId,
  serviceId,
  deleteContentItem,
}: {
  itemId: string;
  serviceId: string;
  deleteContentItem: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={deleteContentItem}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este contenido? Tus clientes dejarán de verlo.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="service_id" value={serviceId} />
      <button
        title="Eliminar contenido"
        aria-label="Eliminar contenido"
        className={`${BTN_ICON} hover:!border-red-300 hover:!text-red-600`}
      >
        <Icon name="trash" className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
