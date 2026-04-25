-- Phase 13 job completion + two-sided review flow

create table if not exists public.job_completions (
  id uuid primary key default gen_random_uuid(),
  job_request_id uuid not null references public.job_requests(id) on delete cascade,
  provider_reported_amount numeric,
  customer_reported_amount numeric,
  final_amount_used numeric,
  amount_difference numeric,
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  unique (job_request_id)
);

-- Existing phase schemas already include public.reviews with a simpler shape.
-- Extend it to support role-based reviewer/reviewee flows.
alter table public.reviews
  add column if not exists job_request_id uuid references public.job_requests(id) on delete cascade,
  add column if not exists reviewer_id uuid references public.profiles(id) on delete cascade,
  add column if not exists reviewee_id uuid references public.profiles(id) on delete cascade,
  add column if not exists reviewer_role text;

create index if not exists job_completions_job_request_id_idx on public.job_completions(job_request_id);
create index if not exists job_completions_is_flagged_idx on public.job_completions(is_flagged);

create index if not exists reviews_job_request_id_idx on public.reviews(job_request_id);
create index if not exists reviews_reviewee_id_idx on public.reviews(reviewee_id);
create index if not exists reviews_reviewer_id_idx on public.reviews(reviewer_id);
