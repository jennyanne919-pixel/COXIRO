-- Gastos de Coxiro para la contabilidad del panel de administrador.
-- Solo el backend (service role) lee y escribe aquí: RLS activado y sin
-- políticas, igual que email_logs.
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  concepto text not null,
  proveedor text,
  categoria text not null,
  base numeric(12,2) not null check (base >= 0),
  cuota numeric(12,2) not null default 0 check (cuota >= 0),
  total numeric(12,2) generated always as (base + cuota) stored,
  deducible boolean not null default true,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_fecha_idx on expenses (fecha);

alter table expenses enable row level security;
