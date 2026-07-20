-- Campos fiscales completos que debe tener cualquier factura española
alter table invoices add column tax_base numeric(10,2);
alter table invoices add column tax_rate numeric(5,2) default 21.00;
alter table invoices add column tax_amount numeric(10,2);
alter table invoices add column total numeric(10,2);
alter table invoices add column concept text;

-- Datos del emisor y del destinatario en el momento de emitir la
-- factura (se guarda una copia aquí, no solo una referencia, para
-- que la factura no cambie retroactivamente si el usuario edita
-- después su perfil -- esto es un requisito legal, no un capricho).
alter table invoices add column issuer_name text;
alter table invoices add column issuer_tax_id text;
alter table invoices add column recipient_name text;
alter table invoices add column recipient_tax_id text;

-- Cadena de huellas (hash encadenado) -- el núcleo de VeriFactu:
-- cada factura incluye el hash de la anterior, formando una cadena
-- que demuestra que no se ha insertado, borrado ni alterado ninguna
-- factura a posteriori.
alter table invoices add column hash text;
alter table invoices add column previous_hash text;

-- Tabla de contadores para la numeración correlativa real (una
-- serie para facturas a cliente, otra para liquidaciones a
-- proveedor -- cada una con su propia numeración sin huecos).
create table invoice_counters (
  series text primary key,
  last_seq integer not null default 0
);

insert into invoice_counters (series, last_seq) values ('CLI', 0), ('PROV', 0);

-- Se bloquea por completo: solo el webhook (con la service role key,
-- que se salta RLS) debe poder tocar esta tabla.
alter table invoice_counters enable row level security;

-- Incrementa y devuelve el número de forma atómica -- imprescindible
-- para que dos ventas simultáneas nunca puedan repetir un número de
-- factura (rompería la cadena de VeriFactu).
create or replace function increment_invoice_counter(p_series text)
returns integer
language plpgsql
as $$
declare
  new_seq integer;
begin
  update invoice_counters
  set last_seq = last_seq + 1
  where series = p_series
  returning last_seq into new_seq;

  return new_seq;
end;
$$;
