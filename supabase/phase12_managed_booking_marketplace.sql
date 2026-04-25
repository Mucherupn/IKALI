-- Phase 12 managed booking marketplace
-- Goal: support customer-to-provider booking requests where providers must accept before jobs become active.
-- Backward compatibility: legacy columns (customer_name, customer_phone, preferred_date, preferred_time) remain intact.

alter table public.job_requests
  add column if not exists customer_id uuid references public.profiles(id) on delete set null,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists accepted_at timestamptz,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_reason text;

-- Normalize default status for new requests.
alter table public.job_requests
  alter column status set default 'requested';

-- Optional status guard (enable after legacy values are migrated).
-- alter table public.job_requests
--   add constraint job_requests_status_marketplace_check
--   check (status in ('requested', 'accepted', 'in_progress', 'completed', 'cancelled'));

create index if not exists job_requests_customer_id_idx on public.job_requests(customer_id);
create index if not exists job_requests_provider_id_idx on public.job_requests(provider_id);
create index if not exists job_requests_status_idx on public.job_requests(status);
