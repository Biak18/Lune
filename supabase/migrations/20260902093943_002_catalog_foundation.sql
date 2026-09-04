-- 002_catalog_foundation — reconstructed locally for `supabase start`
-- Original was applied remotely via MCP but never committed; this file restores
-- the schema so local `supabase start` can run seeds in lexical order.
-- Idempotent: safe to re-run on remote (IF NOT EXISTS / DROP IF EXISTS).

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Helper: is_admin() used by RLS policies in later migrations
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
grant execute on function public.is_admin() to authenticated, anon;

-- ── categories ──────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_is_active_idx on public.categories(is_active);
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.handle_updated_at();
alter table public.categories enable row level security;
drop policy if exists "Categories: public read" on public.categories;
create policy "Categories: public read" on public.categories for select using (true);
drop policy if exists "Categories: admin all" on public.categories;
create policy "Categories: admin all" on public.categories for all using (is_admin()) with check (is_admin());

-- ── products ────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric not null check (base_price >= 0),
  style text check (style in ('minimal','elegant','romantic','casual','bold')),
  occasion text check (occasion in ('everyday','office','vacation','casual','party','wedding','date_night')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_is_active_idx on public.products(is_active);
create index if not exists products_style_idx on public.products(style);
create index if not exists products_occasion_idx on public.products(occasion);
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.handle_updated_at();
alter table public.products enable row level security;
drop policy if exists "Products: public read" on public.products;
create policy "Products: public read" on public.products for select using (true);
drop policy if exists "Products: admin all" on public.products;
create policy "Products: admin all" on public.products for all using (is_admin()) with check (is_admin());

-- ── product_variants ────────────────────────────────────────────────────
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  color text,
  size text,
  price numeric check (price is null or price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_variants_sku_idx on public.product_variants(sku);
create index if not exists product_variants_stock_idx on public.product_variants(stock_quantity);
drop trigger if exists product_variants_updated_at on public.product_variants;
create trigger product_variants_updated_at before update on public.product_variants for each row execute function public.handle_updated_at();
alter table public.product_variants enable row level security;
drop policy if exists "Variants: public read" on public.product_variants;
create policy "Variants: public read" on public.product_variants for select using (true);
drop policy if exists "Variants: admin all" on public.product_variants;
create policy "Variants: admin all" on public.product_variants for all using (is_admin()) with check (is_admin());

-- ── product_images ──────────────────────────────────────────────────────
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
alter table public.product_images enable row level security;
drop policy if exists "ProductImages: public read" on public.product_images;
create policy "ProductImages: public read" on public.product_images for select using (true);
drop policy if exists "ProductImages: admin all" on public.product_images;
create policy "ProductImages: admin all" on public.product_images for all using (is_admin()) with check (is_admin());

-- ── favorites (wishlist) ────────────────────────────────────────────────
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_product_id_idx on public.favorites(product_id);
alter table public.favorites enable row level security;
drop policy if exists "Favorites: owner select" on public.favorites;
create policy "Favorites: owner select" on public.favorites for select using (auth.uid() = user_id);
drop policy if exists "Favorites: owner insert" on public.favorites;
create policy "Favorites: owner insert" on public.favorites for insert with check (auth.uid() = user_id);
drop policy if exists "Favorites: owner delete" on public.favorites;
create policy "Favorites: owner delete" on public.favorites for delete using (auth.uid() = user_id);
drop policy if exists "Favorites: admin all" on public.favorites;
create policy "Favorites: admin all" on public.favorites for all using (is_admin()) with check (is_admin());

-- ── cart_items ──────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, variant_id)
);
create index if not exists cart_items_user_id_idx on public.cart_items(user_id);
create index if not exists cart_items_variant_id_idx on public.cart_items(variant_id);
drop trigger if exists cart_items_updated_at on public.cart_items;
create trigger cart_items_updated_at before update on public.cart_items for each row execute function public.handle_updated_at();
alter table public.cart_items enable row level security;
drop policy if exists "Cart: owner select" on public.cart_items;
create policy "Cart: owner select" on public.cart_items for select using (auth.uid() = user_id);
drop policy if exists "Cart: owner insert" on public.cart_items;
create policy "Cart: owner insert" on public.cart_items for insert with check (auth.uid() = user_id);
drop policy if exists "Cart: owner update" on public.cart_items;
create policy "Cart: owner update" on public.cart_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Cart: owner delete" on public.cart_items;
create policy "Cart: owner delete" on public.cart_items for delete using (auth.uid() = user_id);
drop policy if exists "Cart: admin all" on public.cart_items;
create policy "Cart: admin all" on public.cart_items for all using (is_admin()) with check (is_admin());

