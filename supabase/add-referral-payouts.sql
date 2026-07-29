create table referral_payouts (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references providers(user_id),
  amount numeric(10,2) not null,
  stripe_transfer_id text,
  period_end timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Bloqueada por completo: solo el proceso automático (con la service
-- role key) debe poder escribir aquí. El partner puede consultarla,
-- nunca modificarla.
alter table referral_payouts enable row level security;

create policy "partners ven su propio historial de pagos" on referral_payouts
  for select using (auth.uid() = partner_id);
