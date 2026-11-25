-- Fase 52: declaración del comprador en Mentoría (particular).
alter table public.transactions
  add column if not exists comprador_declarado text
  check (comprador_declarado is null or comprador_declarado in ('particular'));
