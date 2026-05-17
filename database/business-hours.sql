-- Editable business hours connected to public reservation availability.
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null unique check (day_of_week between 0 and 6),
  day_label text not null,
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  slot_interval_minutes integer not null default 60 check (slot_interval_minutes in (30, 60)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_hours_time_order check (
    is_closed = true
    or (open_time is not null and close_time is not null and open_time < close_time)
  )
);

alter table public.business_hours enable row level security;

insert into public.business_hours
  (day_of_week, day_label, open_time, close_time, is_closed, slot_interval_minutes)
values
  (1, 'Lunes', '09:00', '19:00', false, 60),
  (2, 'Martes', '09:00', '19:00', false, 60),
  (3, 'Miércoles', '09:00', '19:00', false, 60),
  (4, 'Jueves', '09:00', '19:00', false, 60),
  (5, 'Viernes', '09:00', '19:00', false, 60),
  (6, 'Sábado', '09:00', '19:00', false, 60),
  (0, 'Domingo', null, null, true, 60)
on conflict (day_of_week) do nothing;

drop policy if exists "Public can read business hours" on public.business_hours;
create policy "Public can read business hours"
  on public.business_hours
  for select
  using (true);

drop policy if exists "Owners can manage business hours" on public.business_hours;
create policy "Owners can manage business hours"
  on public.business_hours
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());
