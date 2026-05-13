-- Staff can read schedule blocks, but only owner/admin can create or remove them.

drop policy if exists "Admins can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Operational users can manage schedule blocks" on public.schedule_blocks;
drop policy if exists "Owners can manage schedule blocks" on public.schedule_blocks;

create policy "Owners can manage schedule blocks"
  on public.schedule_blocks
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());