-- ── addresses ───────────────────────────────────────────────────────────
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null default 'US',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_id_idx on public.addresses(user_id);
drop trigger if exists addresses_updated_at on public.addresses;
create trigger addresses_updated_at before update on public.addresses for each row execute function public.handle_updated_at();
alter table public.addresses enable row level security;
drop policy if exists "Addresses: owner select" on public.addresses;
create policy "Addresses: owner select" on public.addresses for select using (auth.uid() = user_id);
drop policy if exists "Addresses: owner insert" on public.addresses;
create policy "Addresses: owner insert" on public.addresses for insert with check (auth.uid() = user_id);
drop policy if exists "Addresses: owner update" on public.addresses;
create policy "Addresses: owner update" on public.addresses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Addresses: owner delete" on public.addresses;
create policy "Addresses: owner delete" on public.addresses for delete using (auth.uid() = user_id);
drop policy if exists "Addresses: admin all" on public.addresses;
create policy "Addresses: admin all" on public.addresses for all using (is_admin()) with check (is_admin());

-- ── orders ──────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled')),
  subtotal numeric not null check (subtotal >= 0),
  shipping_amount numeric not null default 0 check (shipping_amount >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  total numeric not null check (total >= 0),
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.handle_updated_at();
alter table public.orders enable row level security;
drop policy if exists "Orders: owner select" on public.orders;
create policy "Orders: owner select" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Orders: owner insert" on public.orders;
create policy "Orders: owner insert" on public.orders for insert with check (auth.uid() = user_id);
drop policy if exists "Orders: owner update" on public.orders;
create policy "Orders: owner update" on public.orders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Orders: admin all" on public.orders;
create policy "Orders: admin all" on public.orders for all using (is_admin()) with check (is_admin());

-- ── order_items ─────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_description text,
  unit_price numeric not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);
alter table public.order_items enable row level security;
drop policy if exists "OrderItems: owner select" on public.order_items;
create policy "OrderItems: owner select" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "OrderItems: owner insert" on public.order_items;
create policy "OrderItems: owner insert" on public.order_items for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "OrderItems: admin all" on public.order_items;
create policy "OrderItems: admin all" on public.order_items for all using (is_admin()) with check (is_admin());

-- ── reviews ─────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews for each row execute function public.handle_updated_at();
alter table public.reviews enable row level security;
drop policy if exists "Reviews: public read" on public.reviews;
create policy "Reviews: public read" on public.reviews for select using (true);
drop policy if exists "Reviews: owner insert" on public.reviews;
create policy "Reviews: owner insert" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "Reviews: owner update" on public.reviews;
create policy "Reviews: owner update" on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Reviews: owner delete" on public.reviews;
create policy "Reviews: owner delete" on public.reviews for delete using (auth.uid() = user_id);
drop policy if exists "Reviews: admin all" on public.reviews;
create policy "Reviews: admin all" on public.reviews for all using (is_admin()) with check (is_admin());

-- ── storage buckets ─────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('category-images','category-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;

-- Allow public read, admin write (storage policies)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Product images public read' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Product images public read" on storage.objects for select using (bucket_id in ('product-images','category-images','avatars'));
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Product images admin write' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Product images admin write" on storage.objects for all using (is_admin()) with check (is_admin());
  end if;
exception when duplicate_object then null;
end $$;
