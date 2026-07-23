import Logo from "@/components/Logo";

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <Logo />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 prose-sm">
        <div className="rounded-lg bg-copper/10 border border-copper/30 p-4 mb-8 text-sm">
          <strong>Borrador de trabajo</strong> — pendiente de validación final
          por un abogado especializado en consumo antes de considerarse
          vinculante. Última actualización: 22/07/2026.
        </div>

        <h1 className="text-2xl font-display font-semibold mb-6">
          Términos y Condiciones
        </h1>

        <h2 className="text-lg font-medium mt-8 mb-3">
          A) Condiciones para Proveedores (mentores / creadores de contenido)
        </h2>

        <h3 className="text-base font-medium mt-5 mb-2">
          1. Mandato de autofacturación
        </h3>
        <p className="text-sm text-stone leading-relaxed">
          El Proveedor autoriza de manera expresa y formal a COXIRO para que,
          en su nombre y representación, expida y emita las facturas,
          liquidaciones y/o documentos sustitutivos que documenten las ventas
          de servicios digitales, formaciones, mentorías o contenidos
          realizados a través de la plataforma, al amparo del Artículo 5 del
          Real Decreto 1619/2012, de 30 de noviembre. El Proveedor se
          compromete a aceptar cada una de las facturas emitidas por COXIRO
          en su nombre y a declarar la totalidad de los impuestos que se
          devenguen de sus ventas conforme a la legislación vigente.
        </p>

        <h3 className="text-base font-medium mt-5 mb-2">
          2. Responsabilidad sobre contenidos
        </h3>
        <p className="text-sm text-stone leading-relaxed">
          El Proveedor es responsable de la veracidad, legalidad, idoneidad,
          propiedad intelectual y calidad de los contenidos, formaciones,
          asesoramientos o servicios que preste a través de la plataforma. El
          Proveedor garantiza que cuenta con las titulaciones, licencias y
          autorizaciones requeridas para el ejercicio de su actividad.
        </p>
        <p className="text-sm text-stone leading-relaxed">
          COXIRO gestiona el cobro, la facturación y el acceso al contenido
          contratado, y podrá atender reclamaciones del Cliente relativas a
          la no prestación o deficiente prestación del servicio conforme a
          la normativa de consumo aplicable. En caso de que COXIRO deba
          reembolsar o compensar a un Cliente por causas imputables al
          Proveedor, COXIRO podrá repercutir dicho coste al Proveedor,
          descontándolo de liquidaciones presentes o futuras, o exigiendo su
          pago inmediato.
        </p>
        <p className="text-sm text-stone leading-relaxed">
          El Proveedor indemnizará a COXIRO frente a cualquier reclamación
          judicial o extrajudicial de terceros derivada del incumplimiento
          de sus obligaciones profesionales o normativas.
        </p>

        <h3 className="text-base font-medium mt-5 mb-2">
          3. Reembolsos, cancelaciones y contracargos
        </h3>
        <p className="text-sm text-stone leading-relaxed">
          El Proveedor asume el riesgo financiero asociado a devoluciones,
          reclamaciones, disputas y contracargos (chargebacks) relacionados
          con sus servicios. COXIRO notificará al Proveedor cada disputa
          antes de descontar su importe (incluyendo comisiones bancarias o
          de pasarela asociadas) de liquidaciones presentes o futuras, o de
          requerir su pago inmediato en caso de saldo insuficiente.
        </p>

        <h3 className="text-base font-medium mt-5 mb-2">
          4. Moderación y cumplimiento deontológico
        </h3>
        <p className="text-sm text-stone leading-relaxed">
          Coxiro no verifica de forma sistemática las titulaciones,
          colegiaciones o autorizaciones profesionales de los Proveedores.
          Cada Proveedor es responsable de cumplir la normativa y el código
          deontológico de su profesión. Coxiro se reserva el derecho de
          suspender o dar de baja a cualquier Proveedor ante indicios
          razonables de incumplimiento normativo o deontológico.
        </p>

        <h2 className="text-lg font-medium mt-10 mb-3">
          B) Condiciones para Clientes
        </h2>

        <p className="text-sm text-stone leading-relaxed">
          <strong>Objeto:</strong> Coxiro es una plataforma tecnológica que
          permite contratar servicios profesionales (formación, mentoría,
          asesoramiento) prestados por Proveedores independientes.
        </p>
        <p className="text-sm text-stone leading-relaxed">
          <strong>Precio y pago:</strong> el precio se abona a través de la
          plataforma mediante los medios de pago habilitados. La factura es
          emitida por Coxiro.
        </p>
        <p className="text-sm text-stone leading-relaxed">
          <strong>Derecho de desistimiento:</strong> el Cliente dispone de
          14 días naturales desde la contratación para desistir del servicio
          sin necesidad de justificación, salvo que haya solicitado
          expresamente el inicio de la prestación antes de dicho plazo y
          reconozca perder este derecho una vez el servicio se haya
          ejecutado completamente (art. 103.a TRLGDCU).
        </p>
        <p className="text-sm text-stone leading-relaxed">
          <strong>Calidad del servicio:</strong> el contenido y la
          prestación efectiva del servicio corresponde al Proveedor. Coxiro
          gestiona el cobro, la facturación, el acceso a la plataforma y
          atiende las reclamaciones relativas al servicio contratado.
        </p>
        <p className="text-sm text-stone leading-relaxed">
          <strong>Reembolsos:</strong> en caso de servicio no prestado o
          defectuoso, el Cliente puede solicitar reembolso a través del
          canal de soporte de Coxiro.
        </p>
        <p className="text-sm text-stone leading-relaxed">
          <strong>Fuero:</strong> legislación española; para consumidores,
          los tribunales del domicilio del consumidor, sin perjuicio de la
          plataforma europea de resolución de litigios en línea.
        </p>
      </div>
    </main>
  );
}
