-- Las políticas de acceso al contenido ahora respetan la caducidad
-- (content_access.expires_at). Un reembolso total pone expires_at = ahora y
-- corta el acceso. Sin fecha (null) el acceso no caduca.

drop policy if exists "cliente ve su acceso a contenido" on content_access;
create policy "cliente ve su acceso a contenido" on content_access
  for select using (
    auth.uid() = client_id
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "clientes ven contenido comprado" on content_items;
create policy "clientes ven contenido comprado" on content_items
  for select using (
    exists (
      select 1 from content_access ca
      where ca.service_id = content_items.service_id
        and ca.client_id = auth.uid()
        and (ca.expires_at is null or ca.expires_at > now())
    )
  );
