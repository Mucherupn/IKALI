-- Phase auth + pro application hardening
-- Safe migration to stabilize signup/profile creation and pro application onboarding.

alter table public.profiles
  add column if not exists role text,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists default_location text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists pro_application_status text not null default 'not_applied';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'provider', 'admin'));

alter table public.profiles
  drop constraint if exists profiles_pro_application_status_check;

alter table public.profiles
  add constraint profiles_pro_application_status_check
  check (pro_application_status in ('not_applied', 'pending', 'approved', 'rejected'));

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

create policy if not exists "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy if not exists "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy if not exists "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.pro_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  main_service_category_id uuid references public.service_categories(id),
  other_services text,
  service_areas text not null,
  years_experience integer not null default 0,
  bio text not null,
  availability text not null,
  price_guide text,
  profile_photo_url text not null,
  proof_document_url text,
  portfolio_notes text,
  status text not null default 'pending',
  admin_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pro_applications
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists main_service_category_id uuid references public.service_categories(id),
  add column if not exists other_services text,
  add column if not exists service_areas text,
  add column if not exists years_experience integer not null default 0,
  add column if not exists bio text,
  add column if not exists availability text,
  add column if not exists price_guide text,
  add column if not exists profile_photo_url text,
  add column if not exists proof_document_url text,
  add column if not exists portfolio_notes text,
  add column if not exists status text not null default 'pending',
  add column if not exists admin_notes text,
  add column if not exists rejection_reason text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.pro_applications
set
  full_name = coalesce(full_name, ''),
  email = coalesce(email, ''),
  phone = coalesce(phone, ''),
  location = coalesce(location, ''),
  service_areas = coalesce(service_areas, ''),
  bio = coalesce(bio, ''),
  availability = coalesce(availability, ''),
  profile_photo_url = coalesce(profile_photo_url, 'placeholder://profile-photo')
where full_name is null
   or email is null
   or phone is null
   or location is null
   or service_areas is null
   or bio is null
   or availability is null
   or profile_photo_url is null;

alter table public.pro_applications
  alter column user_id set not null,
  alter column full_name set not null,
  alter column email set not null,
  alter column phone set not null,
  alter column location set not null,
  alter column service_areas set not null,
  alter column bio set not null,
  alter column availability set not null,
  alter column profile_photo_url set not null;

alter table public.pro_applications
  drop constraint if exists pro_applications_status_check;

alter table public.pro_applications
  add constraint pro_applications_status_check
  check (status in ('pending', 'approved', 'rejected', 'needs_more_info'));

create index if not exists pro_applications_user_status_idx on public.pro_applications(user_id, status, created_at desc);
create unique index if not exists pro_applications_single_pending_idx
  on public.pro_applications(user_id)
  where status in ('pending', 'needs_more_info');

create or replace function public.set_pro_applications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_pro_applications_updated_at on public.pro_applications;
create trigger set_pro_applications_updated_at
before update on public.pro_applications
for each row
execute function public.set_pro_applications_updated_at();

alter table public.pro_applications enable row level security;

create policy if not exists "Pro applications are insertable by owner"
  on public.pro_applications
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Pro applications are viewable by owner"
  on public.pro_applications
  for select
  using (auth.uid() = user_id);

create policy if not exists "Pro applications are updatable by owner while pending"
  on public.pro_applications
  for update
  using (auth.uid() = user_id and status in ('pending', 'needs_more_info', 'rejected'))
  with check (auth.uid() = user_id);

-- TODO: add explicit admin policies once admin auth helpers are finalized.
