alter table services add column requires_inquiry boolean not null default false;

create table service_inquiries (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references services(id),
  name text not null,
  email text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table service_inquiries enable row level security;

create policy "proveedores ven solicitudes de sus servicios" on service_inquiries
  for select using (
    exists (
      select 1 from services
      where services.id = service_inquiries.service_id
      and services.provider_id = auth.uid()
    )
  );
