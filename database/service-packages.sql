alter table public.services
  add column if not exists is_package boolean not null default false,
  add column if not exists package_includes_lashes boolean not null default false;

create table if not exists public.service_package_items (
  id uuid primary key default gen_random_uuid(),
  package_service_id uuid not null references public.services(id) on delete cascade,
  included_service_id uuid not null references public.services(id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint service_package_items_unique unique (package_service_id, included_service_id),
  constraint service_package_items_not_self check (package_service_id <> included_service_id)
);

create index if not exists service_package_items_package_idx
  on public.service_package_items (package_service_id, sort_order);

alter table public.service_package_items enable row level security;

drop policy if exists "Admins can read service package items" on public.service_package_items;
create policy "Admins can read service package items"
  on public.service_package_items
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner', 'staff')
    )
  );

drop policy if exists "Admins can manage service package items" on public.service_package_items;
create policy "Admins can manage service package items"
  on public.service_package_items
  for all
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner', 'staff')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner', 'staff')
    )
  );
