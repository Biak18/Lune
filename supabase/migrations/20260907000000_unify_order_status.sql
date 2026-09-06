-- Unify out_for_delivery -> shipped (5-step flow)
-- Backfill legacy rows then tighten CHECK constraints

-- 1) Backfill orders
update public.orders set status = 'shipped' where status = 'out_for_delivery';

-- 2) Backfill notifications (type)
update public.notifications set type = 'order_shipped' where type = 'out_for_delivery';

-- 3) Re-create orders status CHECK without out_for_delivery
do $$
begin
  -- Drop old check if exists (name varies by PG auto-naming, find by contype)
  -- Use idempotent: drop constraint if contains out_for_delivery
  declare c record;
  begin
    for c in select conname from pg_constraint where conrelid = 'public.orders'::regclass and contype = 'c' loop
      if pg_get_constraintdef(c.oid) ilike '%out_for_delivery%' then
        execute format('alter table public.orders drop constraint %I', c.conname);
      end if;
    end loop;
  exception when others then null;
  end;
  -- Add new 5-step check
  begin
    alter table public.orders add constraint orders_status_check check (status in ('pending','confirmed','processing','shipped','delivered','cancelled'));
  exception when duplicate_object then null;
  end;
end $$;

-- 4) Tighten notifications type CHECK (remove out_for_delivery)
do $$
begin
  declare c record;
  begin
    for c in select conname from pg_constraint where conrelid = 'public.notifications'::regclass and contype = 'c' loop
      if pg_get_constraintdef(c.oid) ilike '%out_for_delivery%' then
        execute format('alter table public.notifications drop constraint %I', c.conname);
      end if;
    end loop;
  exception when others then null;
  end;
  begin
    alter table public.notifications add constraint notifications_type_check check (type in ('order_confirmed','order_shipped','delivered','back_in_stock','price_drop','general'));
  exception when duplicate_object then null;
  end;
end $$;
