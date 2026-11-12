-- Cuota de almacenamiento por proveedor (GB incluidos en la comisión).
-- Por defecto 50 GB; se puede subir a mano para un proveedor concreto:
--   update providers set storage_quota_gb = 200 where user_id = '...';
alter table public.providers
  add column if not exists storage_quota_gb integer not null default 50;
