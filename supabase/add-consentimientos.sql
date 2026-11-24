-- Fase 48: aceptación de términos y elección de inicio anticipado en cada compra.
-- Ejecutar ANTES de subir el código. Seguro de repetir.

alter table public.transactions
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists early_start boolean,
  add column if not exists early_start_type text;

-- Si el alumno no pide el inicio anticipado de un contenido grabado, el acceso
-- empieza a los 14 días (fin del plazo de desistimiento).
alter table public.content_access
  add column if not exists access_from timestamptz;

drop policy if exists "cliente ve su acceso a contenido" on public.content_access;
create policy "cliente ve su acceso a contenido" on public.content_access
  for select using (
    auth.uid() = client_id
    and (expires_at is null or expires_at > now())
    and (access_from is null or access_from <= now())
  );

drop policy if exists "clientes ven contenido comprado" on public.content_items;
create policy "clientes ven contenido comprado" on public.content_items
  for select using (
    status = 'published' and exists (
      select 1 from public.content_access ca
      where ca.service_id = content_items.service_id
        and ca.client_id = auth.uid()
        and (ca.expires_at is null or ca.expires_at > now())
        and (ca.access_from is null or ca.access_from <= now())
    )
  );
