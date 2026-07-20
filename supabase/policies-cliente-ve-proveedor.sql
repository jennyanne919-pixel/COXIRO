create policy "clientes ven proveedores a los que han comprado" on providers
  for select using (
    exists (
      select 1 from transactions
      where transactions.provider_id = providers.user_id
      and transactions.client_id = auth.uid()
    )
  );
