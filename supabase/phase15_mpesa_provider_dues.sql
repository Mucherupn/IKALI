-- Phase 15: M-Pesa provider commission payments

create table if not exists public.mpesa_payments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  phone text not null,
  checkout_request_id text not null,
  merchant_request_id text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  result_code integer,
  result_description text,
  mpesa_receipt_number text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  raw_callback jsonb
);

create index if not exists mpesa_payments_provider_created_at_idx
  on public.mpesa_payments(provider_id, created_at desc);

create unique index if not exists mpesa_payments_checkout_request_id_uniq
  on public.mpesa_payments(checkout_request_id);

create unique index if not exists mpesa_payments_merchant_request_id_uniq
  on public.mpesa_payments(merchant_request_id);
