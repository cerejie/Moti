-- ============================================================================
-- Moti V1.2 — item codes replace SKU; part number removed
--
--   * inventory_items.sku is renamed item_code. New items get a code from the
--     database: first 3 letters of category + first 3 of brand + a 6-digit
--     series per prefix (BRA-BRE-000001). The code never changes after that.
--   * inventory_items.part_number is dropped.
--   * create_item requires a category and a brand, and takes no SKU.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'inventory_items' and column_name = 'sku'
  ) then
    alter table public.inventory_items rename column sku to item_code;
  end if;
  if exists (
    select 1 from pg_constraint where conname = 'inventory_items_sku_check'
  ) then
    alter table public.inventory_items
      rename constraint inventory_items_sku_check to inventory_items_item_code_check;
  end if;
end;
$$;

alter index if exists public.inventory_items_sku_key rename to inventory_items_item_code_key;

-- Both signatures read the old columns; drop them before the columns change.
drop function if exists public.create_item(text, text, uuid, uuid, text, text, integer, numeric, text, integer, uuid);
drop function if exists public.create_item(text, text, uuid, text, text, text, integer, numeric, text, integer, uuid);

alter table public.inventory_items drop column if exists part_number;

-- The code is set once by create_item, so it is left out of the editable columns.
revoke update on public.inventory_items from authenticated;
grant update (name, category_id, brand_id, unit, reorder_level, selling_price, location, archived_at)
  on public.inventory_items to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Item code series
-- ----------------------------------------------------------------------------
create table if not exists app.item_code_series (
  prefix     text primary key,
  last_value integer not null check (last_value > 0)
);
revoke all on app.item_code_series from public, anon, authenticated;

-- First 3 letters or digits of a name, upper case: 'Brake pads' -> 'BRA'.
create or replace function app.code_part(p_name text) returns text
language sql immutable set search_path = '' as $$
  select left(upper(regexp_replace(coalesce(p_name, ''), '[^A-Za-z0-9]', '', 'g')), 3);
$$;
revoke execute on function app.code_part(text) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. create_item
-- ----------------------------------------------------------------------------
create or replace function public.create_item(
  p_name          text,
  p_category_id   uuid,
  p_brand_id      uuid,
  p_unit          text,
  p_reorder_level integer,
  p_selling_price numeric,
  p_location      text,
  p_opening_stock integer,
  p_client_id     uuid
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id       uuid;
  v_category text;
  v_brand    text;
  v_prefix   text;
  v_series   integer;
begin
  if not app.is_owner() then
    raise exception 'Only the owner can add items' using errcode = '42501';
  end if;
  if coalesce(p_opening_stock, 0) < 0 then
    raise exception 'Opening stock cannot be negative';
  end if;

  select i.id into v_id from public.inventory_items i where i.client_id = p_client_id;
  if found then
    return v_id;
  end if;

  select app.code_part(c.name) into v_category from public.categories c where c.id = p_category_id;
  if coalesce(v_category, '') = '' then
    raise exception 'Pick a category for this item';
  end if;
  select app.code_part(b.name) into v_brand from public.brands b where b.id = p_brand_id;
  if coalesce(v_brand, '') = '' then
    raise exception 'Pick a brand for this item';
  end if;

  -- One row per prefix; the upsert locks it, so two saves never share a number.
  v_prefix := v_category || '-' || v_brand;
  insert into app.item_code_series as s (prefix, last_value)
  values (v_prefix, 1)
  on conflict (prefix) do update set last_value = s.last_value + 1
  returning s.last_value into v_series;

  insert into public.inventory_items
    (item_code, name, category_id, brand_id, unit, on_hand, reorder_level,
     selling_price, location, client_id)
  values
    -- lpad would cut a 7-digit number, so it only pads.
    (v_prefix || '-' || case when v_series < 1000000 then lpad(v_series::text, 6, '0') else v_series::text end,
     trim(p_name), p_category_id, p_brand_id,
     coalesce(nullif(trim(p_unit), ''), 'pc'),
     coalesce(p_opening_stock, 0), coalesce(p_reorder_level, 0), p_selling_price,
     nullif(trim(p_location), ''), p_client_id)
  returning id into v_id;

  if coalesce(p_opening_stock, 0) > 0 then
    insert into public.stock_movements
      (item_id, type, reason, quantity, balance_after, created_by, created_by_name)
    values
      (v_id, 'stock_in', 'opening_balance', p_opening_stock, p_opening_stock,
       app.user_id(), app.actor_name());
  end if;

  return v_id;
end;
$$;

revoke execute on function public.create_item(text, uuid, uuid, text, integer, numeric, text, integer, uuid) from public, anon;
grant execute on function public.create_item(text, uuid, uuid, text, integer, numeric, text, integer, uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Low-stock push reads the renamed column
-- ----------------------------------------------------------------------------
create or replace function app.push_stock_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.archived_at is not null
     or new.stock_status = 'in_stock'
     or old.stock_status is not distinct from new.stock_status then
    return null;
  end if;

  perform app.send_push(
    app.push_owners(),
    case new.stock_status when 'out' then 'Out of stock' else 'Low stock' end,
    concat_ws(' · ',
      new.name,
      new.item_code,
      new.on_hand || ' ' || new.unit || ' left',
      'warning at ' || new.reorder_level),
    '/inventory',
    'stock-' || new.id
  );
  return null;
end;
$$;
