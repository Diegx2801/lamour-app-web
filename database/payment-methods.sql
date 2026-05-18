-- Métodos de pago administrables.
-- Ejecutar en Supabase SQL Editor.

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_methods_name_not_empty check (length(trim(name)) > 0),
  constraint payment_methods_code_format check (code ~ '^[a-z0-9_]+$')
);

create index if not exists payment_methods_active_sort_idx
  on public.payment_methods (is_active, sort_order, name);

insert into public.payment_methods (name, code, is_active, sort_order)
values
  ('Yape', 'yape', true, 1),
  ('Plin', 'plin', true, 2),
  ('Efectivo', 'efectivo', true, 3)
on conflict (code) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    updated_at = now();

alter table public.payment_methods enable row level security;

drop policy if exists "Operational users can read payment methods" on public.payment_methods;
drop policy if exists "Owners can manage payment methods" on public.payment_methods;

create policy "Operational users can read payment methods"
  on public.payment_methods
  for select
  to authenticated
  using (public.is_operational_user());

create policy "Owners can manage payment methods"
  on public.payment_methods
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());
