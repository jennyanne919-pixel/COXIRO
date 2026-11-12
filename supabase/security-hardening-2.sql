-- Fase 42: endurecimiento de seguridad (ejecutar una vez; se puede repetir sin problema).

-- 1) La cuota de almacenamiento solo la cambia el servidor / el SQL Editor,
--    nunca el propio profesional desde el navegador.
create or replace function public.proteger_columnas_providers()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.commission_rate := 10.00;
      new.kyc_status := 'pending';
      new.stripe_account_id := null;
      new.storage_quota_gb := 50;
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
         or new.storage_quota_gb is distinct from old.storage_quota_gb then
        raise exception 'Campo protegido: contacta con soporte para modificarlo';
      end if;
    end if;
  end if;
  return new;
end $$;

-- 2) Nadie puede darse de alta con un rol inventado (solo client o provider).
create or replace function public.proteger_alta_users()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  if current_user in ('anon', 'authenticated') and new.role not in ('client', 'provider') then
    new.role := 'client';
  end if;
  return new;
end $$;
drop trigger if exists trg_proteger_alta_users on public.users;
create trigger trg_proteger_alta_users before insert on public.users
  for each row execute function public.proteger_alta_users();

-- 3) Bucket público de imágenes: solo imágenes, máximo 4 MB, y cada usuario
--    solo puede subir archivos con su propio id en el nombre.
update storage.buckets
   set file_size_limit = 4194304,
       allowed_mime_types = array['image/jpeg','image/png','image/webp']
 where id = 'service-images';

drop policy if exists "Usuarios con sesion pueden subir imagenes de servicios" on storage.objects;
create policy "Usuarios suben sus propias imagenes de servicios" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'service-images'
    and (name like auth.uid()::text || '-%' or name like 'avatar-' || auth.uid()::text || '-%')
  );

-- 4) Tablas que solo usa el servidor: se retiran los permisos directos
--    (con RLS ya estaban bloqueadas; esto es una segunda barrera).
revoke all on public.admin_refunds, public.email_logs, public.expenses,
  public.invoice_counters, public.lesson_comments, public.live_sessions
  from anon, authenticated;
