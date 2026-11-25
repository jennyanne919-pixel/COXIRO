-- Fase 51: leyenda de operación no sujeta en la factura al cliente (cliente fuera de la UE).
alter table public.invoices add column if not exists legend text;
