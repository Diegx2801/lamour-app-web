alter table public.schedule_blocks
  add column if not exists lashist_id uuid references public.lashists(id) on delete cascade;

create index if not exists schedule_blocks_lashist_date_idx
  on public.schedule_blocks (date, lashist_id, time);
