// Cálculo ORIENTATIVO del IRPF de un autónomo. No sustituye al asesor:
// la escala es la general combinada (estatal + autonómica por defecto) y
// no incluye gastos de difícil justificación, reducciones ni deducciones
// salvo la opcional del 50 % de Melilla (art. 68.4 LIRPF), que está
// pendiente de confirmar con el asesor para el caso de Coxiro.

const TRAMOS: [number, number][] = [
  [12450, 0.19],
  [20200, 0.24],
  [35200, 0.3],
  [60000, 0.37],
  [300000, 0.45],
  [Infinity, 0.47],
];

const MINIMO_PERSONAL = 5550;

function aplicarEscala(base: number) {
  let resto = Math.max(0, base);
  let previo = 0;
  let cuota = 0;
  for (const [limite, tipo] of TRAMOS) {
    const tramo = Math.min(resto, limite - previo);
    if (tramo <= 0) break;
    cuota += tramo * tipo;
    resto -= tramo;
    previo = limite;
  }
  return cuota;
}

export function irpfEstimado(baseLiquidable: number, deduccionMelilla: boolean) {
  const cuota = Math.max(0, aplicarEscala(baseLiquidable) - aplicarEscala(MINIMO_PERSONAL));
  return deduccionMelilla ? cuota * 0.5 : cuota;
}
