import Logo from "@/components/Logo";

export default function AvisoLegalPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="px-8 py-5">
        <Logo />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="rounded-lg bg-copper/10 border border-copper/30 p-4 mb-8 text-sm">
          <strong>Borrador de trabajo</strong> — pendiente de validación
          final. Última actualización: 22/07/2026.
        </div>

        <h1 className="text-2xl font-display font-semibold mb-6">
          Aviso Legal
        </h1>

        <p className="text-sm text-stone leading-relaxed mb-4">
          En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de
          la Información y Comercio Electrónico, se informa:
        </p>

        <ul className="text-sm text-stone leading-relaxed list-disc pl-5 space-y-1 mb-4">
          <li>
            <strong>Titular:</strong> Jenny Anne Abriam (nombre comercial:
            Coxiro).
          </li>
          <li>
            <strong>NIF:</strong> Y8056216C.
          </li>
          <li>
            <strong>Domicilio:</strong> Grupo Gómez Jordana, Melilla, España.
          </li>
          <li>
            <strong>Email de contacto:</strong> info.coxiro@gmail.com.
          </li>
          <li>
            <strong>Epígrafe IAE:</strong> 849.9 — Otros servicios
            independientes N.C.O.P.
          </li>
          <li>
            <strong>Objeto:</strong> intermediación tecnológica para la
            contratación de servicios profesionales online.
          </li>
        </ul>

        <p className="text-sm text-stone leading-relaxed">
          El acceso y uso del sitio web atribuye la condición de usuario y
          acepta las presentes condiciones. Los contenidos, marca y diseño
          de Coxiro son propiedad de su titular, salvo los contenidos
          aportados por cada Proveedor, cuya propiedad intelectual
          corresponde a este.
        </p>
      </div>
    </main>
  );
}
