"use client";

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
      <button className="text-xs text-red-600 hover:underline">Eliminar</button>
    </form>
  );
}
