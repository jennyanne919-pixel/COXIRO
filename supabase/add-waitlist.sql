create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  nombre text not null,
  tipo_servicio text not null check (
    tipo_servicio in ('infoproducto', 'mentoria', 'curso', 'ia', 'consultoria', 'otro')
  ),
  fuente text,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

-- Cualquiera puede APUNTARSE (formulario público, sin sesión)
create policy "cualquiera puede unirse a la lista de espera" on waitlist
  for insert with check (true);

-- Nadie puede LEER directamente por RLS -- el panel de admin usa la
-- service role key (cliente admin), que salta esta restricción.
