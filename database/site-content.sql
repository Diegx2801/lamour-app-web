create table if not exists public.site_content_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('hero', 'gallery')),
  title text not null,
  subtitle text,
  category text,
  image_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_content_items_section_order_idx
  on public.site_content_items (section, is_active, sort_order);

alter table public.site_content_items enable row level security;

drop policy if exists "Public can read active site content" on public.site_content_items;
create policy "Public can read active site content"
  on public.site_content_items
  for select
  using (is_active = true or public.is_owner_user());

drop policy if exists "Owners can manage site content" on public.site_content_items;
create policy "Owners can manage site content"
  on public.site_content_items
  for all
  using (public.is_owner_user())
  with check (public.is_owner_user());

insert into storage.buckets (id, name, public)
values ('site-content', 'site-content', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read site content images" on storage.objects;
create policy "Public can read site content images"
  on storage.objects
  for select
  using (bucket_id = 'site-content');

drop policy if exists "Owners can upload site content images" on storage.objects;
create policy "Owners can upload site content images"
  on storage.objects
  for insert
  with check (bucket_id = 'site-content' and public.is_owner_user());

drop policy if exists "Owners can update site content images" on storage.objects;
create policy "Owners can update site content images"
  on storage.objects
  for update
  using (bucket_id = 'site-content' and public.is_owner_user())
  with check (bucket_id = 'site-content' and public.is_owner_user());

drop policy if exists "Owners can delete site content images" on storage.objects;
create policy "Owners can delete site content images"
  on storage.objects
  for delete
  using (bucket_id = 'site-content' and public.is_owner_user());

do $$
begin
  alter publication supabase_realtime add table public.site_content_items;
exception
  when duplicate_object then null;
end $$;
