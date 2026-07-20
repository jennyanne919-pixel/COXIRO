# Coxiro — MVP

Landing pública + panel privado (dashboard), construido con Next.js,
Tailwind y Supabase, siguiendo el esquema y los mockups acordados.

## Poner en marcha (en tu ordenador, no aquí)

```bash
npm install
cp .env.example .env.local   # y rellena las claves
npm run dev
```

Abre http://localhost:3000 para la landing, y
http://localhost:3000/dashboard para el panel (necesitarás tener
Supabase Auth configurado y una sesión iniciada para que cargue datos
reales).

## Configurar Supabase

1. Crea un proyecto en https://supabase.com
2. Ve a SQL Editor y ejecuta el contenido de `supabase/schema.sql`
3. Copia la URL y la anon key desde Project Settings > API a tu `.env.local`

## Configurar Stripe Connect

Todavía no está integrado el flujo de pagos real — el dashboard ya
lee de la tabla `transactions`, pero falta:

1. Crear las cuentas conectadas (Stripe Connect Express) al registrar
   cada proveedor, guardando `stripe_account_id` en la tabla `providers`.
2. Un endpoint de checkout que cree el PaymentIntent con
   `application_fee_amount` y `transfer_data.destination` apuntando a
   la cuenta del proveedor.
3. Un webhook de Stripe que, al confirmarse el pago, inserte la fila
   en `transactions` y genere las dos facturas en `invoices`.

## Estructura

```
app/
  page.tsx              → landing pública
  dashboard/
    layout.tsx           → navegación lateral del panel
    page.tsx             → resumen de cobros (lee de Supabase)
components/
  Logo.tsx                → símbolo de marca, único lugar donde vive
lib/supabase/
  client.ts               → cliente para componentes "use client"
  server.ts               → cliente para Server Components
supabase/
  schema.sql              → esquema completo, listo para ejecutar
tailwind.config.ts        → colores y tipografía de marca (cambia aquí)
```

## Ajustar diseño más adelante

Todos los colores y tipografías de marca están centralizados en
`tailwind.config.ts` y en `components/Logo.tsx`. Cambiar el color
copper, la tipografía o el símbolo del logo se hace en esos dos
sitios — se propaga automáticamente a toda la app.
