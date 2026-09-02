-- Phase 1 / Phase 2 - Minimal auth foundation
-- Profiles table for customer data linked to auth.users
-- Enable RLS and ownership policies

-- Enable UUID generation
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

-- Allow users to read/update their own profile
drop policy if exists "Profiles: users can view own profile" on public.profiles;
create policy "Profiles: users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles: users can update own profile" on public.profiles;
create policy "Profiles: users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Profiles: users can insert own profile" on public.profiles;
create policy "Profiles: users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Optional: allow authenticated users to read public profile info for reviews?
-- For now restrict to owner only.

-- Indexes
create index if not exists profiles_role_idx on public.profiles(role);
