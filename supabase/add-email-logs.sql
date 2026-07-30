create table email_logs (
  id uuid primary key default uuid_generate_v4(),
  to_email text not null,
  email_type text not null,
  resend_id text,
  status text not null default 'sent',
  error_message text,
  created_at timestamptz not null default now()
);

alter table email_logs enable row level security;
-- Bloqueada por completo: solo el backend (service role) escribe y
-- lee aquí. No hace falta que ningún usuario acceda directamente.
