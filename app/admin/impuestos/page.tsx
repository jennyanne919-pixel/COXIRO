import { requireAdmin } from "@/lib/admin/auth";
import { cargarAnio, resumir, leerPeriodo, hoyMadrid } from "@/lib/admin/contabilidad";
import { PageHeader, Card, fmtEur } from "@/components/dashboard/ui";
import Simulador from "./Simulador";

export default async function ImpuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { anio } = leerPeriodo({ a: sp.a, t: "0" });
  const datos = await cargarAnio(anio);
  const anioHoy = Number(hoyMadrid().slice(0, 4));
  const anios = [...new Set([2026, anioHoy])].sort();

  // Pago fraccionado (modelo 130): 20 % del beneficio acumulado del año
  // menos lo pagado en los trimestres anteriores. Estimación.
  let acumulado = 0;
  let pagado = 0;
  const filas = [1, 2, 3, 4].map((q) => {
    const r = resumir(datos, q);
    acumulado += r.beneficio;
    const pago = Math.max(0, Math.round((acumulado * 0.2 - pagado) * 100) / 100);
    pagado += pago;
    return { q, r, acumulado, pago };
  });
  const totalAnual = resumir(datos, 0);

  return (
    <>
      <PageHeader
        title="Impuestos y simulador"
        subtitle="Estimaciones orientativas para saber cuánto apartar y cómo va el año."
      />

      <div className="mb-6 flex gap-2">
        {anios.map((a) => (
          <a
            key={a}
            href={`/admin/impuestos?a=${a}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
              a === anio ? "bg-cx-noche text-white border-cx-noche" : "bg-white border-cx-borde text-cx-texto-2"
            }`}
          >
            {a}
          </a>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-cx-texto-2 border-b border-cx-borde">
              <th className="p-3 font-medium">Trimestre</th>
              <th className="p-3 font-medium text-right">Margen</th>
              <th className="p-3 font-medium text-right">Gastos</th>
              <th className="p-3 font-medium text-right">Beneficio</th>
              <th className="p-3 font-medium text-right">IPSI a pagar</th>
              <th className="p-3 font-medium text-right">IRPF a cuenta (130)</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(({ q, r, pago }) => (
              <tr key={q} className="border-b border-cx-borde last:border-0">
                <td className="p-3 font-medium">T{q}</td>
                <td className="p-3 text-right whitespace-nowrap">{fmtEur(r.margen)}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  {fmtEur(r.gastos + (r.stripeIncluido ? r.stripeEstimado : 0))}
                </td>
                <td className="p-3 text-right whitespace-nowrap">{fmtEur(r.beneficio)}</td>
                <td className="p-3 text-right whitespace-nowrap">{fmtEur(r.impuestoRepercutido)}</td>
                <td className="p-3 text-right whitespace-nowrap font-semibold">{fmtEur(pago)}</td>
              </tr>
            ))}
            <tr className="bg-cx-hielo/50 font-semibold">
              <td className="p-3">Año {anio}</td>
              <td className="p-3 text-right whitespace-nowrap">{fmtEur(totalAnual.margen)}</td>
              <td className="p-3 text-right whitespace-nowrap">
                {fmtEur(totalAnual.gastos + (totalAnual.stripeIncluido ? totalAnual.stripeEstimado : 0))}
              </td>
              <td className="p-3 text-right whitespace-nowrap">{fmtEur(totalAnual.beneficio)}</td>
              <td className="p-3 text-right whitespace-nowrap">{fmtEur(totalAnual.impuestoRepercutido)}</td>
              <td className="p-3 text-right whitespace-nowrap">{fmtEur(pagado)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card className="mt-4 p-5 text-sm text-cx-texto-2 space-y-2">
        <p className="font-medium text-cx-noche">Qué es cada columna y qué está por confirmar</p>
        <p>
          <strong>IRPF a cuenta:</strong> estimación del pago fraccionado (modelo 130): 20 % del
          beneficio acumulado del año menos lo pagado en trimestres anteriores. Se presenta hasta
          el día 20 de abril, julio y octubre, y hasta el 30 de enero.
        </p>
        <p>
          <strong>IPSI:</strong> es el que figura en las facturas a clientes y que Coxiro debe
          liquidar. Aquí solo se calcula cuánto apartar. Falta que el asesor confirme el modelo y
          el calendario con la Ciudad Autónoma.
        </p>
        <p>
          Pendiente de confirmar con el asesor: si la actividad se trata como compraventa o como
          intermediación, el tratamiento del impuesto soportado en los gastos, si hay que
          presentar el modelo 130 en este caso y si corresponde la deducción del 50 % por
          Melilla.
        </p>
      </Card>

      <h2 className="font-display font-bold text-lg text-cx-noche mt-10 mb-1">Simulador</h2>
      <p className="text-sm text-cx-texto-2 mb-4">
        Cambia los números y mira cuántas ventas hacen falta y cuánto quedaría. El IRPF usa una
        escala general aproximada; sirve para orientarse, no para declarar.
      </p>
      <Card className="p-5">
        <Simulador />
      </Card>
    </>
  );
}
