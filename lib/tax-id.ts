// Validación de identificadores fiscales españoles (NIF, NIE y CIF),
// con comprobación del dígito/letra de control.

const LETRAS_NIF = "TRWAGMYFPDXBNJZSQVHLCKE";

export function normalizarTaxId(valor: string): string {
  return (valor ?? "").toUpperCase().replace(/[\s.\-_/]/g, "");
}

export function esNifOrNie(valor: string): boolean {
  const v = normalizarTaxId(valor);
  if (/^[0-9]{8}[A-Z]$/.test(v)) {
    return LETRAS_NIF[parseInt(v.slice(0, 8), 10) % 23] === v[8];
  }
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(v)) {
    const num = "XYZ".indexOf(v[0]) + v.slice(1, 8);
    return LETRAS_NIF[parseInt(num, 10) % 23] === v[8];
  }
  return false;
}

export function esCif(valor: string): boolean {
  const v = normalizarTaxId(valor);
  if (!/^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/.test(v)) return false;
  const digitos = v.slice(1, 8).split("").map(Number);
  let suma = 0;
  digitos.forEach((d, i) => {
    if (i % 2 === 0) {
      const doble = d * 2;
      suma += Math.floor(doble / 10) + (doble % 10);
    } else {
      suma += d;
    }
  });
  const control = (10 - (suma % 10)) % 10;
  const letra = "JABCDEFGHI"[control];
  const tipo = v[0];
  const ultimo = v[8];
  // Sociedades que usan letra de control: K, P, Q, R, S, N, W.
  if ("KPQRSNW".includes(tipo)) return ultimo === letra;
  // Las de dígito de control: A, B, E, H.
  if ("ABEH".includes(tipo)) return ultimo === String(control);
  return ultimo === String(control) || ultimo === letra;
}

export function esTaxIdValido(valor: string, sociedad: boolean): boolean {
  return sociedad ? esCif(valor) : esNifOrNie(valor);
}
