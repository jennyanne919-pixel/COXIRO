"use client";

import type { ReactNode } from "react";

// Formulario con acción de servidor que pide confirmación antes de enviarse.
export default function ConfirmForm({
  action,
  fields,
  confirmText,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  confirmText: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
    </form>
  );
}
