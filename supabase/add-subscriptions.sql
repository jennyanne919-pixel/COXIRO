alter table services add column billing_interval text;

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references services(id),
  client_id uuid not null references users(id),
  provider_id uuid not null references providers(user_id),
  stripe_subscription_id text unique not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "clientes ven sus propias suscripciones" on subscriptions
  for select using (auth.uid() = client_id);

create policy "proveedores ven sus suscripciones" on subscriptions
  for select using (auth.uid() = provider_id);
