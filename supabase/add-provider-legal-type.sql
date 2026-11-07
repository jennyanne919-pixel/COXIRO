-- Fase 10: profesionales que venden como sociedad (SL, SA...) o como
-- autónomo/persona física. legal_name es el nombre fiscal (razón social
-- o nombre y apellidos) que aparece como emisor en la autofactura;
-- business_name sigue siendo el nombre comercial público.
-- Es aditivo: los profesionales existentes quedan como autónomos.
alter table providers add column if not exists legal_type text not null default 'autonomo';
alter table providers add column if not exists legal_name text;

alter table providers drop constraint if exists providers_legal_type_check;
alter table providers add constraint providers_legal_type_check
  check (legal_type in ('autonomo', 'sociedad'));
