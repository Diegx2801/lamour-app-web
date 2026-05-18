-- Merge the old "followup" role into the operational "staff" role.
-- Agenda handles reservations, follow-up and limited loyalty work.

update public.profiles
set role = 'staff',
    updated_at = now()
where role = 'followup';

drop policy if exists "Followup can read appointments" on public.appointments;
drop policy if exists "Followup can read clients" on public.clients;
drop policy if exists "Followup can read services" on public.services;
drop policy if exists "Followup can read audit logs" on public.appointment_audit_logs;

create or replace function public.current_admin_can_read()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner', 'staff'), false)
$$;
