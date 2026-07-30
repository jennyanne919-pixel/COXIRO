import Logo from "@/components/Logo";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <Logo />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="rounded-lg bg-copper/10 border border-copper/30 p-4 mb-8 text-sm">
          <strong>Borrador de trabajo</strong> — pendiente de validación final
          por un abogado de protección de datos. Última actualización:
          22/07/2026.
        </div>

        <h1 className="text-2xl font-display font-semibold mb-6">
          Política de Privacidad
        </h1>

        <p className="text-sm text-stone leading-relaxed mb-4">
          <strong>Responsable del tratamiento:</strong> Jenny Anne Abriam
          (nombre comercial: Coxiro), Melilla, España.
        </p>

        <p className="text-sm text-stone leading-relaxed mb-4">
          <strong>Finalidades:</strong> gestión de cuenta de usuario (Cliente
          o Proveedor), procesamiento de pagos, emisión de facturas,
          comunicaciones relacionadas con el servicio, y (si se activa)
          comunicaciones comerciales previo consentimiento.
        </p>

        <p className="text-sm text-stone leading-relaxed mb-4">
          <strong>Base legal:</strong> ejecución del contrato de prestación
          de servicios (art. 6.1.b RGPD); consentimiento para comunicaciones
          comerciales (art. 6.1.a); interés legítimo para prevención de
          fraude.
        </p>

        <p className="text-sm text-stone leading-relaxed mb-4">
          <strong>Destinatarios/encargados de tratamiento:</strong> Stripe
          (procesamiento de pagos), Supabase (alojamiento de base de datos y
          autenticación) — con garantías adecuadas para transferencias
          internacionales cuando corresponda (cláusulas contractuales tipo
          de la Comisión Europea).
        </p>

        <p className="text-sm text-stone leading-relaxed mb-4">
          <strong>Plazo de conservación:</strong> mientras dure la relación
          contractual y los plazos legales de conservación de documentación
          fiscal (4-6 años según normativa aplicable).
        </p>

        <p className="text-sm text-stone leading-relaxed mb-4">
          <strong>Derechos:</strong> acceso, rectificación, supresión,
          oposición, limitación y portabilidad, ejercitables escribiendo a{" "}
          <a href="mailto:coxiro.info@gmail.com" className="text-ink underline">
            coxiro.info@gmail.com
          </a>
          . Derecho a reclamar ante la Agencia Española de Protección de
          Datos.
        </p>

        <p className="text-sm text-stone leading-relaxed">
          <strong>Cookies:</strong> actualmente Coxiro utiliza únicamente
          cookies técnicas necesarias para el funcionamiento de la
          plataforma (sesión, autenticación). No se utilizan cookies de
          analítica ni publicidad en esta fase.
        </p>
      </div>
    </main>
  );
}
