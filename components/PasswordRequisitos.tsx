"use client";

import { requisitosPassword } from "@/lib/password";

// Lista de requisitos que se van marcando mientras se escribe la contraseña.
export default function PasswordRequisitos({ password }: { password: string }) {
  const reqs = requisitosPassword(password);
  return (
    <ul className="grid gap-0.5 text-xs" aria-live="polite">
      {reqs.map((r) => (
        <li key={r.id} className={r.cumple ? "text-green-700" : "text-stone"}>
          <span aria-hidden="true">{r.cumple ? "✓" : "○"}</span> {r.texto}
        </li>
      ))}
    </ul>
  );
}
