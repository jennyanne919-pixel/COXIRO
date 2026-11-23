import type { Metadata } from "next";
import Logo from "@/components/Logo";
import LegalDoc from "@/components/LegalDoc";
import { CONDICIONES_VERSION } from "@/lib/condiciones";
import {
  CATEGORIAS,
  CONDICIONES_CATEGORIA_VERSION,
  CRITERIO_CLASIFICACION,
  esCategoria,
  type AjusteCategoria,
  type Categoria,
} from "@/lib/categorias";
import { cargarAjustes } from "@/lib/ajustes";

// Página no pública: no indexada, no enlazada desde el menú ni el pie,
// y excluida en robots.ts. Se muestra dentro del alta del proveedor y
// desde su panel privado. Si cambia el texto, subir CONDICIONES_VERSION.
export const metadata: Metadata = {
  title: "Condiciones económicas del proveedor — Coxiro",
  robots: { index: false, follow: false },
};

const HTML_ANTERIOR = `
<p><strong>COXIRO</strong></p>
<p><strong>Condiciones económicas del Proveedor</strong></p>
<p>Versión ${CONDICIONES_VERSION}. Este documento forma parte de los Términos y Condiciones de COXIRO, a los que se incorpora por referencia (cláusula 4.2).</p>

<h2>1. Cómo funciona</h2>
<p>1.1. COXIRO adquiere el servicio al Proveedor y lo revende al Cliente final en nombre propio, gestionando el cobro, la facturación y el acceso. Como contraprestación, el Proveedor recibe el precio de adquisición que se indica en la cláusula 2.</p>

<h2>2. Precio de adquisición</h2>
<p>2.1. El Proveedor fija el precio base de su servicio (sin impuestos). COXIRO le abona ese precio base incrementado en un 10 %.</p>
<p>2.2. Ejemplo ilustrativo: servicio con precio base de 500 €. El Cliente paga el precio base más los impuestos que correspondan (605 €). El Proveedor recibe 550 €.</p>
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


// Texto por categoría (fase 44). Se mantiene la estructura y la numeración del
// documento anterior; cambian la cláusula 2 (precio) y se añade la 8 (clasificación).
function htmlCategoria(c: Categoria, a: AjusteCategoria) {
  const cat = CATEGORIAS[c];
  const pct = String(a.porcentaje).replace(".", ",");
  const recibe500 = a.modo === "gancho" ? 500 * (1 + a.porcentaje / 100) : 500 * (1 - a.porcentaje / 100);
  const eur500 = recibe500.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const precio =
    c === "formacion"
      ? `<p>2.1. El Proveedor fija el precio de su servicio con los impuestos incluidos. El precio sin impuestos es ese precio dividido entre 1,21. COXIRO abona al Proveedor ese precio sin impuestos <strong>menos un ${pct} %</strong>, por los servicios de plataforma (cobro, facturación y acceso).</p>
<p>2.2. Ejemplo ilustrativo: servicio con precio sin impuestos de 500 €. El Cliente paga 605 €. El Proveedor recibe ${eur500} € (500 € menos el ${pct} %).</p>`
      : `<p>2.1. El Proveedor fija el precio de su servicio con los impuestos incluidos. El precio sin impuestos es ese precio dividido entre 1,21. COXIRO abona al Proveedor ese precio sin impuestos <strong>más un ${pct} %</strong>.</p>
<p>2.2. Ejemplo ilustrativo: servicio con precio sin impuestos de 500 €. El Cliente paga 605 €. El Proveedor recibe ${eur500} € (500 € más el ${pct} %).</p>`;
  const criterio = CRITERIO_CLASIFICACION.map((t) => `<li>${t}</li>`).join("");
  return `
<p><strong>COXIRO</strong></p>
<p><strong>Condiciones económicas del Proveedor — ${cat.nombre}</strong></p>
<p>Versión ${CONDICIONES_CATEGORIA_VERSION}. Este documento forma parte de los Términos y Condiciones de COXIRO, a los que se incorpora por referencia (cláusula 4.2). Corresponde a la categoría <strong>${cat.nombre}</strong>.</p>

