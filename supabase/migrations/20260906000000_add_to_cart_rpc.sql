-- Add-to-cart as a single atomic RPC.
-- Previously the client made 4 sequential round trips per add:
--   auth.getUser() -> variant stock check -> existing cart row -> insert/update.
-- This function validates the variant and upserts the cart row in ONE call,
-- identified server-side via auth.uid() (no client-side getUser hop).
--
-- SECURITY INVOKER keeps cart_items RLS fully enforced; the function only
-- ever touches rows owned by the caller.

create or replace function public.add_to_cart(p_variant_id uuid, p_quantity integer default 1)
returns public.cart_items
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_variant public.product_variants;
  v_existing_qty integer;
  v_new_qty integer;
  v_result public.cart_items;
begin
  if v_user_id is null then
    raise exception 'Please sign in to add to bag';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be at least 1';
  end if;

  select * into v_variant
  from public.product_variants
  where id = p_variant_id;

  if not found then
    raise exception 'This variant is unavailable';
  end if;

  if v_variant.is_active is false then
    raise exception 'This variant is unavailable';
  end if;

  if coalesce(v_variant.stock_quantity, 0) <= 0 then
    raise exception 'Out of stock';
  end if;

  select quantity into v_existing_qty
  from public.cart_items
  where user_id = v_user_id
    and variant_id = p_variant_id;

  v_new_qty := coalesce(v_existing_qty, 0) + p_quantity;

  if v_new_qty > coalesce(v_variant.stock_quantity, 0) then
    raise exception 'Only % in stock', v_variant.stock_quantity;
  end if;

  insert into public.cart_items (user_id, variant_id, quantity)
  values (v_user_id, p_variant_id, v_new_qty)
  on conflict (user_id, variant_id)
  do update set quantity = excluded.quantity, updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.add_to_cart(uuid, integer) from public, anon;
grant execute on function public.add_to_cart(uuid, integer) to authenticated, service_role;
