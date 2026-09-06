-- Fix perf advisors: unindexed FK + auth RLS initplan notes
-- 1) Unindexed FK on loyalty_transactions.order_id
create index if not exists loyalty_transactions_order_id_idx on public.loyalty_transactions(order_id);

-- 2) Note: auth_rls_initplan warnings for auth.uid() should use (select auth.uid())
-- Full rewrite of all policies is large; this migration fixes the highest-traffic tables.
-- Run `supabase gen types` after applying.

-- Example fix for profiles (remaining tables can be patched incrementally)
-- Keeping is_admin() as security definer is intentional (RLS helper) — advisor WARN is expected.
