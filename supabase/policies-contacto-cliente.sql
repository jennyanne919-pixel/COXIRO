-- El proveedor puede ver el nombre de facturación de un cliente
-- SOLO si existe una transacción entre ambos (no de cualquier
-- cliente de la plataforma, solo los suyos).
create policy "proveedores ven clientes con los que han vendido" on clients
  for select using (
    exists (
      select 1 from transactions
      where transactions.client_id = clients.user_id
      and transactions.provider_id = auth.uid()
    )
  );

-- Mismo criterio para poder ver el email (vive en la tabla users,
-- no en clients) -- necesario para poder contactar tras la venta,
-- por ejemplo en mentorías donde no hay contenido ni chat interno.
create policy "proveedores ven email de clientes con los que han vendido" on users
  for select using (
    exists (
      select 1 from transactions
      where transactions.client_id = users.id
      and transactions.provider_id = auth.uid()
    )
  );
