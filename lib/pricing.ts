// Modelo económico de Coxiro (única fuente de verdad).
//
// El profesional fija el PRECIO BASE de su servicio (sin IVA). Ejemplo,
// servicio de 1.000 €:
//   - El cliente paga 1.000 + 21 % de IVA = 1.210 €
//   - Coxiro retiene su comisión (10 % del precio base = 100 €) más el
//     IPSI de la operación (0,5 % del precio base = 5 €) = 105 €
//   - El profesional recibe 1.210 - 105 = 1.105 €
//
// Todo se calcula en céntimos enteros para no arrastrar decimales.

export const IVA_PORCENTAJE = 21;
export const IPSI_PORCENTAJE = 0.5;

export type Precios = {
  baseCents: number; // precio fijado por el profesional (sin IVA)
  totalCents: number; // lo que paga el cliente (IVA incluido)
  comisionCents: number; // comisión de Coxiro
  ipsiCents: number; // IPSI de la operación
  feeCents: number; // lo que retiene Coxiro (comisión + IPSI)
  netoProveedorCents: number; // lo que recibe el profesional
};

export function calcularPrecios(precioBase: number, comisionPorcentaje: number): Precios {
  const baseCents = Math.round(precioBase * 100);
  const totalCents = Math.round((baseCents * (100 + IVA_PORCENTAJE)) / 100);
  const comisionCents = Math.round((baseCents * comisionPorcentaje) / 100);
  const ipsiCents = Math.round((baseCents * IPSI_PORCENTAJE) / 100);
  const feeCents = comisionCents + ipsiCents;
  return {
    baseCents,
    totalCents,
    comisionCents,
    ipsiCents,
    feeCents,
    netoProveedorCents: totalCents - feeCents,
  };
}

// Precio que ve y paga el cliente, en euros (IVA incluido).
export function totalCliente(precioBase: number): number {
  return calcularPrecios(precioBase, 0).totalCents / 100;
}

// Lo que retiene Coxiro (en euros) sobre un cobro ya hecho de
// "totalEuros" (IVA incluido). Se usa en los cobros recurrentes, donde
// solo conocemos el importe total de la factura de Stripe.
export function feeDesdeTotal(totalEuros: number, comisionPorcentaje: number): number {
  const baseEuros = totalEuros / (1 + IVA_PORCENTAJE / 100);
  return calcularPrecios(baseEuros, comisionPorcentaje).feeCents / 100;
}
