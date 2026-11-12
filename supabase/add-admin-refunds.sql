-- Registro de reembolsos hechos desde el panel de administración.
-- Solo el backend (service role) lo lee y escribe: RLS activado sin políticas.
create table if not exists admin_refunds (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id),
  stripe_refund_id text,
  amount numeric(12,2) not null,
  reason text not null,
  tres_partes boolean not null default false,
  created_by text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists admin_refunds_transaction_uidx on admin_refunds (transaction_id);

alter table admin_refunds enable row level security;
