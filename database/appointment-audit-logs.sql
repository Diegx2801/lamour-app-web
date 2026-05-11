create table if not exists public.appointment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  action text not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists appointment_audit_logs_appointment_id_idx
  on public.appointment_audit_logs (appointment_id, created_at desc);

alter table public.appointment_audit_logs enable row level security;

drop policy if exists "Admins can read appointment audit logs" on public.appointment_audit_logs;
create policy "Admins can read appointment audit logs"
  on public.appointment_audit_logs
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner', 'staff')
    )
  );

drop policy if exists "Admins can insert appointment audit logs" on public.appointment_audit_logs;
create policy "Admins can insert appointment audit logs"
  on public.appointment_audit_logs
  for insert
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner', 'staff')
    )
  );
