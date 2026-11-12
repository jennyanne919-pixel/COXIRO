-- 1) Servicios archivados: los que tienen ventas no se borran, se archivan.
alter table services add column if not exists archived_at timestamptz;

-- 2) Un cliente puede ver los servicios que ha comprado aunque estén
--    pausados o archivados (para que su historial de compras no pierda el nombre).
drop policy if exists "clientes ven servicios comprados" on services;
create policy "clientes ven servicios comprados" on services
  for select using (
    exists (
      select 1 from transactions t
      where t.service_id = services.id
        and t.client_id = auth.uid()
    )
  );
