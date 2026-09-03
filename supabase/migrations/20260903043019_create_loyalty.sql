create table if not exists public.loyalty_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  tier text not null default 'bronze' check (tier in ('bronze','silver','gold','platinum')),
  referral_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists loyalty_accounts_tier_idx on public.loyalty_accounts(tier);
alter table public.loyalty_accounts enable row level security;
drop policy if exists "Loyalty: owner select" on public.loyalty_accounts;
create policy "Loyalty: owner select" on public.loyalty_accounts for select using (auth.uid() = user_id);
drop policy if exists "Loyalty: owner upsert" on public.loyalty_accounts;
create policy "Loyalty: owner upsert" on public.loyalty_accounts for insert with check (auth.uid() = user_id);
drop policy if exists "Loyalty: owner update" on public.loyalty_accounts;
create policy "Loyalty: owner update" on public.loyalty_accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Loyalty: admin all" on public.loyalty_accounts;
create policy "Loyalty: admin all" on public.loyalty_accounts for all using (is_admin()) with check (is_admin());

create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  points integer not null,
  type text not null check (type in ('earn','redeem','referral','tier_bonus')),
  description text,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_tx_user_idx on public.loyalty_transactions(user_id);
create index if not exists loyalty_tx_created_idx on public.loyalty_transactions(created_at desc);
alter table public.loyalty_transactions enable row level security;
drop policy if exists "LoyaltyTx: owner select" on public.loyalty_transactions;
create policy "LoyaltyTx: owner select" on public.loyalty_transactions for select using (auth.uid() = user_id);
drop policy if exists "LoyaltyTx: owner insert" on public.loyalty_transactions;
create policy "LoyaltyTx: owner insert" on public.loyalty_transactions for insert with check (auth.uid() = user_id);
drop policy if exists "LoyaltyTx: admin all" on public.loyalty_transactions;
create policy "LoyaltyTx: admin all" on public.loyalty_transactions for all using (is_admin()) with check (is_admin());

create or replace function public.handle_loyalty_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists loyalty_accounts_updated_at on public.loyalty_accounts;
create trigger loyalty_accounts_updated_at before update on public.loyalty_accounts for each row execute function public.handle_loyalty_updated_at();

create or replace function public.ensure_loyalty_account() returns trigger as $$
begin
  insert into public.loyalty_accounts (user_id, points, tier, referral_code)
  values (new.id, 0, 'bronze', substr(md5(new.id::text),1,8))
  on conflict (user_id) do nothing;
  return new;
end; $$ language plpgsql security definer set search_path=public;
drop trigger if exists on_profile_created_loyalty on public.profiles;
create trigger on_profile_created_loyalty after insert on public.profiles for each row execute function public.ensure_loyalty_account();
-- backfill existing profiles
insert into public.loyalty_accounts (user_id, points, tier, referral_code)
select id, 0, 'bronze', substr(md5(id::text),1,8) from public.profiles on conflict (user_id) do nothing;
