alter table public.promos
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists service_id uuid references public.services(id) on delete set null;

create index if not exists promos_active_dates_idx
  on public.promos (is_active, start_date, end_date, sort_order);

create index if not exists promos_service_id_idx
  on public.promos (service_id);
