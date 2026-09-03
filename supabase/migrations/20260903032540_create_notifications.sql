create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('order_confirmed','order_shipped','out_for_delivery','delivered','back_in_stock','price_drop','general')),
  title text not null,
  body text,
  data jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "Notifications: owner select" on public.notifications;
create policy "Notifications: owner select" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Notifications: owner insert" on public.notifications;
create policy "Notifications: owner insert" on public.notifications for insert with check (auth.uid() = user_id);
drop policy if exists "Notifications: owner update" on public.notifications;
create policy "Notifications: owner update" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Notifications: owner delete" on public.notifications;
create policy "Notifications: owner delete" on public.notifications for delete using (auth.uid() = user_id);
drop policy if exists "Notifications: admin all" on public.notifications;
create policy "Notifications: admin all" on public.notifications for all using (is_admin()) with check (is_admin());

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  order_updates boolean not null default true,
  back_in_stock boolean not null default true,
  price_drop boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
drop policy if exists "NotifPrefs: owner select" on public.notification_preferences;
create policy "NotifPrefs: owner select" on public.notification_preferences for select using (auth.uid() = user_id);
drop policy if exists "NotifPrefs: owner upsert" on public.notification_preferences;
create policy "NotifPrefs: owner upsert" on public.notification_preferences for insert with check (auth.uid() = user_id);
drop policy if exists "NotifPrefs: owner update" on public.notification_preferences;
create policy "NotifPrefs: owner update" on public.notification_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "NotifPrefs: admin all" on public.notification_preferences;
create policy "NotifPrefs: admin all" on public.notification_preferences for all using (is_admin()) with check (is_admin());
