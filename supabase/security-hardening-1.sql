-- Endurecimiento de seguridad (fase 11). Es aditivo y se puede ejecutar
-- más de una vez. Ejecutar ANTES de subir el código de la fase 11.
--
-- Problema que corrige: las políticas RLS permitían a cada usuario
-- actualizar SU fila sin limitar columnas, así que cualquiera con su
-- sesión podía, llamando directamente a la API de Supabase, cambiarse
-- la comisión (commission_rate), marcarse como verificado (kyc_status),
-- cambiar su cuenta de cobro, su NIF o el nombre que sale en facturas.

-- 1) Columnas protegidas: solo el servidor (service_role) o el SQL Editor
--    pueden cambiarlas. Un usuario normal recibe un error.
create or replace function public.proteger_columnas_providers()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      -- Alta: valores seguros por defecto, decida lo que decida el cliente.
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
         or new.referred_by is distinct from old.referred_by
         or new.referral_code is distinct from old.referral_code then
        raise exception 'Campo protegido: contacta con soporte para modificarlo';
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_proteger_providers on public.providers;
create trigger trg_proteger_providers
  before insert or update on public.providers
  for each row execute function public.proteger_columnas_providers();

create or replace function public.proteger_columnas_users()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.id is distinct from old.id
       or new.role is distinct from old.role
       or new.full_name is distinct from old.full_name then
      raise exception 'Campo protegido: contacta con soporte para modificarlo';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_proteger_users on public.users;
create trigger trg_proteger_users
  before update on public.users
  for each row execute function public.proteger_columnas_users();

create or replace function public.proteger_columnas_clients()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.user_id is distinct from old.user_id
       or new.billing_name is distinct from old.billing_name
       or new.tax_id is distinct from old.tax_id then
      raise exception 'Campo protegido: contacta con soporte para modificarlo';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_proteger_clients on public.clients;
create trigger trg_proteger_clients
  before update on public.clients
  for each row execute function public.proteger_columnas_clients();

-- El reparto a terceros (socios) solo lo configura Coxiro.
create or replace function public.proteger_columnas_services()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.secondary_transfer_account_id := null;
      new.secondary_transfer_percent := null;
    elsif new.secondary_transfer_account_id is distinct from old.secondary_transfer_account_id
       or new.secondary_transfer_percent is distinct from old.secondary_transfer_percent
       or new.provider_id is distinct from old.provider_id then
      raise exception 'Campo protegido: contacta con soporte para modificarlo';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_proteger_services on public.services;
create trigger trg_proteger_services
  before insert or update on public.services
  for each row execute function public.proteger_columnas_services();

-- 2) El contador de facturas solo lo usa el servidor.
alter function public.increment_invoice_counter(text) set search_path = public;
revoke execute on function public.increment_invoice_counter(text) from public, anon, authenticated;

-- 3) Permisos mínimos para los roles públicos de la API: nadie necesita
--    TRUNCATE, TRIGGER ni REFERENCES, y el visitante anónimo solo escribe
--    en la lista de espera.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
revoke insert, update, delete on all tables in schema public from anon;
grant insert on public.waitlist to anon;
