-- Final security hardening pass.
-- Run after the existing security/admin/role SQL files.

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

create table if not exists public.public_reservation_attempts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  reservation_date date,
  created_at timestamptz not null default now()
);

create index if not exists public_reservation_attempts_phone_created_idx
  on public.public_reservation_attempts (phone, created_at desc);

-- Follow-up is not a separate business role anymore. Keep old users working as agenda.
update public.profiles
set role = 'staff',
    updated_at = now()
where role = 'followup';

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

create or replace function public.is_owner_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner'), false)
$$;

create or replace function public.is_staff_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() = 'staff', false)
$$;

create or replace function public.is_operational_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner', 'staff'), false)
$$;

create or replace function public.can_read_operations()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner', 'staff'), false)
$$;

-- Payments: owner owns caja. Staff can only insert an operational deposit while creating a booking.
alter table public.payments enable row level security;

drop policy if exists "Admins can manage payments" on public.payments;
drop policy if exists "Operational users can manage payments" on public.payments;
drop policy if exists "Owners can read payments" on public.payments;
drop policy if exists "Owners can insert payments" on public.payments;
drop policy if exists "Owners can update payments" on public.payments;
drop policy if exists "Owners can delete payments" on public.payments;
drop policy if exists "Staff can insert reservation deposits" on public.payments;

create policy "Owners can read payments"
  on public.payments
  for select
  to authenticated
  using (public.is_owner_user());

create policy "Owners can insert payments"
  on public.payments
  for insert
  to authenticated
  with check (public.is_owner_user());

create policy "Staff can insert reservation deposits"
  on public.payments
  for insert
  to authenticated
  with check (
    public.is_staff_user()
    and payment_type = 'deposit'
    and status = 'completed'
    and amount > 0
    and amount <= 20
  );

create policy "Owners can update payments"
  on public.payments
  for update
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

create policy "Owners can delete payments"
  on public.payments
  for delete
  to authenticated
  using (public.is_owner_user());

-- Schedule blocks and business hours: owner only writes. Operational roles may read availability.
alter table public.schedule_blocks enable row level security;
alter table public.business_hours enable row level security;

drop policy if exists "Admins can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Operational users can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Owners can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Operational users can read schedule blocks" on public.schedule_blocks;

create policy "Operational users can read schedule blocks"
  on public.schedule_blocks
  for select
  to authenticated
  using (public.is_operational_user());

create policy "Owners can manage schedule blocks"
  on public.schedule_blocks
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

drop policy if exists "Owners can manage business hours" on public.business_hours;
create policy "Owners can manage business hours"
  on public.business_hours
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

-- Admin activity and appointment audit: owner reads; active operational users can insert logs.
alter table public.appointment_audit_logs enable row level security;
alter table public.admin_activity_logs enable row level security;

drop policy if exists "Admins can read appointment audit logs" on public.appointment_audit_logs;
drop policy if exists "Owners can read appointment audit logs" on public.appointment_audit_logs;
drop policy if exists "Followup can read audit logs" on public.appointment_audit_logs;
drop policy if exists "Admins can insert appointment audit logs" on public.appointment_audit_logs;
drop policy if exists "Operational users can insert appointment audit logs" on public.appointment_audit_logs;

create policy "Owners can read appointment audit logs"
  on public.appointment_audit_logs
  for select
  to authenticated
  using (public.is_owner_user());

create policy "Operational users can insert appointment audit logs"
  on public.appointment_audit_logs
  for insert
  to authenticated
  with check (public.is_operational_user());

drop policy if exists "Owners can read admin activity logs" on public.admin_activity_logs;
drop policy if exists "Owners can insert admin activity logs" on public.admin_activity_logs;

create policy "Owners can read admin activity logs"
  on public.admin_activity_logs
  for select
  to authenticated
  using (public.is_owner_user());

create policy "Owners can insert admin activity logs"
  on public.admin_activity_logs
  for insert
  to authenticated
  with check (public.is_owner_user());

-- Public reservation attempts: never directly readable from the client.
alter table public.public_reservation_attempts enable row level security;

drop policy if exists "No direct access to public reservation attempts" on public.public_reservation_attempts;
create policy "No direct access to public reservation attempts"
  on public.public_reservation_attempts
  for all
  using (false)
  with check (false);

-- Optional cleanup helper for rate-limit rows. Run manually if the table grows too much.
create or replace function public.cleanup_public_reservation_attempts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_rows integer;
begin
  if not public.is_owner_user() then
    raise exception 'No autorizado.';
  end if;

  delete from public.public_reservation_attempts
  where created_at < now() - interval '14 days';

  get diagnostics deleted_rows = row_count;
  return deleted_rows;
end;
$$;

revoke all on function public.cleanup_public_reservation_attempts() from public;
grant execute on function public.cleanup_public_reservation_attempts() to authenticated;
