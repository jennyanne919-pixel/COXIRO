-- Panel de contenido: secciones, lecciones con varios bloques y progreso.
-- Es aditivo: lo que ya está subido sigue funcionando sin cambios.
-- Ejecutar UNA vez en el SQL Editor de Supabase.

-- 1. Secciones (módulos) de un servicio
create table if not exists public.course_sections (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references public.services(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists course_sections_service_idx on public.course_sections (service_id, sort_order);
alter table public.course_sections enable row level security;

drop policy if exists "proveedores gestionan secciones de sus servicios" on public.course_sections;
create policy "proveedores gestionan secciones de sus servicios" on public.course_sections
  for all
  using (exists (select 1 from public.services s where s.id = course_sections.service_id and s.provider_id = auth.uid()))
  with check (exists (select 1 from public.services s where s.id = course_sections.service_id and s.provider_id = auth.uid()));

-- 2. Una "lección" es una fila de content_items: sección y estado
alter table public.content_items
  add column if not exists section_id uuid references public.course_sections(id) on delete set null,
  add column if not exists status text not null default 'published';
alter table public.content_items drop constraint if exists content_items_status_check;
alter table public.content_items
  add constraint content_items_status_check check (status in ('draft', 'published'));

-- Los clientes solo ven lecciones publicadas (el proveedor las ve todas)
drop policy if exists "clientes ven contenido comprado" on public.content_items;
create policy "clientes ven contenido comprado" on public.content_items
  for select
  using (
    status = 'published'
    and exists (
      select 1 from public.content_access ca
      where ca.service_id = content_items.service_id
        and ca.client_id = auth.uid()
        and (ca.expires_at is null or ca.expires_at > now())
    )
  );

-- 3. Bloques de una lección (texto, vídeo, audio, PDF, archivo, enlace)
create table if not exists public.lesson_blocks (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.content_items(id) on delete cascade,
  type text not null check (type in ('text', 'video', 'audio', 'pdf', 'file', 'link')),
  position integer not null default 0,
  title text,
  text_content text,
  url text,
  r2_key text,
  file_size bigint,
  created_at timestamptz not null default now()
);
create index if not exists lesson_blocks_item_idx on public.lesson_blocks (item_id, position);
alter table public.lesson_blocks enable row level security;

drop policy if exists "proveedores gestionan bloques de sus lecciones" on public.lesson_blocks;
create policy "proveedores gestionan bloques de sus lecciones" on public.lesson_blocks
  for all
  using (exists (
    select 1 from public.content_items ci join public.services s on s.id = ci.service_id
    where ci.id = lesson_blocks.item_id and s.provider_id = auth.uid()))
  with check (exists (
    select 1 from public.content_items ci join public.services s on s.id = ci.service_id
    where ci.id = lesson_blocks.item_id and s.provider_id = auth.uid()));

-- 4. Lección completada por el alumno
alter table public.content_progress add column if not exists completed_at timestamptz;

-- 5. Borrar una lección con progreso de alumnos fallaba (sin ON DELETE CASCADE)
alter table public.content_progress drop constraint if exists content_progress_content_item_id_fkey;
alter table public.content_progress
  add constraint content_progress_content_item_id_fkey
  foreign key (content_item_id) references public.content_items(id) on delete cascade;
