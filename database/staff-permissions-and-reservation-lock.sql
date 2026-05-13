-- Fine-grained staff permissions and stronger public reservation locking.
-- Run this after security-rls-policies.sql and admin-users.sql.

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
  service_duration_minutes integer;
  service_requires_lash boolean;
  active_lashists integer;
  occupied_lashists integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_date::text || ':' || p_time::text));

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

  select id, price, is_active, category, duration_minutes, package_includes_lashes
  into found_service
  from public.services
  where id = p_service_id
  limit 1;

  if found_service.id is null or found_service.is_active is not true then
    raise exception 'Servicio no disponible.';
  end if;

  service_requires_lash :=
    found_service.category = 'Pestañas'
    or coalesce(found_service.package_includes_lashes, false) = true;

  service_duration_minutes :=
    case
      when found_service.category = 'Pestañas' then 120
      else coalesce(found_service.duration_minutes, 60)
    end;

  if exists (
    select 1
    from public.schedule_blocks
    where schedule_blocks.date = p_date
      and schedule_blocks.lashist_id is null
      and (
        schedule_blocks.is_full_day = true
        or schedule_blocks.time::time = p_time
      )
  ) then
    raise exception 'Ese horario no está disponible.';
  end if;

  if exists (
    select 1
    from public.appointments
    where appointments.date = p_date
      and appointments.time::time = p_time
      and appointments.client_id in (
        select clients.id from public.clients where clients.phone = normalized_phone
      )
      and appointments.status <> 'cancelled'
  ) then
    raise exception 'Ya tienes una reserva activa en ese horario.';
  end if;

  if service_requires_lash then
    select count(*)::integer
    into active_lashists
    from public.lashists
    where is_active = true;

    if active_lashists <= 0 then
      raise exception 'No hay lashistas activas para este servicio.';
    end if;

    select count(*)::integer
    into occupied_lashists
    from public.appointments
    join public.services on services.id = appointments.service_id
    where appointments.date = p_date
      and appointments.status not in ('cancelled', 'no_show')
      and (
        services.category = 'Pestañas'
        or coalesce(services.package_includes_lashes, false) = true
      )
      and appointments.time::time < p_time + (service_duration_minutes || ' minutes')::interval
      and p_time < appointments.time::time + (
        case
          when services.category = 'Pestañas' then 120
          else coalesce(services.duration_minutes, 60)
        end || ' minutes'
      )::interval;

    if occupied_lashists >= active_lashists then
      raise exception 'Ese horario ya no está disponible.';
    end if;
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

drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Owners can manage services" on public.services;
create policy "Owners can manage services"
  on public.services
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());

drop policy if exists "Admins can manage service package items" on public.service_package_items;
drop policy if exists "Owners can manage service package items" on public.service_package_items;
create policy "Owners can manage service package items"
  on public.service_package_items
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());

drop policy if exists "Admins can manage promos" on public.promos;
drop policy if exists "Owners can manage promos" on public.promos;
create policy "Owners can manage promos"
  on public.promos
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());

drop policy if exists "Admins can manage lashists" on public.lashists;
drop policy if exists "Owners can manage lashists" on public.lashists;
create policy "Owners can manage lashists"
  on public.lashists
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());

drop policy if exists "Admins can manage clients" on public.clients;
drop policy if exists "Operational users can manage clients" on public.clients;
create policy "Operational users can manage clients"
  on public.clients
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can read appointments" on public.appointments;
drop policy if exists "Operational users can read appointments" on public.appointments;
create policy "Operational users can read appointments"
  on public.appointments
  for select
  using (public.is_admin_user());

drop policy if exists "Admins can manage appointments" on public.appointments;
drop policy if exists "Operational users can manage appointments" on public.appointments;
create policy "Operational users can manage appointments"
  on public.appointments
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can manage payments" on public.payments;
drop policy if exists "Operational users can manage payments" on public.payments;
create policy "Operational users can manage payments"
  on public.payments
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can read schedule blocks" on public.schedule_blocks;
drop policy if exists "Operational users can read schedule blocks" on public.schedule_blocks;
create policy "Operational users can read schedule blocks"
  on public.schedule_blocks
  for select
  using (public.is_admin_user());

drop policy if exists "Admins can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Operational users can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Owners can manage schedule blocks" on public.schedule_blocks;
create policy "Owners can manage schedule blocks"
  on public.schedule_blocks
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());

drop policy if exists "Admins can read appointment audit logs" on public.appointment_audit_logs;
drop policy if exists "Owners can read appointment audit logs" on public.appointment_audit_logs;
create policy "Owners can read appointment audit logs"
  on public.appointment_audit_logs
  for select
  using (public.is_owner_user());

drop policy if exists "Admins can insert appointment audit logs" on public.appointment_audit_logs;
drop policy if exists "Operational users can insert appointment audit logs" on public.appointment_audit_logs;
create policy "Operational users can insert appointment audit logs"
  on public.appointment_audit_logs
  for insert
  with check (public.is_admin_user());
