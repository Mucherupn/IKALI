-- Phase 5 core tables for I Kali
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text not null unique,
  phone text not null,
  whatsapp text not null,
  location text not null,
  service_area text,
  bio text,
  profile_image_url text,
  is_verified boolean not null default false,
  rating numeric not null default 0,
  completed_jobs integer not null default 0,
  years_experience integer not null default 0,
  price_guide text,
  availability_text text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  service_category_id uuid not null references public.service_categories(id) on delete cascade,
  unique (provider_id, service_category_id)
);

create table if not exists public.job_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  service_category_id uuid not null references public.service_categories(id),
  provider_id uuid references public.providers(id),
  location text not null,
  preferred_date date,
  preferred_time time,
  description text,
  urgency text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  customer_name text not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);
