-- Configurable WhatsApp templates.
create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  title text not null,
  message text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_templates enable row level security;

create or replace function public.current_admin_can_read()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('admin', 'owner', 'staff', 'followup'), false)
$$;

drop policy if exists "Admins can read whatsapp templates" on public.whatsapp_templates;
create policy "Admins can read whatsapp templates"
  on public.whatsapp_templates
  for select
  to authenticated
  using (public.current_admin_can_read());

drop policy if exists "Owners can manage whatsapp templates" on public.whatsapp_templates;
create policy "Owners can manage whatsapp templates"
  on public.whatsapp_templates
  for all
  to authenticated
  using (public.is_owner_user())
  with check (public.is_owner_user());

insert into public.whatsapp_templates (template_key, title, message)
values
  ('confirmation', 'Confirmación de cita', 'Hola {cliente}, te confirmamos tu cita en L’AMOUR para {fecha} a las {hora}. Servicio: {servicio}.'),
  ('reminder', 'Recordatorio de cita', 'Hola {cliente}, te recordamos tu cita de mañana a las {hora} para {servicio}. Te esperamos en L’AMOUR.'),
  ('payment_pending', 'Pago pendiente', 'Hola {cliente}, queda un saldo pendiente de {saldo} de tu cita. Puedes regularizarlo por Yape, Plin o efectivo.'),
  ('retention', 'Recuperación de clienta', 'Hola {cliente}, hace tiempo no te vemos por L’AMOUR. Tenemos opciones lindas para que vuelvas cuando gustes.'),
  ('post_service', 'Post atención', 'Hola {cliente}, gracias por visitarnos. Cualquier molestia o consulta nos escribes y te ayudamos.'),
  ('weekly_lashist', 'Agenda semanal lashista', 'Hola {lashista}, esta es tu agenda de la semana: {agenda}.')
on conflict (template_key) do nothing;
