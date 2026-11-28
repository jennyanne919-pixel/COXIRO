// Obligaciones fiscales y legales de Coxiro, para la página Admin → Obligaciones.
// Estados: "confirmado" (lo ha documentado el asesor o la norma lo fija), "pendiente"
// (hay que confirmarlo con el asesor), "futuro" (obligación con fecha por llegar).
// Los plazos son los generales; si el último día cae en sábado, domingo o festivo, pasa al
// siguiente día hábil. Última revisión de este listado: 28/11/2026.

export type EstadoObligacion = "confirmado" | "pendiente" | "futuro";

export type Obligacion = {
  id: string;
  grupo: "Fiscales" | "Protección de datos" | "Consumo y reclamaciones";
  titulo: string;
  que: string;
  cuando: string;
  estado: EstadoObligacion;
  nota?: string;
  fuente: string;
  // Fechas fijas de cada año (mes 1-12, día) para calcular el próximo vencimiento.
  fechas?: { mes: number; dia: number }[];
};

export const OBLIGACIONES: Obligacion[] = [
  {
    id: "m130",
    grupo: "Fiscales",
    titulo: "Pago fraccionado del IRPF (modelo 130)",
    que: "Adelanto trimestral del IRPF de la titular (autónoma): 20 % del beneficio acumulado del año menos lo ya pagado.",
    cuando: "Hasta el 20 de abril, julio y octubre, y hasta el 30 de enero.",
    estado: "pendiente",
    nota: "El asesor debe confirmar si procede presentarlo en este caso y si corresponde la deducción del 50 % por Melilla. Hay una estimación en Impuestos y simulador.",
    fuente: "Admin → Impuestos y simulador",
    fechas: [{ mes: 1, dia: 30 }, { mes: 4, dia: 20 }, { mes: 7, dia: 20 }, { mes: 10, dia: 20 }],
  },
  {
    id: "ipsi",
    grupo: "Fiscales",
    titulo: "IPSI repercutido (Ciudad Autónoma de Melilla)",
    que: "Liquidar el IPSI que figura en las facturas a clientes (4 % en Mentoría) y que Coxiro debe ingresar.",
    cuando: "Modelo y calendario por confirmar con la Ciudad Autónoma.",
    estado: "pendiente",
    nota: "Consulta a la Ciudad Autónoma redactada como borrador. Mientras tanto, Contabilidad por venta calcula cuánto apartar. El IPSI soportado en servicios no es deducible (art. 20.3 Ley 8/1991).",
    fuente: "Documentos de situación fiscal y consulta IPSI",
  },
  {
    id: "iva",
    grupo: "Fiscales",
    titulo: "IVA de ventas a clientes de la Península y resto de la UE",
    que: "Las grabaciones automatizadas a particulares peninsulares van a IVA 21 %, y la docencia en directo depende de dónde se imparta. Hay que ver cómo se declara (régimen exterior o ventanilla única, OSS).",
    cuando: "Por confirmar con el asesor.",
    estado: "pendiente",
    nota: "Pregunta incluida en la consulta al asesor: zona UE/OSS y qué evidencia guardar de la residencia del comprador.",
    fuente: "Documento 9 del asesor y consulta al asesor",
  },
  {
    id: "m111",
    grupo: "Fiscales",
    titulo: "Retenciones de IRPF a profesionales (modelos 111 y 190)",
    que: "Si Coxiro tiene que retener IRPF en las facturas de los profesionales, hay que ingresarlo cada trimestre y hacer el resumen anual.",
    cuando: "Modelo 111: hasta el 20 de abril, julio y octubre, y hasta el 30 de enero. Modelo 190: enero.",
    estado: "pendiente",
    nota: "El contrato dice que el pagador practica las retenciones que correspondan. Falta confirmar con el asesor cuándo aplican.",
    fuente: "Contrato de proveedor (cláusula 5.1) y documento 9",
    fechas: [{ mes: 1, dia: 30 }, { mes: 4, dia: 20 }, { mes: 7, dia: 20 }, { mes: 10, dia: 20 }],
  },
  {
    id: "m238",
    grupo: "Fiscales",
    titulo: "Información de plataformas digitales (DAC7, modelo 238)",
    que: "Declaración anual de los vendedores que operan en la plataforma. El asesor debe documentar antes de operar si Coxiro está obligada, y recoger la ficha de cada vendedor (identidad, residencia, NIF, cuenta, ventas por trimestre). También puede requerir el alta censal (modelo 040).",
    cuando: "Enero del año siguiente al de la información.",
    estado: "pendiente",
    nota: "No se presume exclusión por ser pequeño negocio ni por usar Stripe. Pregunta pendiente al asesor.",
    fuente: "Documento 9 del asesor y sede de la AEAT",
    fechas: [{ mes: 1, dia: 31 }],
  },
  {
    id: "m347",
    grupo: "Fiscales",
    titulo: "Operaciones con terceros (modelo 347)",
    que: "Declaración anual de clientes y proveedores con los que se supere 3.005,06 € en el año.",
    cuando: "Febrero del año siguiente.",
    estado: "pendiente",
    nota: "Confirmar con el asesor si procede para esta actividad.",
    fuente: "Calendario general de la AEAT",
    fechas: [{ mes: 2, dia: 28 }],
  },
  {
    id: "verifactu",
    grupo: "Fiscales",
    titulo: "Sistema de facturación verificable (Verifactu)",
    que: "El software de facturación debe cumplir los requisitos de integridad y trazabilidad. Un QR en la factura no acredita por sí solo la conformidad.",
    cuando: "Según el aplazamiento aprobado en diciembre de 2025: 1 de enero de 2027 para sociedades y 1 de julio de 2027 para autónomos.",
    estado: "futuro",
    nota: "La titular es autónoma, así que apuntaría a julio de 2027. Hay que confirmar con el asesor que la fecha publicada coincide y si el IPSI cambia el alcance. Es la mejora de producto «Verifactu oficial» de la hoja de ruta.",
    fuente: "Aplazamiento del SIF/Verifactu (Écija) y hoja de ruta",
  },
  {
    id: "renta",
    grupo: "Fiscales",
    titulo: "Declaración anual de la renta (IRPF)",
    que: "Declaración anual de la titular, con la actividad de Coxiro dentro.",
    cuando: "Campaña de abril a junio del año siguiente.",
    estado: "confirmado",
    fuente: "Calendario general de la AEAT",
  },
  {
    id: "rat",
    grupo: "Protección de datos",
    titulo: "Registro de actividades de tratamiento (RAT)",
    que: "Mantener el registro y completarlo con sistemas, países y garantías. Revisarlo al menos una vez al año.",
    cuando: "Ya redactado por el asesor; falta completarlo. Revisión anual.",
    estado: "pendiente",
    fuente: "Documento 9 · Admin → Registro de tratamientos",
  },
  {
    id: "brechas",
    grupo: "Protección de datos",
    titulo: "Brechas de seguridad",
    que: "Si hay un incidente, registrarlo, contener y decidir si se notifica. Aviso a la AEPD sin dilación y, si es posible, en 72 horas desde que se tiene constancia.",
    cuando: "72 horas desde la constancia.",
    estado: "confirmado",
    nota: "El documento 9 trae el registro de incidente. Falta guardarlo como plantilla interna.",
    fuente: "Documento 9 del asesor",
  },
  {
    id: "derechos",
    grupo: "Protección de datos",
    titulo: "Derechos de las personas (acceso, supresión…)",
    que: "Registrar la solicitud, verificar la identidad de forma proporcionada y responder motivando cualquier denegación.",
    cuando: "Un mes desde la solicitud (ampliable con aviso dentro del primer mes).",
    estado: "confirmado",
    fuente: "Documento 9 y política de privacidad",
  },
  {
    id: "dpa",
    grupo: "Protección de datos",
    titulo: "Acuerdos de tratamiento con Stripe, Supabase, Vercel, Cloudflare y Resend",
    que: "Comprobar que el acuerdo de tratamiento estándar de cada uno está aceptado en tu cuenta y anotarlo en el RAT.",
    cuando: "Una vez, y al cambiar de proveedor.",
    estado: "pendiente",
    fuente: "Documentos 9 y 10 del asesor",
  },
  {
    id: "permisos",
    grupo: "Protección de datos",
    titulo: "Revisión de permisos y accesos",
    que: "Revisar quién tiene acceso a qué, cuentas con doble factor y claves, y bajas de accesos.",
    cuando: "Cada trimestre y tras cualquier cambio de funciones.",
    estado: "confirmado",
    fuente: "Documento 9 del asesor",
  },
  {
    id: "inactivas",
    grupo: "Protección de datos",
    titulo: "Cuentas inactivas y copias de seguridad",
    que: "Revisar cuentas inactivas, avisando antes de depurar. Las copias siguen una rotación ordinaria de 90 días.",
    cuando: "Cuentas inactivas a los 24 meses. Copias: rotación de 90 días.",
    estado: "futuro",
    fuente: "Documento 9 del asesor",
  },
  {
    id: "revision",
    grupo: "Protección de datos",
    titulo: "Revisión anual de documentos legales",
    que: "Comprobar textos vigentes, contactos, contratos tecnológicos, fichas fiscales, cookies, incidentes y obligaciones de plataformas. Guardar responsable, fecha y resultado.",
    cuando: "Una vez al año y ante cambios relevantes.",
    estado: "futuro",
    fuente: "Documento 9 del asesor",
  },
  {
    id: "reclamaciones",
    grupo: "Consumo y reclamaciones",
    titulo: "Atención de reclamaciones",
    que: "Acuse con referencia, respuesta motivada y vías externas de resolución si el cliente no queda conforme.",
    cuando: "Acuse en 48 horas. Respuesta en 14 días naturales (objetivo).",
    estado: "confirmado",
    nota: "El formulario público está en /reclamaciones y el procedimiento, en Admin → Documentos → Protocolo de reclamaciones.",
    fuente: "Documento 8 del asesor",
  },
  {
    id: "desistimiento",
    grupo: "Consumo y reclamaciones",
    titulo: "Reembolso por desistimiento",
    que: "Reembolsar sin esperar a recuperar el dinero del profesional.",
    cuando: "Sin demora indebida y como máximo 14 días naturales desde la comunicación.",
    estado: "confirmado",
    fuente: "Términos (14.5) y documento 8",
  },
  {
    id: "hoja",
    grupo: "Consumo y reclamaciones",
    titulo: "Hoja oficial de reclamaciones de Melilla",
    que: "Tenerla a disposición cuando sea exigible. El formulario privado no la sustituye.",
    cuando: "Por confirmar con el asesor.",
    estado: "pendiente",
    fuente: "Documento 8 y consulta al asesor",
  },
  {
    id: "boton",
    grupo: "Consumo y reclamaciones",
    titulo: "Función de desistimiento online (Directiva 2023/2673)",
    que: "La directiva obliga a una función online de desistimiento desde el 19 de junio de 2026. En España no estaba transpuesta a fecha 20/06/2026.",
    cuando: "Comprobar el estado actual de la transposición.",
    estado: "pendiente",
    fuente: "Documento 9 y OCU",
  },
];

// Próximo vencimiento a partir de hoy (fechas fijas de cada año).
export function proximoVencimiento(fechas: { mes: number; dia: number }[], hoy = new Date()) {
  const y = hoy.getFullYear();
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const candidatas = [y, y + 1].flatMap((anio) => fechas.map((f) => new Date(anio, f.mes - 1, f.dia)));
  const fut = candidatas.filter((d) => d.getTime() >= base.getTime()).sort((a, b) => a.getTime() - b.getTime())[0];
  const dias = Math.round((fut.getTime() - base.getTime()) / 86400000);
  return { fecha: fut, dias };
}
