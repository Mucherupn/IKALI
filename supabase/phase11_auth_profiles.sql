-- Phase 11 auth and profiles foundation
-- Adds user profile records with roles for customer/provider/admin access control.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text,
  full_name text,
  phone text,
  email text,
  default_location text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('customer', 'provider', 'admin'))
);

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
