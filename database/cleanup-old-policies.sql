-- Cleanup old/duplicate policies after final-security-hardening.sql.
-- Goal: remove permissive legacy names and keep the current role model:
-- owner = full admin, staff = agenda/operations, public = only public reads/RPC.

-- APPOINTMENTS
drop policy if exists "Admin can delete appointments" on public.appointments;
drop policy if exists "Admin can insert appointments" on public.appointments;
drop policy if exists "Admin can read appointments" on public.appointments;
drop policy if exists "Admin can update appointments" on public.appointments;
drop policy if exists "Admins can read appointments" on public.appointments;
drop policy if exists "Admins can manage appointments" on public.appointments;
drop policy if exists "Public can insert appointments" on public.appointments;
drop policy if exists "Operational users can read appointments" on public.appointments;
drop policy if exists "Operational users can manage appointments" on public.appointments;

create policy "Operational users can read appointments"
  on public.appointments
  for select
  to authenticated
  using (public.is_operational_user());

create policy "Operational users can manage appointments"
  on public.appointments
  for all
  to authenticated
  using (public.is_operational_user())
  with check (public.is_operational_user());

-- CLIENTS
drop policy if exists "Admin can read clients" on public.clients;
drop policy if exists "Admin can update clients" on public.clients;
drop policy if exists "Admins can manage clients" on public.clients;
drop policy if exists "Public can insert clients" on public.clients;
drop policy if exists "Public can read clients (limited)" on public.clients;
drop policy if exists "Operational users can manage clients" on public.clients;

create policy "Operational users can manage clients"
  on public.clients
  for all
  to authenticated
  using (public.is_operational_user())
  with check (public.is_operational_user());

-- PAYMENTS
drop policy if exists "Admin can delete payments" on public.payments;
drop policy if exists "Admin can insert payments" on public.payments;
drop policy if exists "Admin can read payments" on public.payments;
drop policy if exists "Admin can update payments" on public.payments;
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

-- SCHEDULE BLOCKS
drop policy if exists "Admin can delete schedule blocks" on public.schedule_blocks;
drop policy if exists "Admin can insert schedule blocks" on public.schedule_blocks;
drop policy if exists "Admin can read schedule blocks" on public.schedule_blocks;
drop policy if exists "Admin can update schedule blocks" on public.schedule_blocks;
drop policy if exists "Admins can read schedule blocks" on public.schedule_blocks;
drop policy if exists "Admins can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Operational users can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Operational users can read schedule blocks" on public.schedule_blocks;
drop policy if exists "Owners can manage schedule blocks" on public.schedule_blocks;

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

-- LASHISTS
drop policy if exists "Admin can manage lashists" on public.lashists;
drop policy if exists "Admins can read lashists" on public.lashists;
drop policy if exists "Admins can manage lashists" on public.lashists;
drop policy if exists "Owners can manage lashists" on public.lashists;
drop policy if exists "Operational users can read lashists" on public.lashists;

create policy "Operational users can read lashists"
  on public.lashists
  for select
  to authenticated
  using (public.is_operational_user());

create policy "Owners can manage lashists"
  on public.lashists
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

-- SERVICES AND PACKAGES
drop policy if exists "Admin can manage services" on public.services;
drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Owners can manage services" on public.services;
drop policy if exists "Public can read services" on public.services;

create policy "Owners can manage services"
  on public.services
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

drop policy if exists "Admins can read service package items" on public.service_package_items;
drop policy if exists "Admins can manage service package items" on public.service_package_items;
drop policy if exists "Owners can manage service package items" on public.service_package_items;

create policy "Owners can manage service package items"
  on public.service_package_items
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

-- PROMOS
drop policy if exists "Admin puede gestionar promos" on public.promos;
drop policy if exists "Admins can manage promos" on public.promos;
drop policy if exists "Owners can manage promos" on public.promos;

create policy "Owners can manage promos"
  on public.promos
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

-- PROFILES
drop policy if exists "Owners can manage profiles" on public.profiles;
create policy "Owners can manage profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

-- Keep public read policies only where the public website needs them:
-- services active, package items for active packages, promos active, business hours, site content/images.