<h2>1. Cómo funciona</h2>
<p>1.1. COXIRO adquiere el servicio al Proveedor y lo revende al Cliente final en nombre propio, gestionando el cobro, la facturación y el acceso. Como contraprestación, el Proveedor recibe el precio de adquisición que se indica en la cláusula 2.</p>

<h2>2. Precio de adquisición</h2>
${precio}
<p>2.3. Este esquema se aplica a las ventas a Clientes particulares. Si COXIRO habilita otros tipos de venta, comunicará al Proveedor las condiciones que correspondan antes de aplicarlas.</p>
<p>2.4. COXIRO asume los costes ordinarios de procesamiento del pago y de la plataforma. El Proveedor no paga cuotas de alta ni mensualidades por usar COXIRO.</p>
<p>2.5. La fórmula determina solo el precio de adquisición pactado entre COXIRO y el Proveedor. No equivale al precio final de venta al Cliente ni garantiza a COXIRO un margen determinado.</p>

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
<p>6.1. COXIRO podrá modificarlas, incluidos los porcentajes de la cláusula 2, comunicándolo con 15 días de antelación. Los cambios no afectan a las ventas ya realizadas. Si el Proveedor no está de acuerdo, puede darse de baja con el preaviso de la cláusula 4.4 de los Términos.</p>
<p>6.2. Las condiciones particulares pactadas por escrito entre COXIRO y un Proveedor prevalecen sobre estas.</p>

<h2>7. Prueba de la aceptación</h2>
<p>7.1. Al aceptar, COXIRO guarda la fecha y hora, la versión de este documento, la categoría, tu declaración responsable, la dirección IP y la comisión vigente, como prueba de la aceptación, durante 6 años. Puedes consultar estas condiciones en cualquier momento desde tu panel.</p>

<h2>8. Clasificación de cada servicio</h2>
<p>8.1. Los servicios se clasifican en dos categorías: <strong>Formación y cursos</strong> (servicios con temario, programa o módulos, o que consisten en impartir clases o lecciones, grabadas o en directo) y <strong>Mentoría, consultoría y desarrollo personal</strong> (acompañamiento individual o en grupo, sin programa ni temario fijo). Esta cuenta está en la categoría <strong>${cat.nombre}</strong>.</p>
<p>8.2. Criterio de clasificación:</p>
<ul>${criterio}</ul>
<p>8.3. El Proveedor declara la categoría de su servicio conforme a este criterio y es responsable de que sea correcta. COXIRO revisa cada servicio de la categoría Mentoría, consultoría y desarrollo personal antes de publicarlo, y puede aprobarlo o reclasificarlo.</p>
<p>8.4. Si COXIRO comprueba que un servicio no corresponde a la categoría declarada, podrá reclasificarlo con aviso motivado y un plazo de 15 días para que el Proveedor alegue. La reclasificación aplica las condiciones de la categoría resultante desde la fecha de la comunicación.</p>
<p>8.5. Si una clasificación incorrecta causa a COXIRO un coste fiscal acreditado, COXIRO podrá reclamarlo al Proveedor con el cálculo correspondiente, y el Proveedor podrá oponerse por escrito. No habrá compensación automática ni reducción unilateral de remuneraciones ya devengadas.</p>
<p>8.6. Las actividades sanitarias, jurídicas, financieras u otras reservadas por la ley solo se aceptan con la habilitación que la ley exija. Llamar «mentoría» a una actividad no la excluye de su regulación.</p>
`;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const sp = await searchParams;
  // Sin ?categoria= se muestra la versión anterior (profesionales ya registrados
  // que la aceptaron). Con ?categoria=formacion|mentoria, el texto de esa categoría.
  const html = esCategoria(sp.categoria) ? htmlCategoria(sp.categoria, (await cargarAjustes())[sp.categoria]) : HTML_ANTERIOR;
  return (
    <main className="min-h-screen bg-cx-hielo">
      <header className="border-b border-cx-borde bg-cx-hielo">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" aria-label="Volver al inicio">
            <Logo variant="light" />
          </a>
        </div>
      </header>
      <LegalDoc html={html} />
    </main>
  );
}
