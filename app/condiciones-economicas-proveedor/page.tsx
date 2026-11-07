import type { Metadata } from "next";
import Logo from "@/components/Logo";
import LegalDoc from "@/components/LegalDoc";
import { CONDICIONES_VERSION } from "@/lib/condiciones";

// Página no pública: no indexada, no enlazada desde el menú ni el pie,
// y excluida en robots.ts. Se muestra dentro del alta del proveedor y
// desde su panel privado. Si cambia el texto, subir CONDICIONES_VERSION.
export const metadata: Metadata = {
  title: "Condiciones económicas del proveedor — Coxiro",
  robots: { index: false, follow: false },
};

const HTML = `
<p><strong>COXIRO</strong></p>
<p><strong>Condiciones económicas del Proveedor</strong></p>
<p>Versión ${CONDICIONES_VERSION}. Este documento forma parte de los Términos y Condiciones de COXIRO, a los que se incorpora por referencia (cláusula 4.2).</p>

<h2>1. Cómo funciona</h2>
<p>1.1. COXIRO adquiere el servicio al Proveedor y lo revende al Cliente final en nombre propio, gestionando el cobro, la facturación y el acceso. Como contraprestación, el Proveedor recibe el precio de adquisición que se indica en la cláusula 2.</p>

<h2>2. Precio de adquisición</h2>
<p>2.1. El Proveedor fija el precio base de su servicio (sin impuestos). COXIRO le abona ese precio base incrementado en un 10 %.</p>
<p>2.2. Ejemplo ilustrativo: servicio con precio base de 1.000 €. El Cliente paga el precio base más los impuestos que correspondan (1.210 €). El Proveedor recibe 1.100 €.</p>
<p>2.3. Este esquema se aplica a las ventas a Clientes particulares. Si COXIRO habilita otros tipos de venta, comunicará al Proveedor las condiciones que correspondan antes de aplicarlas.</p>
<p>2.4. COXIRO asume los costes de procesamiento del pago y de la plataforma. El Proveedor no paga cuotas de alta ni mensualidades por usar COXIRO.</p>

<h2>3. Plazo de pago</h2>
<p>3.1. COXIRO abona cada venta al Proveedor a los 7 días naturales de realizarse, mediante transferencia a la cuenta que haya vinculado en Stripe. En membresías y suscripciones, el mismo plazo se aplica a cada cuota.</p>
<p>3.2. Se mantienen las excepciones de los Términos: retrasos de Stripe o de entidades bancarias (cláusula 10.3) y retenciones por fraude o incumplimiento grave (cláusula 11.5).</p>

<h2>4. Facturación</h2>
<p>4.1. COXIRO emite, en nombre y por cuenta del Proveedor, la factura por el precio de adquisición (facturación por el destinatario, art. 5 del Real Decreto 1619/2012), y la pone a su disposición en su panel privado.</p>
<p>4.2. El Proveedor dispone de 15 días desde su emisión para comunicar que no está conforme. Pasado ese plazo, la factura se entiende aceptada (cláusula 12.3 de los Términos).</p>

<h2>5. Reembolsos, desistimientos y contracargos</h2>
<p>5.1. Si COXIRO reembolsa al Cliente (por desistimiento, reclamación o contracargo), podrá recuperar del Proveedor el importe de adquisición correspondiente, incluso revirtiendo la transferencia ya realizada a su cuenta de Stripe.</p>
<p>5.2. Si el Proveedor ya hubiera dispuesto de esos fondos, abonará la diferencia en los 15 días siguientes a la comunicación de COXIRO (cláusula 11.3 de los Términos).</p>

<h2>6. Cambios en estas condiciones</h2>
<p>6.1. COXIRO podrá modificarlas comunicándolo con 15 días de antelación. Los cambios no afectan a las ventas ya realizadas. Si el Proveedor no está de acuerdo, puede darse de baja con el preaviso de la cláusula 4.4 de los Términos.</p>
<p>6.2. Las condiciones particulares pactadas por escrito entre COXIRO y un Proveedor prevalecen sobre estas.</p>

<h2>7. Prueba de la aceptación</h2>
<p>7.1. Al aceptar, COXIRO guarda la fecha y hora, la versión de este documento, la dirección IP y la comisión vigente, como prueba de la aceptación, durante 6 años. Puedes consultar estas condiciones en cualquier momento desde tu panel.</p>
`;

export default function Page() {
  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="border-b border-cx-borde bg-cx-hielo">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" aria-label="Volver al inicio">
            <Logo variant="light" />
          </a>
        </div>
      </header>
      <LegalDoc html={HTML} />
    </main>
  );
}
