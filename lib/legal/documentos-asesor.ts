// Documentos internos redactados por el asesor (24/11/2026), 8 a 10.
// Se muestran en Admin → Documentos. Contenido estático solo para administradores.
export type DocumentoAsesor = { slug: string; numero: number; titulo: string; descripcion: string; html: string };

export const DOCUMENTOS_ASESOR: DocumentoAsesor[] = [
  {
    slug: "protocolo-reclamaciones",
    numero: 8,
    titulo: "Protocolo de reclamaciones",
    descripcion: "Cómo se atiende, registra y resuelve una reclamación, con las plantillas de acuse, profesional, resolución y devolución.",
    html: `
<p><strong>COXIRO</strong></p>
<h1>Documento 8. Protocolo de reclamaciones</h1>
<p><em>Documento interno redactado por el asesor (24/11/2026). Solo visible para administradores. Se ha retirado el teléfono, que no se publica.</em></p>
<h2>Responsabilidad y canales</h2>
<p>Jenny Anne Abriam dirige el procedimiento y designa una persona suplente autorizada para incidencias y devoluciones. Canales: formulario de la plataforma, coxiro.info@gmail.com y domicilio en Grupo Gómez Jordana 5, Melilla, España. Se ofrece atención personal y accesible.</p>
<p>Si una reclamación llega por WhatsApp u otro canal utilizado por el negocio, se registra y confirma en soporte duradero. No se exige que el cliente la repita por email para reconocer la fecha de recepción. El expediente comienza con la primera comunicación identificable.</p>
<h2>Registro y clasificación</h2>
<p>Asignar referencia y registrar fecha, canal, contacto mínimo, pedido, pretensión, categoría, documentación, responsable, vencimientos, decisión y ejecución. No almacenar números completos de tarjeta ni datos sensibles innecesarios.</p>
<p>Distinguir desistimiento, cancelación de renovación, falta de prestación o conformidad, fallo técnico, contracargo, derecho de datos y brecha. Una misma incidencia puede activar varios procedimientos y cada uno mantiene sus plazos.</p>
<h2>Plazos</h2>
<p>Acuse de recibo: máximo cuarenta y ocho horas, con referencia y copia o resumen fiel. Respuesta motivada: objetivo de catorce días naturales desde la primera recepción, respetando el máximo legal aplicable. El traslado al profesional y la investigación no reinician ni suspenden por sí solos el cómputo.</p>
<p>Desistimiento: reembolsar sin demora indebida y como máximo en catorce días naturales desde su comunicación cuando proceda. No esperar la resolución interna o la recuperación de fondos del Proveedor para iniciar ese plazo.</p>
<p>Profesional: solicitar versión en cinco días hábiles o en el plazo menor razonablemente necesario para un vencimiento legal o de pagos, explicando la urgencia. La ausencia de respuesta no acredita automáticamente responsabilidad.</p>
<p>Contracargos: registrar el vencimiento concreto de Stripe y preparar pruebas antes de él. No presentar documentación falsa ni duplicar devoluciones. Derechos de datos: plazo general de un mes, con las reglas de prórroga. Brechas: activar inmediatamente el procedimiento de seguridad y evaluar la notificación en setenta y dos horas.</p>
<h2>Examen y resolución</h2>
<p>Comprobar ficha y condiciones aceptadas, pago, comunicación y pruebas de ejecución. En desistimientos revisar información previa, petición de inicio, suministro y consentimientos pertinentes; no presumir pérdida por el mero acceso o comienzo de un servicio.</p>
<p>Coxiro responde como vendedora frente al cliente. Aplicar el remedio legal correspondiente sin imponer cupones o cambios no aceptados. La resolución separa hechos, fundamento, pretensión, resultado y medida concreta. Si hay devolución se indica importe, medio y fecha de orden y se conserva justificante.</p>
<p>La repercusión al profesional exige incumplimiento imputable o fundamento contractual válido, causalidad, cálculo y oportunidad de alegar. No revertir toda transferencia automáticamente ni trasladarle fallos de Coxiro. Pagar saldos no discutidos y conciliar cualquier recuperación posterior de una disputa.</p>
<h2>Vías externas</h2>
<p>Cuando no se resuelva satisfactoriamente, informar en soporte duradero de una entidad acreditada competente, su web y si Coxiro está obligada o acepta participar, conforme a la Ley 7/2017. No afirmar adhesión arbitral inexistente ni remitir a la plataforma europea ODR suprimida.</p>
<p>Mantener a disposición la hoja oficial de reclamaciones cuando sea exigible y utilizar el modelo y sistema de entrega aprobados para la actividad. El formulario privado de este protocolo no se denomina hoja oficial ni sustituye ese derecho.</p>
<h2>Conservación</h2>
<p>Conservar la documentación necesaria durante la gestión y el plazo de responsabilidades, aplicando restricciones y bloqueo cuando corresponda. Las facturas y justificantes siguen sus plazos propios. Una reclamación no justifica conservar indefinidamente todo el perfil o todos los registros técnicos.</p>
<h2>Formulario privado de registro</h2>
<p>Referencia: ( ). Primera recepción y canal: ( ). Nombre y contacto: ( ). Pedido: ( ). Hechos: ( ). Solución solicitada: ( ). Documentación: ( ). Categoría y vencimientos: ( ). Responsable: ( ). Respuesta y fecha: ( ). Medida ejecutada y justificante: ( ). Vías externas comunicadas: ( ).</p>
<p>Facilitar información de privacidad y copia al reclamante. La solicitud de desistimiento puede utilizar el modelo de las condiciones de clientes o cualquier declaración inequívoca.</p>
<h2>Plantilla de acuse</h2>
<p><em>«Hemos recibido el (fecha y hora) su comunicación sobre el pedido ( ). Referencia ( ). Solicita (resumen). La revisará (contacto) y le responderemos a más tardar el (fecha según objetivo de catorce días), sin perjuicio de los plazos específicos de sus derechos. Puede aportar documentación respondiendo a este mensaje. Adjuntamos copia o resumen de su reclamación».</em></p>
<h2>Plantilla para el profesional</h2>
<p><em>«El cliente del pedido ( ) reclama (hechos mínimos). Necesitamos su versión y pruebas antes del (fecha). El plazo responde a (vencimiento). La petición no prejuzga responsabilidad. Cualquier repercusión se comunicará con su causa, cálculo y posibilidad de alegación conforme al contrato».</em></p>
<h2>Plantilla de resolución</h2>
<p><em>«Reclamación ( ), recibida el ( ). Hemos comprobado (hechos). Su petición se (estima total o parcialmente o desestima) por (motivos). Actuaremos así: (remedio, cuantía, fecha y medio). Si discrepa, puede acudir a (entidad competente, web e información sobre participación), además de las vías administrativas y judiciales que le correspondan».</em></p>
<h2>Plantilla de devolución</h2>
<p><em>«Hemos ordenado el (fecha) la devolución de (importe) del pedido ( ) al medio de pago (referencia parcial). Justificante ( ). Si no se refleja, contacte con coxiro.info@gmail.com para comprobar el estado. Se emitirá la rectificación de factura que corresponda».</em></p>
`,
  },
  {
    slug: "manual-cumplimiento",
    numero: 9,
    titulo: "Manual interno de cumplimiento",
    descripcion: "Registro de tratamientos, conservación, derechos, brechas, medidas técnicas, cookies, moderación, DAC7, control fiscal y accesibilidad. Es un manual para ti, no un texto público.",
    html: `
<p><strong>COXIRO</strong></p>
<h1>Documento 9. Manual interno de cumplimiento</h1>
<p><em>Documento interno redactado por el asesor (24/11/2026). Solo visible para administradores.</em></p>
<h2>Organización y mantenimiento</h2>
<p>Jenny Anne Abriam aprueba y mantiene este manual. Asigna responsables identificados para atención, fiscalidad, datos, tecnología y suplencia. El personal y colaboradores reciben acceso individual y formación proporcionada. El registro de responsables, prestadores y sistemas se conserva en el expediente operativo de Coxiro.</p>
<p>Las declaraciones de un proveedor sobre seguridad o de una herramienta sobre cumplimiento no sustituyen las comprobaciones propias. Los cambios de producto, país, tecnología, finalidad o modelo requieren revisar este manual y la documentación vinculada antes de activarlos.</p>
<h2>Registro de actividades de tratamiento</h2>
<p>Responsable de las actividades siguientes: Jenny Anne Abriam, NIE Y8056216C, Grupo Gómez Jordana 5, Melilla; coxiro.info@gmail.com. Se completan con los sistemas, encargados, países y garantías de la relación efectiva de proveedores. El tratamiento habitual no se considera exento del registro solo por tener menos de doscientas cincuenta personas.</p>
<p>Cuentas y clientes. Interesados: usuarios y compradores, con o sin cuenta. Datos: identificación, contacto, pedidos, acceso y comunicaciones. Finalidades: relación solicitada, ejecución y soporte. Bases: contrato y obligaciones aplicables. Destinatarios: profesionales y tecnología necesaria según roles. Conservación: necesidad del servicio y responsabilidades. Medidas: permisos, autenticación, seguridad y acceso limitado.</p>
<p>Profesionales y colaboradores. Interesados: personas físicas, representantes y contactos. Datos: identidad, representación, actividad, fiscalidad, cuenta, habilitaciones y contratos. Finalidades: alta, verificación, prestaciones, pagos y documentación. Bases: contrato, obligación legal e interés legítimo ponderado cuando proceda. Destinatarios: asesoría, pagos y autoridades. Conservación: relación y obligaciones específicas.</p>
<p>Facturación y fiscalidad. Interesados: clientes y profesionales. Datos: identificación fiscal, facturas y operaciones, sin tarjeta completa. Finalidades: emisión, libros, impuestos y comprobaciones. Base: obligación legal. Destinatarios: asesoría y administraciones. Conservación: plazos fiscales, mercantiles y especiales con sus interrupciones y bloqueo.</p>
<p>Atención y reclamaciones. Interesados: reclamantes, profesionales y contactos. Datos: hechos y pruebas mínimas. Finalidades: resolver y defender derechos. Bases: contrato, obligación legal o interés legítimo según la función. Destinatarios: intervinientes y autoridades pertinentes. Conservación: gestión y prescripción de acciones.</p>
<p>Seguridad. Interesados: usuarios, administradores y colaboradores. Datos: accesos, registros técnicos, IP y eventos necesarios. Finalidades: integridad, control, prevención y defensa. Bases: obligación o interés legítimo documentado. Accesos restringidos. Plazo inicial ordinario: noventa días, revisado según riesgo; las pruebas de un incidente concreto se preservan separadamente durante su necesidad.</p>
<p>Marketing. Interesados: destinatarios con habilitación. Datos: contacto, preferencias y prueba. Finalidad: comunicaciones propias. Bases: consentimiento u otra habilitación legal de relación previa. Conservación: hasta baja, con prueba mínima y lista de exclusión. Proveedor de envíos y transferencias: los identificados en el inventario real.</p>
<p>Información de plataformas. Se activa para los supuestos sujetos conforme a la memoria DAC7. Interesados: vendedores y personas exigidos por la norma. Datos: identificación, verificaciones, contraprestaciones, actividades y comisiones. Base: obligación legal. Destinatarios: AEAT y destinos previstos legalmente. Conservación: régimen especial. Se informa al vendedor y se conserva evidencia.</p>
<h2>Conservación y borrado</h2>
<p>Cada categoría tiene finalidad, plazo, inicio, fundamento, restricción y forma de eliminación. Los cuatro años generales tributarios y los seis mercantiles cuando procedan no se trasladan indiscriminadamente a IP, navegador y toda la actividad del usuario. Se respetan plazos especiales, interrupciones y litigios concretos.</p>
<p>Revisar cuentas inactivas a los veinticuatro meses para advertir y depurar lo innecesario, sin eliminar accesos pagados vigentes. Esta es una política de revisión, no un plazo legal de caducidad. Los datos que deban conservarse quedan bloqueados o restringidos según corresponda.</p>
<p>Las copias de seguridad siguen rotación ordinaria de noventa días, salvo necesidad justificada y registrada. La restauración reaplica bajas y bloqueos. Se documentan las eliminaciones y las excepciones. Revisar anualmente plazos y accesos.</p>
<h2>Derechos de las personas</h2>
<p>Registrar solicitud, recepción, identidad, derecho y vencimiento. Verificar identidad de forma proporcionada, sin pedir por rutina copia completa del documento. Localizar sistemas y encargados y coordinarse con otros responsables sin desatender las obligaciones propias.</p>
<p>Responder en un mes, motivar cualquier denegación e informar de reclamación ante AEPD. La prórroga de hasta dos meses adicionales se comunica y justifica dentro del primero cuando proceda. Conservar la prueba mínima de solicitud y respuesta. No cobrar por rutina ni condicionar el derecho a cancelar el contrato.</p>
<h2>Incidentes y brechas</h2>
<p>La persona que detecte un incidente avisa inmediatamente a Jenny y al responsable técnico. Registrar fecha de constancia, sistemas, datos, afectados, causa, impacto y medidas. Contener y revocar accesos comprometidos sin destruir evidencias. Evaluar disponibilidad, integridad y confidencialidad.</p>
<p>Jenny documenta el riesgo para derechos y libertades y la decisión de notificar o no. Si procede comunicar a AEPD, hacerlo sin dilación y, cuando sea posible, dentro de setenta y dos horas desde la constancia. Si faltan datos se amplían por fases, justificando retrasos. Si hay alto riesgo se comunica a afectados sin dilación, salvo excepción legal. Los encargados avisan sin dilación, con objetivo contractual de primer aviso en veinticuatro horas.</p>
<p>Registro de incidente: referencia ( ); constancia (fecha y hora); sistemas y datos ( ); afectados y países ( ); impacto ( ); contención ( ); riesgo ( ); decisión motivada ( ); comunicaciones y horas ( ); recuperación ( ); medidas preventivas ( ).</p>
<h2>Medidas técnicas y organizativas</h2>
<p>Mantener inventario de activos y contratos; cuentas personales y autenticación reforzada de administradores; privilegio mínimo; baja inmediata de accesos al cese; separación de pruebas y producción; control de exportaciones, cambios sensibles y secretos. No compartir credenciales por mensajería ni usar datos reales innecesarios en pruebas.</p>
<p>Revisar reglas de acceso por fila y almacenamiento de Supabase, aislamiento entre profesionales, claves de servicio y recursos públicos. En Stripe verificar firmas, reintentos, permisos de transferencias y conciliación. Cifrar comunicaciones, actualizar equipos y sistemas, hacer copias y probar restauración. Registrar comprobaciones y corregir fallos antes de la activación que afecten.</p>
<p>Revisar permisos al menos trimestralmente y tras cambios de funciones. Formar al inicio y ante cambios relevantes. Las medidas se ajustan al riesgo; no se declara seguridad absoluta ni una auditoría técnica inexistente.</p>
<h2>Encargados y transferencias</h2>
<p>Inventariar por prestador entidad, servicio, rol, sistemas, país, subencargados, contrato y garantía internacional. Formalizar encargo para funciones por instrucciones y acuerdos de responsables o corresponsabilidad según la realidad. No presumir un rol único para todas las funciones de Stripe u otro grupo.</p>
<p>Si hay acceso desde fuera del EEE, comprobar mecanismo válido. La adecuación debe cubrir entidad y tratamiento; en el marco UE EEUU se verifica la entidad y certificación vigentes. Si se utilizan cláusulas tipo se completa el módulo y anexos correctos y se evalúan medidas adicionales. No utilizar de forma estructural un consentimiento genérico para suplir garantías.</p>
<p>Evaluar y documentar necesidad de evaluación de impacto y DPD según naturaleza, escala, seguimiento, datos sensibles y supuestos legales. La mera condición de startup no determina ni excluye ambas obligaciones.</p>
<h2>Cookies y contratación electrónica</h2>
<p>Auditar web pública, enlaces privados, registro y checkout antes y después de rechazar o aceptar. Incluir cookies, almacenamiento local, vídeo, calendarios y recursos de terceros. Completar el inventario de la política con nombres, finalidad, proveedor y duración reales.</p>
<p>Si hay recursos no exentos, bloquearlos hasta consentimiento y ofrecer aceptar, rechazar y configurar al mismo nivel, con retirada permanente. No activar por navegar o aceptar contratos. Conservar evidencia proporcional y actualizarla al cambiar finalidades.</p>
<p>Guardar por pedido vendedor, ficha y precio, versión íntegra de condiciones, aceptación, elecciones específicas y confirmación remitida. En el alta del profesional conservar contrato y anexo económico íntegros y representación. Los consentimientos opcionales y las solicitudes de inicio anticipado no se mezclan en una casilla general de privacidad.</p>
<h2>Contenidos y moderación</h2>
<p>Canal para usuarios y autoridades: coxiro.info@gmail.com, en español. Admitir notificaciones de contenido presuntamente ilícito con localización precisa, motivos, contacto cuando sea exigible y declaración de buena fe; respetar excepciones legales de identificación. No exigir sentencia previa para examinarlas.</p>
<p>Registrar recepción, pedir aclaraciones necesarias y priorizar riesgo para personas y mandatos de autoridad. Adoptar medidas proporcionadas: información, restricción, retirada o suspensión cuando proceda. Comunicar decisión y fundamento al notificante y afectado en los términos exigibles, sin revelar información protegida.</p>
<p>Las decisiones identifican hechos, norma o cláusula, alcance y vías de revisión; explican automatización relevante cuando sea exigible. Mantener revisión humana y prueba restringida. No imponer vigilancia general indiscriminada. Publicidad, promociones, clasificación y reseñas se presentan de forma transparente.</p>
<p>Documentar el ámbito del Reglamento de Servicios Digitales y de P2B y las excepciones por tamaño realmente aplicables, con empresas vinculadas y cifras. Las excepciones para pequeñas empresas no equivalen a exención de todo el régimen.</p>
<h2>Información tributaria de plataformas</h2>
<p>La asesoría documenta antes de operar la categoría de cada servicio y el alcance de DAC7, residencia de vendedores, sujetos o excluidos y obligaciones censales e informativas. No presumir exclusión por no impartir Coxiro las sesiones, por usar Stripe o por ser pequeño negocio. El umbral de menos de treinta ventas y hasta dos mil euros se refiere a ciertos vendedores de bienes, no a todo servicio personal.</p>
<p>Cuando corresponda, recoger y verificar los datos, registrar resultados, efectuar las comunicaciones y rectificaciones y entregar al vendedor la información exigible. El modelo 238 se presenta con carácter general en enero por el año anterior, conforme al calendario aplicable; se revisan las obligaciones del modelo 040 según el supuesto. La residencia estadounidense no decide por sí sola el tratamiento.</p>
<p>Ficha del vendedor: identidad y domicilio; persona física o entidad; jurisdicciones de residencia; NIF y emisor; fecha de nacimiento o registro cuando procedan; establecimiento pertinente; cuenta y titular; actividad; fuentes y fechas de verificación; contraprestaciones y actividades por trimestre; comisiones, tasas o impuestos retenidos o cobrados; exclusión o declaración y fundamento; información entregada; rectificaciones. Solicitar solo los datos exigibles.</p>
<h2>Formación grabada y clases en directo</h2>
<p>Mantener separados el catálogo de acceso a grabaciones y el de docencia en directo. Validar por curso la intervención humana, materia, derechos de explotación, precio e impuestos. No añadir una tutoría meramente accesoria para presentar un producto automatizado como enseñanza exenta. Las ventas mixtas requieren un análisis de prestación única o componentes independientes según su realidad económica, no un reparto artificioso.</p>
<p>Para el acceso anticipado a grabaciones, implantar la elección específica desmarcada de consentimiento y reconocimiento, confirmación duradera y registro de inicio de suministro. Para docencia humana, utilizar la solicitud de inicio anticipado y el régimen de ejecución íntegra y proporcionalidad que corresponda. Verificar que cada elección produce el efecto técnico correcto y que su negativa no se interpreta como aceptación.</p>
<p>Inventariar las grabaciones de docentes y, excepcionalmente, de asistentes, con base jurídica, información previa, destinatarios, período de acceso y eliminación. Verificar licencias y evitar captar alumnado por defecto. Ofrecer la alternativa que corresponda cuando su participación grabada sea opcional. Los registros de acceso se limitan a entrega, seguridad, servicio y prueba necesarios, con plazo documentado. Añadir este tratamiento al registro de actividades cuando se utilice.</p>
<h2>Control fiscal y de actividades</h2>
<p>Mantener ficha aprobada por operación con prestador y destinatario, B2B o B2C, establecimiento, país, naturaleza del servicio, localización, impuesto, base, tipo o causa de no repercusión, retención, factura y serie. No habilitar el perfil si no puede facturarse correctamente. La configuración informática no determina el impuesto.</p>
<p>El alcance del criterio fiscal escrito se verifica con los hechos efectivos. Su cita no demuestra validación del circuito de pagos ni de otros servicios. Revisar separadamente IPSI, IVA en destino, retenciones, no residentes y obligaciones de sistemas de facturación. Un QR no acredita por sí solo conformidad o remisión a AEAT.</p>
<p>En las grabaciones automatizadas vendidas a particulares peninsulares, configurar en principio IVA del 21 por ciento y valorar el régimen exterior de ventanilla única cuando Coxiro carezca de establecimiento en la Comunidad. El umbral de diez mil euros de ciertos proveedores comunitarios no ampara a un proveedor establecido solo en Melilla. En la enseñanza en directo, documentar localización y eventual exención antes de operar; conservar el análisis de la cuestión europea y de la consulta escrita pendiente, sin trasladar una exención del Proveedor a Coxiro por defecto.</p>
<p>Conciliar cada factura Proveedor a Coxiro con su propio IPSI, exención, deudor tributario y retenciones cuando procedan. Los impuestos no recuperables pueden afectar al margen, y la retención no duplica el coste. Las plantillas no aplican automáticamente inversión del sujeto pasivo de IVA a adquisiciones localizadas en Melilla. Validar las devoluciones y rectificaciones también en OSS cuando resulte aplicable.</p>
<p>Antes de ofrecer actividades sanitarias, financieras, jurídicas o reservadas, verificar habilitación, seguros, publicidad y datos. La denominación mentoría no evita su regulación material. No activar saldos, monederos u otros servicios financieros sin examinar y cumplir su régimen. Los beneficios de Melilla se aplican tras verificar su supuesto, residencia y actividad efectiva; no se trasladan automáticamente a colaboradores.</p>
<h2>Accesibilidad y revisión</h2>
<p>Documentar ámbito o excepción de la Ley 11/2023 con tamaño y vinculaciones. Si resulta exigible, evaluar el servicio y facilitar información accesible de cumplimiento sin certificaciones inventadas. Mantener atención accesible y revisar la función online de desistimiento según legislación y mercados de destino.</p>
<p>La revisión anual y los cambios relevantes comprueban documentos vigentes, identidad y contactos, contratos tecnológicos, fichas fiscales, permisos, derechos, cookies, incidentes y obligaciones de plataformas. Guardar responsable, fecha, evidencia y resultado de las correcciones.</p>
`,
  },
  {
    slug: "contrato-encargo-tratamiento",
    numero: 10,
    titulo: "Contrato de encargo de tratamiento",
    descripcion: "Plantilla en blanco para cuando un tercero trate datos personales por cuenta de Coxiro. No hace falta para Stripe, Supabase, Vercel, Cloudflare ni Resend: valen sus acuerdos estándar.",
    html: `
<p><strong>COXIRO</strong></p>
<h1>Documento 10. Contrato de encargo de tratamiento</h1>
<p><em>Plantilla redactada por el asesor (24/11/2026). Los campos entre paréntesis se rellenan al contratar a cada tercero. Solo visible para administradores.</em></p>
<h2>Partes y tratamiento</h2>
<p>Responsable: Jenny Anne Abriam, NIE Y8056216C, Coxiro, Grupo Gómez Jordana 5, Melilla, España; coxiro.info@gmail.com.</p>
<p>Encargado: (entidad o profesional, identificación fiscal, domicilio y representante). Contacto de privacidad y seguridad: (contacto).</p>
<p>El encargado trata datos por cuenta del responsable para prestar (servicio concreto). Duración: (período o vínculo con el contrato principal). Operaciones: (recogida, acceso, alojamiento, soporte u otras concretas). Interesados: (categorías). Datos: (categorías necesarias). Sistemas y ubicaciones autorizadas: (detalle).</p>
<p>El contrato se limita a funciones por instrucciones. No califica como encargo las funciones en que el prestador actúe como responsable independiente o determine conjuntamente fines y medios.</p>
<h2>Instrucciones y personas autorizadas</h2>
<p>El encargado utiliza los datos únicamente para el servicio y conforme a instrucciones documentadas, incluidas transferencias, salvo obligación legal aplicable que comunicará cuando pueda hacerlo. Advierte si considera que una instrucción infringe la normativa.</p>
<p>No utiliza los datos para publicidad propia, venta, perfilado ajeno al encargo o entrenamiento de modelos sin base y acuerdo jurídicamente adecuados. Limita acceso al personal necesario, sujeto a confidencialidad, formación y permisos individuales.</p>
<h2>Seguridad</h2>
<p>Aplica medidas proporcionales al riesgo y las descritas en el anexo: autenticación y permisos; protección de comunicaciones y secretos; segregación; registro de accesos y cambios; gestión de vulnerabilidades; copias y restauración; continuidad; exportación y eliminación. Comunica modificaciones materiales y demuestra cumplimiento.</p>
<p>La documentación o certificaciones disponibles no excluyen las obligaciones del contrato ni la necesidad de comprobar su alcance. No se garantiza un nivel técnico que no esté implantado.</p>
<h2>Subencargados y transferencias</h2>
<p>Los subencargados inicialmente autorizados constan en el anexo. Se concede autorización general escrita para cambios dentro del servicio, previa comunicación con al menos quince días y posibilidad de oposición motivada y solución antes del tratamiento, salvo urgencia legal justificada.</p>
<p>Se imponen al subencargado obligaciones equivalentes y se mantiene la responsabilidad frente al responsable. No se permiten países o accesos internacionales no autorizados sin instrucciones y garantías válidas. Este contrato no sustituye las cláusulas tipo, sus anexos ni la evaluación de transferencias que procedan.</p>
<h2>Asistencia y derechos</h2>
<p>El encargado ayuda a atender derechos, incidentes, seguridad, evaluaciones de impacto y consultas previas conforme al riesgo y al servicio. Si recibe una petición la comunica sin dilación y no decide por su cuenta salvo instrucción o mandato legal. Facilita localización, extracción, rectificación, restricción y borrado cuando corresponda.</p>
<h2>Brechas</h2>
<p>Comunica brechas sin dilación indebida, con objetivo contractual de primer aviso en veinticuatro horas desde su constancia, aunque la investigación no esté completa. Facilita naturaleza, datos y afectados estimados, contacto, consecuencias y medidas disponibles y posteriores actualizaciones.</p>
<p>Preserva evidencias, coopera en contención y recuperación y no condiciona avisos urgentes al pago de servicios adicionales. La asignación de tareas no elimina las obligaciones legales propias de cada parte.</p>
<h2>Finalización y comprobación</h2>
<p>Al finalizar, devuelve o elimina datos y copias a elección del responsable, salvo conservación legal identificada y limitada. Entrega datos en formato legible y seguro y expide constancia de devolución o eliminación, con calendario de purga de copias de seguridad.</p>
<p>Facilita información suficiente y permite auditorías proporcionadas, incluidas inspecciones. Los límites de responsabilidad no excluyen obligaciones imperativas. Se aplica la legislación española y la competencia legal correspondiente.</p>
<h2>Anexo de medios y subencargados</h2>
<p>Medidas efectivamente aplicables al servicio, responsables y evidencias: (descripción verificable).</p>
<p>Subencargados autorizados, función y país: (relación o ninguno).</p>
<p>Transferencias y mecanismo válido, con anexos y medidas adicionales: (detalle o inexistencia comprobada).</p>
<p>Canales de incidencias y derechos: (contactos y cobertura).</p>
<p>Formato y plazo de devolución, rotación de copias y eliminación: (detalle).</p>
<h2>Firma</h2>
<p>Lugar y fecha: (lugar y fecha).</p>
<p>Por el responsable, Jenny Anne Abriam: ____________________</p>
<p>Por el encargado, nombre y representación: ____________________</p>
`,
  },
];
