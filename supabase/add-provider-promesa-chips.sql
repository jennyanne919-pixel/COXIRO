-- Fase 5 (perfil público): frase de promesa (máx. 140 caracteres) y hasta
-- 3 chips de prueba social. Es aditivo: no toca datos existentes.
alter table providers add column if not exists promesa text;
alter table providers add column if not exists chips text[];

alter table providers drop constraint if exists providers_promesa_len;
alter table providers add constraint providers_promesa_len
  check (promesa is null or char_length(promesa) <= 140);

alter table providers drop constraint if exists providers_chips_max3;
alter table providers add constraint providers_chips_max3
  check (chips is null or coalesce(array_length(chips, 1), 0) <= 3);
