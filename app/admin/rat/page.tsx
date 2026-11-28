import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, Card, Badge } from "@/components/dashboard/ui";
import { RAT_RESPONSABLE, RAT_ACTIVIDADES } from "@/lib/legal/rat";

// Pone en negrita las etiquetas "Interesados:", "Datos:"... al inicio de cada frase.
function Texto({ texto }: { texto: string }) {
  const frases = texto.split(/(?<=\.) (?=[A-ZÁÉÍÓÚ])/);
  return (
    <div className="space-y-1.5">
      {frases.map((f, i) => {
        const m = f.match(/^([^:.]{3,40}):\s([\s\S]*)$/);
        return (
          <p key={i} className="text-sm text-cx-texto-2 leading-relaxed">
            {m ? (
              <>
                <strong className="text-cx-noche">{m[1]}:</strong> {m[2]}
              </>
            ) : (
              f
            )}
          </p>
        );
      })}
    </div>
  );
}

const ENCARGADOS = [
  ["Stripe", "Pagos y verificación de identidad", "Responsable independiente en sus obligaciones de fraude y blanqueo; EE. UU. posible"],
  ["Supabase", "Base de datos y autenticación", "Encargado; EE. UU. posible"],
  ["Vercel", "Alojamiento web", "Encargado; EE. UU. posible"],
  ["Cloudflare", "Almacenamiento de contenidos (R2)", "Encargado; EE. UU. posible"],
  ["Resend", "Correos transaccionales", "Encargado; EE. UU. posible"],
  ["Google", "Inicio de sesión con Google (solo si el usuario lo elige)", "Responsable independiente"],
];

export default async function RatPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Registro de tratamientos (RAT)"
        subtitle="Registro de actividades de tratamiento de datos personales de Coxiro. Documento interno."
      />

      <Card className="mb-4 p-4 text-sm text-cx-texto-2 space-y-2">
        <p>{RAT_RESPONSABLE}</p>
        <p className="flex items-center gap-2 flex-wrap">
          <Badge tone="ambar">Borrador del asesor</Badge>
          <span className="text-xs">
            Falta completarlo con los sistemas, países y garantías reales (tabla de abajo) y revisarlo una vez al año.
          </span>
        </p>
      </Card>

      <div className="grid gap-3">
        {RAT_ACTIVIDADES.map((a) => (
          <Card key={a.nombre} className="p-5">
            <h2 className="font-display text-base font-semibold text-cx-noche mb-2">{a.nombre}</h2>
            <Texto texto={a.texto} />
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-5">
        <h2 className="font-display text-base font-semibold text-cx-noche mb-1">Prestadores tecnológicos (para completar el RAT)</h2>
        <p className="text-xs text-cx-texto-2 mb-3">
          Los que figuran hoy en la política de privacidad publicada. Falta anotar por cada uno el país exacto, los
          subencargados y confirmar que el acuerdo de tratamiento de datos (DPA) está aceptado en la cuenta.
        </p>
        <ul className="divide-y divide-cx-borde">
          {ENCARGADOS.map(([nombre, funcion, nota]) => (
            <li key={nombre} className="py-2 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span>
                <strong className="text-cx-noche">{nombre}</strong> · {funcion}
              </span>
              <span className="text-xs text-cx-texto-2">{nota}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
