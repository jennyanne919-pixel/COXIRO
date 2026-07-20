# COXIRO — Contexto del proyecto

## Qué es
Coxiro es una plataforma tecnológica que aspira a ser la infraestructura de referencia para profesionales que venden servicios y conocimiento online (como Shopify para e-commerce o Stripe para pagos). No es una plataforma de cursos: es pagos + facturación + área privada de contenido, con CRM/automatizaciones/IA en el roadmap.

**Mensaje de marca:** "Haz lo que mejor sabes hacer. Nosotros hacemos el resto."
**Subtítulo:** "Tu talento. Nuestra infraestructura."
**Público:** abogados, asesores, arquitectos, ingenieros, nutricionistas, psicólogos, consultores, creadores de contenido, entrenadores, mentores, formadores, diseñadores (excluido expresamente el sector médico).

## Modelo de negocio
Coxiro compra el servicio al proveedor y añade valor (gestión de pagos + facturación), validado mediante consulta vinculante de Tributos. Flujo real:
1. Profesional publica servicio con precio.
2. Cliente paga en página pública del servicio.
3. Stripe retiene comisión de Coxiro y transfiere el resto al profesional.
4. Se generan dos facturas: al cliente final y liquidación de comisión al proveedor.

## Estructura societaria (importante para cualquier texto público)
- Fundador: funcionario público, NO puede ser cara visible/titular hasta compatibilidad.
- Su mujer: autónoma, cara visible legal del negocio ante clientes/prensa/redes.
- Futuro: escalada a S.L.

## Identidad de marca
- **Colores:** Ink `#16181D` (fondo oscuro, dominante), Copper `#E2703A` (acento/CTA), Paper `#F7F3EC` (fondo claro cálido), Stone `#8A8A82` (texto secundario).
- **Tipografía:** Titulares Space Grotesk (500-600), cuerpo Inter (400-500).
- **Logo:** anillo/órbita abierto con punto en el extremo superior.
- **Tono:** directo, cálido, profesional, sin jerga técnica. Habla de beneficio (libertad, tiempo, crecimiento), no de features como titular.
- Evitar: azul/morado típico SaaS, y el cliché "crema + terracota".

## Stack técnico
Next.js 14 + Tailwind CSS + Supabase (Postgres, Auth, RLS) + Stripe Connect (cuentas Express) + pdf-lib + qrcode.

## Estado actual — YA FUNCIONA (no es maqueta)
- Landing pública + registro/login por rol (profesional/cliente) vía Supabase Auth.
- Dashboard diferenciado por rol (cobros y facturas / mis compras).
- Onboarding Stripe Connect (verificación identidad + cuenta bancaria).
- Página "Mis servicios" (título, descripción, precio, tipo).
- Página pública de servicio (`/servicio/[id]`) con botón de pago.
- Perfil público del profesional (`coxiro.com/su-slug`).
- Checkout real con Stripe (reparto automático comisión/profesional).
- Modelo de contenido tipo "portero": enlace externo oculto tras `/api/access/[itemId]`, comprobación de pago antes de redirigir.
- Facturación dual con base VeriFactu: numeración correlativa por serie (`CLI-000001`, `PROV-000001`), desglose IVA, hash encadenado entre facturas, QR de verificación.
- Webhook que registra venta → genera ambas facturas → da acceso al contenido.
- RLS verificado con pruebas reales (impersonate de Supabase).

**Aviso operativo:** el contenido externo debe ser siempre un enlace de *acceso*, nunca la página pública de venta del proveedor (ej. ficha de marketplace de Hotmart) — si no, el cliente puede pagar por fuera sin comisión ni factura.

## VeriFactu — fechas y estado
Obligación de facturación verificable: 1 enero 2027 (sociedades), 1 julio 2027 (autónomos/profesionales). Coxiro, como desarrollador de software de facturación, ya debe tener sus sistemas adaptados desde julio 2025. Ya construido: numeración sin huecos, hash encadenado, QR. **Pendiente confirmar con asesor fiscal:** formato exacto QR/URL AEAT, obligación de comunicación en tiempo real, tipo impositivo real por servicio/destino (ahora mismo IVA 21% como placeholder).

## Pendiente inmediato
- Confirmar con asesor fiscal los puntos VeriFactu antes de facturar con clientes reales.
- Resolver 4 vulnerabilidades de `npm audit` (2 bajas, 1 moderada, 1 crítica; una en Next.js 14.2.5) antes de producción.
- Desplegar en Vercel con dominio propio y webhook de Stripe apuntando a producción (esperar a tener todo lo demás listo).
- Definir estructura del programa de referidos/afiliados (aún sin detallar).

## Roadmap
1. **Fase 1 (ahora):** pagos + facturación dual + publicación de servicios + perfil público + entrega de contenido tokenizada. ✅
2. **Fase 2 (siguiente):** confirmación fiscal VeriFactu, resolver vulnerabilidades, despliegue producción, programa de referidos.
3. **Fase 3 (con ingresos):** CRM básico, automatizaciones, analítica de ventas, alojamiento propio de contenido premium.
4. **Fase 4 (escalada):** afiliados avanzados, IA en ventas/atención, ecosistema de productos, posible paso a S.L.

## Reglas para cualquier trabajo en este repo
- Respetar siempre colores, tipografía, tono de voz y mensaje de marca de este documento.
- Cualquier texto/cara pública debe seguir la restricción societaria (punto de estructura societaria).
- No añadir contenido de tipo enlace directo de marketplace externo como acceso — debe ser enlace de acceso tokenizado.
