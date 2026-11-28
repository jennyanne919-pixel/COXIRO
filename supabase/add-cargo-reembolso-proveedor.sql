-- Coste de Stripe de los reembolsos a cargo del profesional.
-- Stripe no devuelve su comisión de cobro cuando se reembolsa una venta: ese coste
-- se registra aquí como importe a cobrar al profesional (cláusula nueva de las
-- condiciones económicas, pendiente de revisión del asesor y de aceptación).
-- Es aditivo: no toca datos existentes.
alter table admin_refunds
  add column if not exists coste_stripe numeric(12,2) not null default 0,
  add column if not exists cargo_estado text not null default 'sin_cargo'
    check (cargo_estado in ('sin_cargo', 'pendiente', 'cobrado')),
  add column if not exists cargo_cobrado_at timestamptz;
