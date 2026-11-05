import type { Metadata } from "next";
import Logo from "@/components/Logo";
import LegalDoc from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Política de cookies — Coxiro",
};

// Texto legal publicado tal cual desde el .md oficial (versión 2026-11-05).
// No editar aquí a mano: si cambia el texto, se regenera desde el .md.
const HTML = "<p><strong>COXIRO</strong></p>\n<p><strong>Política de Cookies</strong></p>\n<p>Última actualización: 5 de noviembre de 2026</p>\n<h2>1. Qué son las cookies</h2>\n<p>Son pequeños archivos que el sitio web guarda en su navegador para funcionar o para recordar información sobre su visita.</p>\n<h2>2. Cookies que utiliza COXIRO</h2>\n<p>Actualmente COXIRO solo utiliza cookies técnicas, necesarias para que la plataforma funcione, y el almacenamiento local del navegador con la misma finalidad. Están exentas de consentimiento (art. 22.2 LSSI) y no se usan para analítica ni publicidad.</p>\n<div class=\"tabla\"><table>\n<thead>\n<tr>\n<th><strong>Cookie</strong></th>\n<th><strong>Titular</strong></th>\n<th><strong>Finalidad</strong></th>\n<th><strong>Duración</strong></th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>sb-…-auth-token</td>\n<td>COXIRO (Supabase)</td>\n<td>Mantener la sesión iniciada</td>\n<td>Sesión / hasta cerrar sesión</td>\n</tr>\n<tr>\n<td>__stripe_mid, __stripe_sid</td>\n<td>Stripe</td>\n<td>Procesar el pago de forma segura y prevenir el fraude</td>\n<td>1 año / 30 minutos</td>\n</tr>\n<tr>\n<td>Cookies de Google</td>\n<td>Google</td>\n<td>Inicio de sesión con Google, solo si el usuario lo elige</td>\n<td>Según Google</td>\n</tr>\n</tbody>\n</table></div>\n<h2>3. Cómo desactivarlas</h2>\n<p>Puede borrar o bloquear las cookies desde la configuración de su navegador. Si bloquea las cookies técnicas, es posible que no pueda iniciar sesión ni completar una compra.</p>\n<h2>4. Cambios</h2>\n<p>Si COXIRO incorpora cookies de analítica o publicidad, actualizará esta política y mostrará un banner que permitirá aceptarlas o rechazarlas con la misma facilidad antes de instalarlas.</p>";

export default function Page() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-stone/20 bg-paper">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" aria-label="Volver al inicio">
            <Logo variant="light" />
          </a>
        </div>
      </header>
      <LegalDoc html={HTML} />
    </main>
  );
}
