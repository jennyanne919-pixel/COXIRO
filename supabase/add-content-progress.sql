create table content_progress (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references users(id),
  content_item_id uuid not null references content_items(id),
  position_seconds numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (client_id, content_item_id)
);

alter table content_progress enable row level security;

create policy "clientes ven y guardan su propio progreso" on content_progress
  for select using (auth.uid() = client_id);

create policy "clientes insertan su propio progreso" on content_progress
  for insert with check (auth.uid() = client_id);

create policy "clientes actualizan su propio progreso" on content_progress
  for update using (auth.uid() = client_id);
