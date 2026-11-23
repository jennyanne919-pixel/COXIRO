-- Fase 45a: ajustes económicos por categoría, editables desde el admin.
-- Aditivo y repetible. Ejecutar ANTES de subir el código.
-- No cambia nada para los profesionales que ya existen: siguen con sus condiciones
-- anteriores hasta que acepten las de su categoría.

create table if not exists public.category_settings (
  category    text primary key check (category in ('formacion', 'mentoria')),
  modo        text not null check (modo in ('comision', 'gancho')),
  porcentaje  numeric(5,2) not null check (porcentaje >= 0 and porcentaje <= 30),
  impuesto_tipo text not null check (impuesto_tipo in ('IVA', 'IPSI')),
  impuesto_pct numeric(5,2) not null check (impuesto_pct >= 0 and impuesto_pct <= 30),
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

-- Solo el servidor lee y escribe aquí (RLS activada y sin políticas).
alter table public.category_settings enable row level security;
revoke all on public.category_settings from anon, authenticated;

insert into public.category_settings (category, modo, porcentaje, impuesto_tipo, impuesto_pct) values
  ('mentoria',  'gancho',   6, 'IPSI', 4),
  ('formacion', 'comision', 5, 'IVA', 21)
on conflict (category) do nothing;

-- Historial de cambios de ajustes (quién, cuándo, antes y después, motivo).
create table if not exists public.category_settings_log (
  id         uuid primary key default gen_random_uuid(),
  category   text not null,
  antes      jsonb,
  despues    jsonb,
  motivo     text,
  changed_by uuid,
  created_at timestamptz not null default now()
);
alter table public.category_settings_log enable row level security;
revoke all on public.category_settings_log from anon, authenticated;

-- Para pedir a un profesional ya existente que acepte las condiciones de su categoría
-- (con 15 días de aviso, hecho por el admin). Solo Coxiro cambia esta columna.
alter table public.providers add column if not exists pending_new_conditions boolean not null default false;

create or replace function public.proteger_columnas_providers()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.commission_rate := 10.00;
      new.kyc_status := 'pending';
      new.stripe_account_id := null;
      new.storage_quota_gb := 50;
      new.pending_new_conditions := false;
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
         or new.fiscal_category is distinct from old.fiscal_category
         or new.pending_new_conditions is distinct from old.pending_new_conditions then
        raise exception 'Campo protegido: contacta con soporte para modificarlo';
      end if;
    end if;
  end if;
  return new;
end $$;
