-- ============================================================
-- COXIRO — Esquema de base de datos del MVP
-- Motor objetivo: PostgreSQL 15+
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- USERS: tabla base de identidad. Un usuario puede ser
-- proveedor, cliente, o ambos a la vez (ver providers/clients).
-- ------------------------------------------------------------
create table users (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  password_hash   text not null,
  role            text not null default 'client', -- 'provider' | 'client' | 'admin'
  full_name       text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PROVIDERS: perfil de negocio del profesional que vende.
-- stripe_account_id es la cuenta conectada (Stripe Connect
-- Express) que recibe los pagos tras retener la comisión.
-- ------------------------------------------------------------
create table providers (
  user_id             uuid primary key references users(id) on delete cascade,
  business_name       text not null,
  tax_id              text,               -- NIF/CIF del profesional
  category            text,               -- 'abogado','ingeniero','arquitecto','formador', etc.
  stripe_account_id   text unique,        -- ej. 'acct_1AbCdEfGhIjK'
  kyc_status          text not null default 'pending', -- 'pending' | 'verified' | 'restricted'
  commission_rate     numeric(5,2) not null default 10.00, -- % que retiene Coxiro
  created_at          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CLIENTS: perfil de facturación del cliente final.
-- ------------------------------------------------------------
create table clients (
  user_id       uuid primary key references users(id) on delete cascade,
  billing_name  text,
  tax_id        text,
  country       char(2), -- ISO 3166-1 alpha-2, ej. 'ES'
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SERVICES: lo que el proveedor vende. 'type' distingue entre
-- contenido descargable, mentoría/consulta agendada, o acceso
-- a un área privada continuada (curso).
-- ------------------------------------------------------------
create table services (
  id            uuid primary key default uuid_generate_v4(),
  provider_id   uuid not null references providers(user_id) on delete cascade,
  title         text not null,
  description   text,
  price         numeric(10,2) not null,
  currency      char(3) not null default 'EUR',
  type          text not null default 'content', -- 'content' | 'consult' | 'course'
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CONTENT_ITEMS: materiales asociados a un servicio (vídeo,
-- PDF, enlace de reunión...). file_url apunta a almacenamiento
-- externo (S3 / Cloudflare R2 / Mux), no se guarda el binario aquí.
-- ------------------------------------------------------------
create table content_items (
  id            uuid primary key default uuid_generate_v4(),
  service_id    uuid not null references services(id) on delete cascade,
  title         text not null,
  file_url      text not null,
  content_type  text not null, -- 'video' | 'pdf' | 'link' | 'document'
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TRANSACTIONS: el evento central. Cada compra genera una fila.
-- amount_total es lo que paga el cliente; platform_fee es lo
-- que retiene Coxiro; provider_net = amount_total - platform_fee
-- es lo que se transfiere a la cuenta Stripe Connect del proveedor.
-- ------------------------------------------------------------
create table transactions (
  id                          uuid primary key default uuid_generate_v4(),
  service_id                  uuid not null references services(id),
  client_id                   uuid not null references clients(user_id),
  provider_id                 uuid not null references providers(user_id),
  amount_total                numeric(10,2) not null,
  platform_fee                numeric(10,2) not null,
  provider_net                numeric(10,2) generated always as (amount_total - platform_fee) stored,
  currency                    char(3) not null default 'EUR',
  stripe_payment_intent_id    text unique,
  stripe_transfer_id          text, -- transferencia a la cuenta conectada del proveedor
  status                      text not null default 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  created_at                  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- INVOICES: documento fiscal. Una transacción genera DOS filas
-- aquí: una factura al cliente final, y una liquidación/factura
-- de comisión al proveedor. Esto es lo que da valor añadido
-- real frente a ser un simple intermediario.
-- ------------------------------------------------------------
create table invoices (
  id                uuid primary key default uuid_generate_v4(),
  transaction_id    uuid not null references transactions(id) on delete cascade,
  type              text not null, -- 'client_invoice' | 'provider_settlement'
  invoice_number    text unique not null,
  pdf_url           text,
  issued_at         timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CONTENT_ACCESS: desbloquea el acceso tras el pago confirmado.
-- expires_at permite en el futuro accesos temporales (ej.
-- suscripciones) sin cambiar el esquema.
-- ------------------------------------------------------------
create table content_access (
  id                uuid primary key default uuid_generate_v4(),
  transaction_id    uuid not null references transactions(id) on delete cascade,
  client_id         uuid not null references clients(user_id),
  service_id        uuid not null references services(id),
  granted_at        timestamptz not null default now(),
  expires_at        timestamptz -- NULL = acceso permanente
);

-- ------------------------------------------------------------
-- Índices para las consultas más frecuentes del dashboard
-- ------------------------------------------------------------
create index idx_services_provider on services(provider_id);
create index idx_transactions_provider on transactions(provider_id);
create index idx_transactions_client on transactions(client_id);
create index idx_content_access_client on content_access(client_id);
