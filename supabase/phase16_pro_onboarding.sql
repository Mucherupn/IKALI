-- Phase 16: one-account provider onboarding and approval workflow

alter table public.profiles
  add column if not exists pro_application_status text not null default 'not_applied';

alter table public.profiles
  drop constraint if exists profiles_pro_application_status_check;

alter table public.profiles
  add constraint profiles_pro_application_status_check
  check (pro_application_status in ('not_applied', 'pending', 'approved', 'rejected'));

alter table public.providers
  add column if not exists user_id uuid references auth.users(id),
  add column if not exists is_public boolean not null default false,
  add column if not exists approval_status text not null default 'pending',
  add column if not exists provider_status text not null default 'available';

alter table public.providers
  drop constraint if exists providers_approval_status_check;

alter table public.providers
  add constraint providers_approval_status_check
  check (approval_status in ('pending', 'approved', 'rejected'));

create table if not exists public.pro_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  main_service_category_id uuid references public.service_categories(id),
  other_services text,
  service_areas text not null,
  years_experience integer not null default 0,
  bio text not null,
  availability text not null,
  location text not null,
  profile_photo_url text not null,
  proof_document_url text,
  portfolio_notes text,
  price_guide text,
  status text not null default 'pending',
  admin_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pro_applications
  drop constraint if exists pro_applications_status_check;

alter table public.pro_applications
  add constraint pro_applications_status_check
  check (status in ('pending', 'approved', 'rejected', 'needs_more_info'));

create index if not exists pro_applications_user_status_idx on public.pro_applications(user_id, status, created_at desc);
