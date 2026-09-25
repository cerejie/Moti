-- Phase 8 hardening, from the release security pass.
--   1. Table privileges: signed-out visitors get nothing; signed-in users lose TRUNCATE
--      (which ignores RLS) and direct writes on tables that are only written by RPCs.
--   2. Offline replays are bound to their record: a reused id for another item or
--      another shop is refused instead of silently skipped.
--   3. A device time may be at most 7 days old, so a sale can't be dated into an old period.

-- ============================================================================
-- 1. Privileges. RLS stays the boundary; these remove what no screen uses.
-- ============================================================================

-- "all tables" includes the views.
revoke all on all tables in schema public from anon;
revoke truncate, trigger, references on all tables in schema public from authenticated;

-- Written only by the security definer functions and the manage-staff Edge Function.
revoke insert, update, delete on
  public.categories,
  public.inventory_items,
  public.stock_movements,
  public.profiles
from authenticated;

revoke insert, update, delete on
  public.inventory_item_status,
  public.stock_movement_history,
  public.inventory_stock_summary,
  public.inventory_attention_items
from authenticated;

-- The one client function still callable by anon.
revoke all on function public.update_staff_profile(uuid, text, boolean) from anon;

-- Tables and functions created by later migrations start from the same baseline.
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke truncate, trigger, references on tables from authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;

-- ============================================================================
-- 2 + 3. The ledger: replays must match their item; device time is clamped to
-- the last 7 days. Otherwise unchanged from 20260924000002.
-- ============================================================================

create or replace function app.apply_stock_movement(
  p_item_id uuid,
  p_type app.movement_type,
  p_reason app.movement_reason,
  p_quantity integer,
  p_note text,
  p_occurred_at timestamptz,
  p_client_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.inventory_items%rowtype;
  v_signed integer;
  v_balance integer;
  v_id uuid;
  v_replayed_item_id uuid;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Enter a quantity greater than zero.';
  end if;

  -- Serializes every movement on this item, replays included.
  select * into v_item from public.inventory_items where id = p_item_id for update;
  if not found then
    raise exception 'This item no longer exists.';
  end if;

  select id, item_id into v_id, v_replayed_item_id
  from public.stock_movements where client_id = p_client_id;
  if found then
    -- A replay of this same write, or a key that belongs to another record.
    if v_replayed_item_id <> p_item_id then
      raise exception 'This change was already recorded for a different item.';
    end if;
    return v_id;
  end if;

  if v_item.archived_at is not null then
    raise exception 'This item is archived. Restore it before changing its stock.';
  end if;

  v_signed := case when p_type = 'stock_in' then p_quantity else -p_quantity end;
  v_balance := v_item.on_hand + v_signed;

  if v_balance < 0 then
    raise exception 'Not enough stock: only % % on hand.', v_item.on_hand, v_item.unit;
  end if;

  insert into public.stock_movements (
    shop_id, item_id, movement_type, reason, quantity, balance_after,
    note, occurred_at, created_by, client_id
  )
  values (
    v_item.shop_id, v_item.id, p_type, p_reason, v_signed, v_balance,
    nullif(btrim(p_note), ''),
    -- An offline write keeps the time it happened, but never a future one and
    -- never more than 7 days back, so no one can date a sale into an old period.
    least(greatest(coalesce(p_occurred_at, now()), now() - interval '7 days'), now()),
    auth.uid(), p_client_id
  )
  returning id into v_id;

  update public.inventory_items set on_hand = v_balance where id = v_item.id;

  return v_id;
end;
$$;

create or replace function public.create_category(p_id uuid, p_shop_id uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, true);
begin
  insert into public.categories (id, shop_id, name)
  values (p_id, v_shop_id, btrim(p_name))
  on conflict (id) do nothing;

  -- Already created by an earlier replay, unless the id is another shop's.
  if not found
    and not exists (select 1 from public.categories where id = p_id and shop_id = v_shop_id)
  then
    raise exception 'You don''t have permission to do that.' using errcode = '42501';
  end if;

  return p_id;
exception
  when unique_violation then
    raise exception 'A category named "%" already exists.', btrim(p_name);
end;
$$;

create or replace function public.create_item(
  p_id uuid,
  p_shop_id uuid,
  p_category_id uuid,
  p_sku text,
  p_name text,
  p_brand text,
  p_part_number text,
  p_fitment text,
  p_unit text,
  p_reorder_level integer,
  p_selling_price numeric,
  p_location text,
  p_opening_quantity integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, true);
begin
  if coalesce(p_opening_quantity, 0) < 0 then
    raise exception 'Opening stock cannot be negative.';
  end if;

  insert into public.inventory_items (
    id, shop_id, category_id, sku, name, brand, part_number, fitment, unit,
    reorder_level, selling_price, location, created_by
  )
  values (
    p_id, v_shop_id, p_category_id, btrim(p_sku), btrim(p_name),
    nullif(btrim(p_brand), ''), nullif(btrim(p_part_number), ''),
    nullif(btrim(p_fitment), ''), coalesce(nullif(btrim(p_unit), ''), 'pc'),
    coalesce(
      p_reorder_level,
      (select default_reorder_level from public.shop_settings where shop_id = v_shop_id)
    ),
    p_selling_price, nullif(btrim(p_location), ''), auth.uid()
  )
  on conflict (id) do nothing;

  -- Already created by an earlier replay of this write, unless the id is another shop's.
  if not found then
    if not exists (select 1 from public.inventory_items where id = p_id and shop_id = v_shop_id) then
      raise exception 'You don''t have permission to do that.' using errcode = '42501';
    end if;
    return p_id;
  end if;

  if coalesce(p_opening_quantity, 0) > 0 then
    perform app.apply_stock_movement(
      p_id, 'stock_in', 'opening_balance', p_opening_quantity, null, now(), p_id
    );
  end if;

  return p_id;
exception
  when unique_violation then
    raise exception 'An item with SKU "%" already exists in this shop.', btrim(p_sku);
end;
$$;
