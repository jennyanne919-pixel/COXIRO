-- El proveedor puede AÑADIR contenido a servicios que son suyos
create policy "proveedores anaden contenido a sus servicios" on content_items
  for insert with check (
    exists (
      select 1 from services
      where services.id = content_items.service_id
      and services.provider_id = auth.uid()
    )
  );

-- El proveedor puede VER el contenido de sus propios servicios
create policy "proveedores ven contenido de sus servicios" on content_items
  for select using (
    exists (
      select 1 from services
      where services.id = content_items.service_id
      and services.provider_id = auth.uid()
    )
  );

-- El proveedor puede EDITAR el contenido de sus propios servicios
create policy "proveedores editan contenido de sus servicios" on content_items
  for update using (
    exists (
      select 1 from services
      where services.id = content_items.service_id
      and services.provider_id = auth.uid()
    )
  );

-- El proveedor puede BORRAR el contenido de sus propios servicios
create policy "proveedores borran contenido de sus servicios" on content_items
  for delete using (
    exists (
      select 1 from services
      where services.id = content_items.service_id
      and services.provider_id = auth.uid()
    )
  );
