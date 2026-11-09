import { requireAdmin } from "@/lib/admin/auth";
import { cargarAnio, resumir, leerPeriodo, hoyMadrid } from "@/lib/admin/contabilidad";
import { PageHeader, Card, StatCard, fmtEur } from "@/components/dashboard/ui";
import SelectorPeriodo from "@/components/dashboard/SelectorPeriodo";

export default async function AdminResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; t?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { anio, trimestre } = leerPeriodo(sp);
  const datos = await cargarAnio(anio);
  const r = resumir(datos, trimestre);
  const anioHoy = Number(hoyMadrid().slice(0, 4));
  const anios = [...new Set([2026, anioHoy])].sort();

  return (
    <>
      <PageHeader
        title="Resumen de Coxiro"
        subtitle="Cifras calculadas con las facturas reales emitidas por la plataforma."
      />
      <SelectorPeriodo base="/admin" anio={anio} trimestre={trimestre} anios={anios} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Beneficio estimado"
          value={fmtEur(r.beneficio)}
          icon="trend"
          dark
          hint="Margen menos gastos"
          className="col-span-2 lg:col-span-1"
        />
        <StatCard label="Ventas (base)" value={fmtEur(r.ventasBase)} icon="cobros" hint={`${r.nVentas} ventas`} />
        <StatCard label="Margen bruto" value={fmtEur(r.margen)} icon="check" hint="Ventas menos pago a profesionales" />
        <StatCard label="Gastos" value={fmtEur(r.gastos + (r.stripeIncluido ? r.stripeEstimado : 0))} icon="bag" hint={r.stripeIncluido ? "Incluye Stripe estimado" : "Registrados"} />
        <StatCard label="IPSI a pagar" value={fmtEur(r.impuestoRepercutido)} icon="alert" hint="Aparta este importe" />
        <StatCard label="Cobrado a clientes" value={fmtEur(r.cobrado)} icon="clock" hint="Con impuestos incluidos" />
      </div>

      <Card className="mt-6 p-5 text-sm text-cx-texto-2 space-y-2">
        <p className="font-medium text-cx-noche">Cómo leer estas cifras</p>
        <p>
          <strong>Margen bruto</strong> = base facturada a clientes menos lo liquidado a los
          profesionales (facturas CLI menos facturas PROV). <strong>Beneficio</strong> = margen
          menos gastos deducibles.
        </p>
        {r.stripeIncluido && (
          <p>
            No has registrado comisiones de Stripe en este periodo, así que se resta una
            estimación de {fmtEur(r.stripeEstimado)} (1,5 % + 0,25 € por cobro con tarjeta
            europea). Si registras el gasto real en la categoría «Comisiones Stripe», se usa ese
            en su lugar.
          </p>
        )}
        <p>
          El criterio fiscal (compraventa o intermediación, tratamiento del IPSI) está pendiente
          de confirmar con el asesor: son cifras de gestión, no una declaración.
        </p>
      </Card>
    </>
  );
}
