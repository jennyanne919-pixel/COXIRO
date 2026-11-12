-- Fase 41: sesiones en directo por servicio.
-- Solo el servidor accede a la tabla (RLS activada y sin políticas).
create table if not exists live_sessions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 150),
  starts_at timestamptz not null,
  join_url text not null,
  notes text,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists live_sessions_service_idx on live_sessions (service_id, starts_at);
alter table live_sessions enable row level security;
