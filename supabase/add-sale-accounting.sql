-- Fase 45b: contabilidad por venta y tipo de impuesto en las facturas.
-- Aditivo y repetible. Ejecutar ANTES de subir el código.

-- Tipo de impuesto que muestra cada factura (IPSI o IVA). Las facturas
-- anteriores se quedan en NULL y se siguen generando como hasta ahora.
alter table public.invoices add column if not exists tax_type text;

-- Una fila por venta cobrada con las condiciones de categoría: lo que pasó
-- con el dinero (cobrado, pagado al profesional, impuestos de las dos operaciones,
-- coste de Stripe y margen). Solo el servidor lee y escribe aquí.
create table if not exists public.sale_accounting (
  id                uuid primary key default gen_random_uuid(),
  transaction_id    uuid not null unique references public.transactions(id) on delete cascade,
  category          text not null,
  modo              text not null,
  porcentaje        numeric(5,2) not null,
  impuesto_tipo     text not null,
  impuesto_pct      numeric(5,2) not null,
  total             numeric(12,2) not null,   -- lo que pagó el cliente
  base_cliente      numeric(12,2) not null,   -- base de la factura al cliente
  impuesto_cliente  numeric(12,2) not null,   -- impuesto de la venta (2.ª operación)
  neto_proveedor    numeric(12,2) not null,   -- lo que se paga al profesional
  cuota_compra      numeric(12,2) not null,   -- impuesto de la compra al profesional (1.ª operación)
  compra_deducible  boolean not null default false,
  stripe_fee        numeric(12,2) not null default 0,
  stripe_real       boolean not null default false,
  margen            numeric(12,2) not null,
  provisional       boolean not null default true,  -- hasta que el asesor confirme el tratamiento fiscal
  created_at        timestamptz not null default now()
);

alter table public.sale_accounting enable row level security;
revoke all on public.sale_accounting from anon, authenticated;
