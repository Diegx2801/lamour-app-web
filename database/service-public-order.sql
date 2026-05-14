alter table public.services
  add column if not exists sort_order integer not null default 0;

create index if not exists services_public_catalog_idx
  on public.services (is_active, category, sort_order, name);
