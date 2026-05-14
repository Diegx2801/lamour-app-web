-- Add a dedicated followup role without changing existing owner/staff behavior.
create or replace function public.current_admin_can_read()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner', 'staff', 'followup'), false)
$$;

create or replace function public.current_admin_is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner_user()
$$;

-- Follow-up users only need read access to appointments, clients and services.
drop policy if exists "Followup can read appointments" on public.appointments;
create policy "Followup can read appointments"
  on public.appointments
  for select
  to authenticated
  using (public.current_admin_role() = 'followup');

drop policy if exists "Followup can read clients" on public.clients;
create policy "Followup can read clients"
  on public.clients
  for select
  to authenticated
  using (public.current_admin_role() = 'followup');

drop policy if exists "Followup can read services" on public.services;
create policy "Followup can read services"
  on public.services
  for select
  to authenticated
  using (public.current_admin_role() = 'followup');

drop policy if exists "Followup can read audit logs" on public.appointment_audit_logs;
create policy "Followup can read audit logs"
  on public.appointment_audit_logs
  for select
  to authenticated
  using (public.current_admin_role() = 'followup');
