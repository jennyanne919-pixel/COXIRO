// Modelo económico de Coxiro (única fuente de verdad).
//
// El profesional fija el PRECIO BASE de su servicio (sin IVA). Ejemplo,
// servicio de 1.000 €:
//   - El cliente paga 1.000 + 21 % de IVA = 1.210 €
//   - Coxiro retiene 110 € (11 % del precio base): su comisión del 10 %
//     (100 €), más el IPSI de la operación (0,5 % = 5 €) y otro 0,5 %
//     (5 €) con el que Coxiro asume el coste del IPSI. Coxiro paga
//     el IPSI y se queda con un 10,5 % neto (105 €).
//   - El profesional recibe 1.210 - 110 = 1.100 € (exactamente un 10 %
//     más que el precio base).
//
// Todo se calcula en céntimos enteros para no arrastrar decimales.

export const IVA_PORCENTAJE = 21;
export const IPSI_PORCENTAJE = 0.5;
// Punto adicional que Coxiro retiene para asumir ella el IPSI, de modo que
// la comisión de Coxiro (10 %) no se vea reducida por ese impuesto.
export const IPSI_ASUMIDO_PORCENTAJE = 0.5;

export type Precios = {
  baseCents: number; // precio fijado por el profesional (sin IVA)
  totalCents: number; // lo que paga el cliente (IVA incluido)
  comisionCents: number; // comisión de Coxiro
  ipsiCents: number; // IPSI de la operación (lo paga Coxiro)
  ipsiAsumidoCents: number; // punto extra que retiene Coxiro por asumir el IPSI
  feeCents: number; // lo que retiene Coxiro (comisión + IPSI + ajuste)
  netoProveedorCents: number; // lo que recibe el profesional
};

export function calcularPrecios(precioBase: number, comisionPorcentaje: number): Precios {
  // El precio base puede llevar hasta 4 decimales (así un precio final
  // como 2.500,00 € se cobra exacto); los importes se redondean al céntimo.
  const baseExacta = precioBase * 100;
  const baseCents = Math.round(baseExacta);
  const totalCents = Math.round((baseExacta * (100 + IVA_PORCENTAJE)) / 100);
  const comisionCents = Math.round((baseExacta * comisionPorcentaje) / 100);
  const ipsiCents = Math.round((baseExacta * IPSI_PORCENTAJE) / 100);
  const ipsiAsumidoCents = Math.round((baseExacta * IPSI_ASUMIDO_PORCENTAJE) / 100);
  const feeCents = comisionCents + ipsiCents + ipsiAsumidoCents;
  return {
    baseCents,
    totalCents,
    comisionCents,
    ipsiCents,
    ipsiAsumidoCents,
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

// Precio base (sin impuestos) que hay que fijar para que el cliente pague
// exactamente "totalEuros". Se guarda con 4 decimales para que el total
// salga exacto al céntimo.
export function baseDesdeTotal(totalEuros: number): number {
  return Math.round((totalEuros / (1 + IVA_PORCENTAJE / 100)) * 10000) / 10000;
}
