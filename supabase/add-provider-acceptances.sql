-- Fase 17: prueba de aceptación de las condiciones del proveedor.
-- Aditivo; se puede ejecutar más de una vez. Ejecutar ANTES de subir el código.

-- 1) Registro de aceptaciones. Se conserva 6 años (sin clave foránea a propósito,
--    para que borrar una cuenta no borre la prueba).
create table if not exists public.provider_acceptances (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  document        text not null,                 -- 'condiciones_proveedor'
  version         text not null,                 -- p. ej. '2026-11-07'
  accepted_at     timestamptz not null default now(),
  ip              text,
  user_agent      text,
  commission_rate numeric(5,2),                  -- comisión vigente al aceptar
  source          text not null default 'registro' -- 'registro' | 'reaceptacion'
);

create index if not exists provider_acceptances_user_idx
  on public.provider_acceptances (user_id, document, version);

alter table public.provider_acceptances enable row level security;

-- Cada profesional solo puede LEER las suyas. Nadie escribe desde el navegador:
-- las inserta el servidor (service_role, que se salta RLS).
drop policy if exists "ver_mis_aceptaciones" on public.provider_acceptances;
create policy "ver_mis_aceptaciones" on public.provider_acceptances
  for select to authenticated using (auth.uid() = user_id);

revoke all on public.provider_acceptances from anon, authenticated;
grant select on public.provider_acceptances to authenticated;

-- 2) Representante de la sociedad (nombre ya va en users.full_name; aquí el NIF/NIE).
alter table public.providers add column if not exists representative_name text;
alter table public.providers add column if not exists representative_tax_id text;

-- 3) Protegerlas igual que el resto de datos de identidad (solo servidor).
create or replace function public.proteger_columnas_providers()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.commission_rate := 10.00;
      new.kyc_status := 'pending';
      new.stripe_account_id := null;
    else
      if new.user_id is distinct from old.user_id
         or new.commission_rate is distinct from old.commission_rate
         or new.kyc_status is distinct from old.kyc_status
         or new.stripe_account_id is distinct from old.stripe_account_id
         or new.tax_id is distinct from old.tax_id
         or new.legal_name is distinct from old.legal_name
         or new.legal_type is distinct from old.legal_type
         or new.representative_name is distinct from old.representative_name
         or new.representative_tax_id is distinct from old.representative_tax_id
         or new.referred_by is distinct from old.referred_by
         or new.referral_code is distinct from old.referral_code then
        raise exception 'Campo protegido: contacta con soporte para modificarlo';
      end if;
    end if;
  end if;
  return new;
end $$;
