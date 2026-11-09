import { NextResponse } from "next/server";
import { adminOrNull } from "@/lib/admin/auth";
import { cargarAnio, enTrimestre, leerPeriodo } from "@/lib/admin/contabilidad";

export const dynamic = "force-dynamic";

// CSV para el asesor: separador ";" y coma decimal, para que Excel en
// español lo abra bien. Se neutralizan celdas que empiecen por = + - @
// (inyección de fórmulas).
const num = (n: number) => n.toFixed(2).replace(".", ",");
const txt = (v: string | null | undefined) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  if (!(await adminOrNull())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") === "gastos" ? "gastos" : "ingresos";
  const { anio, trimestre } = leerPeriodo({
    a: searchParams.get("a") ?? undefined,
    t: searchParams.get("t") ?? undefined,
  });
  const datos = await cargarAnio(anio);

  const lineas: string[] = [];
  if (tipo === "ingresos") {
    lineas.push(["Fecha", "Factura", "Tipo", "Cliente/Profesional", "Base", "Tipo %", "Impuesto", "Total"].join(";"));
    datos.facturas
      .filter((f) => enTrimestre(f.fecha, anio, trimestre))
      .forEach((f) =>
        lineas.push(
          [
            f.fecha,
            txt(f.invoice_number),
            f.type === "client_invoice" ? "Venta" : "Liquidación a profesional",
            txt(f.type === "client_invoice" ? f.recipient_name : f.issuer_name),
            num(f.tax_base),
            num(f.tax_rate),
            num(f.tax_amount),
            num(f.total),
          ].join(";")
        )
      );
  } else {
    lineas.push(["Fecha", "Concepto", "Proveedor", "Categoría", "Base", "Impuesto", "Total", "Deducible"].join(";"));
    datos.gastos
      .filter((g) => enTrimestre(g.fecha, anio, trimestre))
      .forEach((g) =>
        lineas.push(
          [g.fecha, txt(g.concepto), txt(g.proveedor), txt(g.categoria), num(g.base), num(g.cuota), num(g.total), g.deducible ? "Sí" : "No"].join(";")
        )
      );
  }

  const nombre = `coxiro-${tipo}-${anio}${trimestre ? `-T${trimestre}` : ""}.csv`;
  return new NextResponse("﻿" + lineas.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "no-store",
    },
  });
}
