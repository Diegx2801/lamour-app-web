-- L'AMOUR security hardening for Supabase.
-- Run this in Supabase SQL Editor after the table/feature migrations.

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

create table if not exists public.public_reservation_attempts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  reservation_date date,
  created_at timestamptz not null default now()
);

create index if not exists public_reservation_attempts_phone_created_idx
  on public.public_reservation_attempts (phone, created_at desc);

alter table public.public_reservation_attempts enable row level security;

drop policy if exists "No direct access to public reservation attempts" on public.public_reservation_attempts;
create policy "No direct access to public reservation attempts"
  on public.public_reservation_attempts
  for all
  using (false)
  with check (false);

drop function if exists public.create_public_reservation(text, text, uuid, date, time, text);

create or replace function public.create_public_reservation(
  p_full_name text,
  p_phone text,
  p_service_id uuid,
  p_date date,
  p_time time,
  p_notes text default null
)
returns table (
  appointment_id uuid,
  client_id uuid,
  total_price numeric,
  deposit_amount numeric,
  remaining_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text;
  found_client_id uuid;
  found_service record;
  inserted_appointment_id uuid;
  deposit numeric := 10;
begin
  normalized_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  if left(normalized_phone, 2) = '51' and length(normalized_phone) = 11 then
    normalized_phone := right(normalized_phone, 9);
  end if;

  if normalized_phone !~ '^9[0-9]{8}$' then
    raise exception 'Celular inválido.';
  end if;

  if nullif(trim(coalesce(p_full_name, '')), '') is null then
    raise exception 'Ingresa tu nombre completo.';
  end if;

  insert into public.public_reservation_attempts (phone, reservation_date)
  values (normalized_phone, p_date);

  if (
    select count(*)
    from public.public_reservation_attempts
    where phone = normalized_phone
      and created_at >= now() - interval '30 minutes'
  ) > 5 then
    raise exception 'Demasiados intentos. Intenta nuevamente en unos minutos.';
  end if;

  if (
    select count(*)
    from public.public_reservation_attempts
    where phone = normalized_phone
      and created_at >= now() - interval '1 day'
  ) > 12 then
    raise exception 'Has realizado demasiados intentos hoy. Escríbenos por WhatsApp para ayudarte.';
  end if;

  if p_date < current_date then
    raise exception 'No puedes reservar una fecha pasada.';
  end if;

  if extract(isodow from p_date) = 7 then
    raise exception 'No atendemos los domingos.';
  end if;

  select id, price, is_active
  into found_service
  from public.services
  where id = p_service_id
  limit 1;

  if found_service.id is null or found_service.is_active is not true then
    raise exception 'Servicio no disponible.';
  end if;

  if exists (
    select 1
    from public.appointments
    where appointments.date = p_date
      and appointments.time = p_time
      and appointments.client_id in (
        select clients.id from public.clients where clients.phone = normalized_phone
      )
      and appointments.status <> 'cancelled'
  ) then
    raise exception 'Ya tienes una reserva activa en ese horario.';
  end if;

  select id
  into found_client_id
  from public.clients
  where clients.phone = normalized_phone
  order by clients.created_at desc
  limit 1;

  if found_client_id is null then
    insert into public.clients (full_name, phone)
    values (trim(p_full_name), normalized_phone)
    returning id into found_client_id;
  else
    update public.clients
    set full_name = trim(p_full_name),
        phone = normalized_phone
    where clients.id = found_client_id;
  end if;

  insert into public.appointments (
    client_id,
    service_id,
    date,
    time,
    status,
    notes,
    total_price,
    deposit_amount,
    remaining_amount
  )
  values (
    found_client_id,
    p_service_id,
    p_date,
    p_time,
    'pending',
    nullif(trim(coalesce(p_notes, '')), ''),
    found_service.price,
    deposit,
    greatest(found_service.price - deposit, 0)
  )
  returning id into inserted_appointment_id;

  appointment_id := inserted_appointment_id;
  client_id := found_client_id;
  total_price := found_service.price;
  deposit_amount := deposit;
  remaining_amount := greatest(found_service.price - deposit, 0);

  return next;
end;
$$;

revoke all on function public.create_public_reservation(text, text, uuid, date, time, text) from public;
grant execute on function public.create_public_reservation(text, text, uuid, date, time, text) to anon, authenticated;

create or replace function public.get_active_lashist_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.lashists
  where is_active = true
$$;

revoke all on function public.get_active_lashist_count() from public;
grant execute on function public.get_active_lashist_count() to anon, authenticated;

drop function if exists public.get_public_appointments_by_date(date);

create or replace function public.get_public_appointments_by_date(p_date date)
returns table (
  appointment_date date,
  appointment_time text,
  status text,
  service_category text,
  duration_minutes integer,
  package_includes_lashes boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    appointments.date as appointment_date,
    appointments.time::text as appointment_time,
    appointments.status,
    services.category as service_category,
    services.duration_minutes,
    coalesce(services.package_includes_lashes, false) as package_includes_lashes
  from public.appointments
  left join public.services on services.id = appointments.service_id
  where appointments.date = p_date
    and appointments.status <> 'cancelled'
$$;

revoke all on function public.get_public_appointments_by_date(date) from public;
grant execute on function public.get_public_appointments_by_date(date) to anon, authenticated;

drop function if exists public.get_public_schedule_blocks_by_date(date);

create or replace function public.get_public_schedule_blocks_by_date(p_date date)
returns table (
  id uuid,
  block_date date,
  block_time text,
  reason text,
  is_full_day boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    schedule_blocks.id,
    schedule_blocks.date as block_date,
    schedule_blocks.time::text as block_time,
    schedule_blocks.reason,
    schedule_blocks.is_full_day
  from public.schedule_blocks
  where schedule_blocks.date = p_date
    and schedule_blocks.lashist_id is null
$$;

revoke all on function public.get_public_schedule_blocks_by_date(date) from public;
grant execute on function public.get_public_schedule_blocks_by_date(date) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_package_items enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.promos enable row level security;
alter table public.lashists enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.appointment_audit_logs enable row level security;

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

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
  on public.services
  for select
  using (is_active = true or public.is_admin_user());

drop policy if exists "Admins can manage services" on public.services;
create policy "Admins can manage services"
  on public.services
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Public can read active service package items" on public.service_package_items;
create policy "Public can read active service package items"
  on public.service_package_items
  for select
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.services package_service
      join public.services included_service
        on included_service.id = service_package_items.included_service_id
      where package_service.id = service_package_items.package_service_id
        and package_service.is_active = true
        and included_service.is_active = true
    )
  );

drop policy if exists "Admins can manage service package items" on public.service_package_items;
create policy "Admins can manage service package items"
  on public.service_package_items
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can manage clients" on public.clients;
create policy "Admins can manage clients"
  on public.clients
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can read appointments" on public.appointments;
create policy "Admins can read appointments"
  on public.appointments
  for select
  using (public.is_admin_user());

drop policy if exists "Admins can manage appointments" on public.appointments;
create policy "Admins can manage appointments"
  on public.appointments
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can manage payments" on public.payments;
create policy "Admins can manage payments"
  on public.payments
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Public can read active promos" on public.promos;
create policy "Public can read active promos"
  on public.promos
  for select
  using (is_active = true or public.is_admin_user());

drop policy if exists "Admins can manage promos" on public.promos;
create policy "Admins can manage promos"
  on public.promos
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can read lashists" on public.lashists;
create policy "Admins can read lashists"
  on public.lashists
  for select
  using (public.is_admin_user());

drop policy if exists "Admins can manage lashists" on public.lashists;
create policy "Admins can manage lashists"
  on public.lashists
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can read schedule blocks" on public.schedule_blocks;
create policy "Admins can read schedule blocks"
  on public.schedule_blocks
  for select
  using (public.is_admin_user());

drop policy if exists "Admins can manage schedule blocks" on public.schedule_blocks;
create policy "Admins can manage schedule blocks"
  on public.schedule_blocks
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can read appointment audit logs" on public.appointment_audit_logs;
create policy "Admins can read appointment audit logs"
  on public.appointment_audit_logs
  for select
  using (public.is_admin_user());

drop policy if exists "Admins can insert appointment audit logs" on public.appointment_audit_logs;
create policy "Admins can insert appointment audit logs"
  on public.appointment_audit_logs
  for insert
  with check (public.is_admin_user());
