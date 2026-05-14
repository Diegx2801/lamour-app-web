-- Daily cash closures.
create table if not exists public.cash_closures (
  id uuid primary key default gen_random_uuid(),
  cash_date date not null unique,
  expected_amount numeric(10, 2) not null default 0,
  counted_amount numeric(10, 2) not null default 0,
  difference_amount numeric(10, 2) not null default 0,
  notes text,
  closed_by uuid references auth.users(id) on delete set null,
  closed_by_email text,
  closed_at timestamptz not null default now(),
  reopened_by uuid references auth.users(id) on delete set null,
  reopened_at timestamptz,
  is_closed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cash_closures enable row level security;

drop policy if exists "Owners can read cash closures" on public.cash_closures;
create policy "Owners can read cash closures"
  on public.cash_closures
  for select
  to authenticated
  using (public.is_owner_user());

drop policy if exists "Owners can manage cash closures" on public.cash_closures;
create policy "Owners can manage cash closures"
  on public.cash_closures
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

create index if not exists cash_closures_cash_date_idx
  on public.cash_closures (cash_date);
