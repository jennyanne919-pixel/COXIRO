"use client";

import { useFormStatus } from "react-dom";

// Botón de envío que se bloquea mientras el formulario se procesa, para que
// nadie lo pulse varias veces (registro y login tardan unos segundos).
export default function SubmitButton({
  className,
  children,
  pendingText,
  disabled,
}: {
  className: string;
  children: React.ReactNode;
  pendingText: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${className} ${pending ? "opacity-70 cursor-wait" : ""}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
