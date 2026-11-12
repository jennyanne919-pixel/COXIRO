-- Fase 40: dudas y comentarios por lección.
-- El acceso se controla en el servidor (cliente con compra vigente o dueño del
-- servicio), así que la tabla tiene RLS activada y SIN políticas: nadie puede
-- leerla ni escribirla desde el navegador, solo el servidor.

create table if not exists lesson_comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references content_items(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references lesson_comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  is_instructor boolean not null default false,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists lesson_comments_item_idx on lesson_comments (item_id, created_at);
create index if not exists lesson_comments_service_idx on lesson_comments (service_id, created_at desc);

alter table lesson_comments enable row level security;

-- El profesional decide, servicio a servicio, si los alumnos pueden escribir dudas.
alter table services add column if not exists comments_enabled boolean not null default false;
