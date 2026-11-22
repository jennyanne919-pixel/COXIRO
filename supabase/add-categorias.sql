-- Fase 44: categorías de profesional/servicio (Formación y cursos | Mentoría y consultoría).
-- Aditivo y repetible. Ejecutar ANTES de subir el código.
-- Todo lo que ya existe queda como «formacion» y «approved»: nada cambia para nadie.

-- 1) Categoría del profesional (la elige al registrarse; después solo Coxiro puede cambiarla).
alter table public.providers add column if not exists fiscal_category text not null default 'formacion';
alter table public.providers drop constraint if exists providers_fiscal_category_check;
alter table public.providers add constraint providers_fiscal_category_check
  check (fiscal_category in ('formacion', 'mentoria'));

-- 2) Categoría del servicio (hereda la del profesional) y estado de revisión.
alter table public.services add column if not exists fiscal_category text not null default 'formacion';
alter table public.services drop constraint if exists services_fiscal_category_check;
alter table public.services add constraint services_fiscal_category_check
  check (fiscal_category in ('formacion', 'mentoria'));
alter table public.services add column if not exists review_status text not null default 'approved';
alter table public.services drop constraint if exists services_review_status_check;
alter table public.services add constraint services_review_status_check
  check (review_status in ('pending', 'approved'));
alter table public.services add column if not exists reviewed_at timestamptz;

-- Los servicios que ya existían heredan la categoría de su profesional.
update public.services s
   set fiscal_category = p.fiscal_category
  from public.providers p
 where p.user_id = s.provider_id;

-- 3) Prueba de aceptación: qué categoría y si marcó la declaración responsable.
alter table public.provider_acceptances add column if not exists fiscal_category text;
alter table public.provider_acceptances add column if not exists declaration boolean not null default false;

-- 4) Historial de cambios de categoría (solo servidor).
create table if not exists public.category_changes (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null,
  service_id  uuid,
  old_value   text,
  new_value   text,
  reason      text,
  changed_by  uuid,
  created_at  timestamptz not null default now()
);
alter table public.category_changes enable row level security;
revoke all on public.category_changes from anon, authenticated;

-- 5) Protección de columnas del profesional: la categoría se elige al insertar
--    y después solo la cambia el servidor / el SQL Editor.
create or replace function public.proteger_columnas_providers()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.commission_rate := 10.00;
      new.kyc_status := 'pending';
      new.stripe_account_id := null;
      new.storage_quota_gb := 50;
      if new.fiscal_category not in ('formacion', 'mentoria') then
        new.fiscal_category := 'formacion';
      end if;
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
         or new.referral_code is distinct from old.referral_code
         or new.storage_quota_gb is distinct from old.storage_quota_gb
         or new.fiscal_category is distinct from old.fiscal_category then
        raise exception 'Campo protegido: contacta con soporte para modificarlo';
      end if;
    end if;
  end if;
  return new;
end $$;

-- 6) Protección en servicios: el profesional no elige la categoría de un servicio
--    ni lo aprueba él mismo. Un servicio nuevo hereda la categoría del profesional;
--    si es de Mentoría y consultoría, nace «pending» hasta que Coxiro lo apruebe.
create or replace function public.proteger_columnas_services()
returns trigger language plpgsql set search_path to 'public' as $$
declare cat text;
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      select fiscal_category into cat from public.providers where user_id = new.provider_id;
      new.fiscal_category := coalesce(cat, 'formacion');
      new.review_status := case when new.fiscal_category = 'mentoria' then 'pending' else 'approved' end;
      new.reviewed_at := null;
    else
      if new.fiscal_category is distinct from old.fiscal_category
         or new.review_status is distinct from old.review_status
         or new.reviewed_at is distinct from old.reviewed_at then
        raise exception 'Campo protegido: contacta con soporte para modificarlo';
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_proteger_columnas_services on public.services;
create trigger trg_proteger_columnas_services
  before insert or update on public.services
  for each row execute function public.proteger_columnas_services();
