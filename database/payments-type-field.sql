alter table public.payments
  add column if not exists payment_type text default 'deposit';

create index if not exists payments_payment_type_idx
  on public.payments (payment_type);
