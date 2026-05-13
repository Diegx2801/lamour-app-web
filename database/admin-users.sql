alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists profiles_role_active_idx
  on public.profiles (role, is_active);

create table if not exists public.admin_user_audit_logs (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid references auth.users(id) on delete set null,
  target_email text,
  action text not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_user_audit_logs_created_idx
  on public.admin_user_audit_logs (created_at desc);

alter table public.admin_user_audit_logs enable row level security;

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select profiles.role
  from public.profiles
  where profiles.id = auth.uid()
    and coalesce(profiles.is_active, true) = true
  limit 1
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner', 'staff'), false)
$$;

create or replace function public.is_owner_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner'), false)
$$;

drop policy if exists "Owners can read user audit logs" on public.admin_user_audit_logs;
create policy "Owners can read user audit logs"
  on public.admin_user_audit_logs
  for select
  using (public.is_owner_user());

drop policy if exists "Owners can insert user audit logs" on public.admin_user_audit_logs;
create policy "Owners can insert user audit logs"
  on public.admin_user_audit_logs
  for insert
  with check (public.is_owner_user());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (id = auth.uid() or public.is_owner_user());

drop policy if exists "Owners can manage profiles" on public.profiles;
create policy "Owners can manage profiles"
  on public.profiles
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());
