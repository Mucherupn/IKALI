-- Phase 10 payment-readiness migration notes
-- Goal: prepare job_requests for future M-Pesa and other payment workflows without breaking existing flows.

alter table public.job_requests add column if not exists payment_status text;
alter table public.job_requests add column if not exists payment_amount numeric(12,2);
alter table public.job_requests add column if not exists payment_reference text;
alter table public.job_requests add column if not exists payment_phone text;
alter table public.job_requests add column if not exists payment_type text;
alter table public.job_requests add column if not exists paid_at timestamptz;

-- Backwards-compatible defaults for new rows. Existing rows remain untouched.
alter table public.job_requests alter column payment_status set default 'unpaid';

-- Optional safety checks (enable once legacy data is confirmed compatible).
-- alter table public.job_requests
--   add constraint job_requests_payment_status_check
--   check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded'));
--
-- alter table public.job_requests
--   add constraint job_requests_payment_type_check
--   check (payment_type is null or payment_type in ('booking_fee', 'deposit', 'full_payment'));
