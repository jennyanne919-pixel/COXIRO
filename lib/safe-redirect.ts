// Solo se permiten redirecciones a rutas internas del propio sitio
// ("/dashboard", "/contenido/abc"). Evita que un enlace de login
// manipulado (?next=https://sitio-falso.com o ?next=@sitio-falso.com)
// mande al usuario a otra web justo después de iniciar sesión.
export function rutaInternaSegura(valor: string | null | undefined, porDefecto = "/dashboard"): string {
  if (!valor) return porDefecto;
  if (!valor.startsWith("/")) return porDefecto;
  if (valor.startsWith("//") || valor.startsWith("/\\")) return porDefecto;
  if (/[\r\n]/.test(valor)) return porDefecto;
  return valor;
}
