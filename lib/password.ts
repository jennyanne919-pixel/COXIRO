// Requisitos de contraseña de Coxiro (una sola fuente de verdad, se usa
// tanto en los formularios como en el servidor).

export const PASSWORD_MIN = 8;

export type Requisito = { id: string; texto: string; cumple: boolean };

export function requisitosPassword(p: string): Requisito[] {
  return [
    { id: "len", texto: `Al menos ${PASSWORD_MIN} caracteres`, cumple: p.length >= PASSWORD_MIN },
    { id: "may", texto: "Una letra mayúscula", cumple: /[A-ZÁÉÍÓÚÑÜ]/.test(p) },
    { id: "min", texto: "Una letra minúscula", cumple: /[a-záéíóúñü]/.test(p) },
    { id: "num", texto: "Un número", cumple: /[0-9]/.test(p) },
    { id: "sim", texto: "Un símbolo (por ejemplo ! ? # $ % & *)", cumple: /[^A-Za-z0-9ÁÉÍÓÚÑÜáéíóúñü\s]/.test(p) },
  ];
}

export function passwordValida(p: string): boolean {
  return requisitosPassword(p).every((r) => r.cumple);
}

export const MENSAJE_PASSWORD =
  "La contraseña debe tener al menos 8 caracteres, con una mayúscula, una minúscula, un número y un símbolo.";
