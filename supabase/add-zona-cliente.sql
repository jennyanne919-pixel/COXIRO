-- Fase 50: zona de residencia que declara el cliente al comprar (ue / fuera).
alter table public.transactions
  add column if not exists zona_cliente text
  check (zona_cliente is null or zona_cliente in ('ue','fuera'));
