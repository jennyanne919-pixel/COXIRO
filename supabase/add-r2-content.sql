alter table content_items add column r2_key text;
alter table content_items add column is_free boolean not null default false;
alter table content_items add column file_size bigint;
alter table content_items add column duration_seconds integer;
