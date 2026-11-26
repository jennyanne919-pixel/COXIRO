-- Fase 53: una empresa residente fuera de la UE puede comprar Mentoría (se registra como 'empresa').
alter table public.transactions drop constraint if exists transactions_comprador_declarado_check;
alter table public.transactions
  add constraint transactions_comprador_declarado_check
  check (comprador_declarado is null or comprador_declarado in ('particular','empresa'));
