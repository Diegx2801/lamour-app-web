-- General admin activity log for changes that are not tied to one appointment.
create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text,
  action text not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_idx
  on public.admin_activity_logs (created_at desc);

create index if not exists admin_activity_logs_entity_idx
  on public.admin_activity_logs (entity_type, entity_id);

alter table public.admin_activity_logs enable row level security;

drop policy if exists "Owners can read admin activity logs" on public.admin_activity_logs;
create policy "Owners can read admin activity logs"
  on public.admin_activity_logs
  for select
  to authenticated
  using (public.is_owner_user());

drop policy if exists "Owners can insert admin activity logs" on public.admin_activity_logs;
create policy "Owners can insert admin activity logs"
  on public.admin_activity_logs
  for insert
  to authenticated
  with check (public.is_owner_user());
