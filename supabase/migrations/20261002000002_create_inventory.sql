-- ============================================================================
-- Moti V1 — inventory catalog and the append-only stock ledger
--
--   * categories       — grouping for items; owner-managed.
--   * inventory_items  — on_hand only ever changes through record_movement /
--                        create_item, so it always equals the ledger total.
--                        stock_status is derived: out (0), low (<= reorder
--                        level) or in_stock.
--   * stock_movements  — signed quantity per movement; never updated or
--                        deleted. client_id makes an offline replay a no-op.
--   Employees browse items and record sales only. Owners (and the developer)
--   manage items, categories, add stock and read the ledger.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists categories_name_key on public.categories (lower(name));

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function app.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Items
-- ----------------------------------------------------------------------------
create table if not exists public.inventory_items (
  id            uuid primary key default gen_random_uuid(),
  sku           text not null check (length(trim(sku)) > 0),
  name          text not null check (length(trim(name)) > 0),
  category_id   uuid references public.categories (id) on delete set null,
  brand         text,
  part_number   text,
  unit          text not null default 'pc' check (length(trim(unit)) > 0),
  on_hand       integer not null default 0 check (on_hand >= 0),
  reorder_level integer not null default 0 check (reorder_level >= 0),
  selling_price numeric(12, 2) check (selling_price is null or selling_price >= 0),
  location      text,
  stock_status  text generated always as (
    case
      when on_hand = 0 then 'out'
      when on_hand <= reorder_level then 'low'
      else 'in_stock'
    end
  ) stored,
  archived_at   timestamptz,
  client_id     uuid unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists inventory_items_sku_key on public.inventory_items (lower(sku));
create index if not exists inventory_items_category_idx on public.inventory_items (category_id);
create index if not exists inventory_items_status_idx
  on public.inventory_items (stock_status) where archived_at is null;
create index if not exists inventory_items_name_idx on public.inventory_items (lower(name));

drop trigger if exists inventory_items_touch on public.inventory_items;
create trigger inventory_items_touch before update on public.inventory_items
  for each row execute function app.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Ledger
-- ----------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null references public.inventory_items (id) on delete restrict,
  type            text not null check (type in ('stock_in', 'stock_out')),
  reason          text not null,
  quantity        integer not null,
  balance_after   integer not null check (balance_after >= 0),
  note            text,
  client_id       uuid unique,
  created_by      uuid,
  created_by_name text not null,
  created_at      timestamptz not null default now(),
  constraint stock_movements_reason_check check (
    (type = 'stock_in'  and reason in ('restock', 'opening_balance', 'correction') and quantity > 0)
    or
    (type = 'stock_out' and reason in ('sale', 'damaged', 'correction') and quantity < 0)
  )
);
create index if not exists stock_movements_item_idx on public.stock_movements (item_id, created_at desc);
create index if not exists stock_movements_created_idx on public.stock_movements (created_at desc);

-- ----------------------------------------------------------------------------
-- 4. RLS and column grants
-- ----------------------------------------------------------------------------
alter table public.categories      enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_movements enable row level security;

revoke all on public.categories      from anon, authenticated;
revoke all on public.inventory_items from anon, authenticated;
revoke all on public.stock_movements from anon, authenticated;

grant select, insert, delete on public.categories to authenticated;
grant update (name) on public.categories to authenticated;

-- Items are created by create_item; on_hand is never client-writable.
grant select on public.inventory_items to authenticated;
grant update (sku, name, category_id, brand, part_number, unit, reorder_level,
              selling_price, location, archived_at)
  on public.inventory_items to authenticated;

grant select on public.stock_movements to authenticated;

drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select to authenticated using (app.is_staff());

drop policy if exists categories_insert on public.categories;
create policy categories_insert on public.categories
  for insert to authenticated with check (app.is_owner());

drop policy if exists categories_update on public.categories;
create policy categories_update on public.categories
  for update to authenticated using (app.is_owner()) with check (app.is_owner());

drop policy if exists categories_delete on public.categories;
create policy categories_delete on public.categories
  for delete to authenticated using (app.is_owner());

drop policy if exists inventory_items_select on public.inventory_items;
create policy inventory_items_select on public.inventory_items
  for select to authenticated using (app.is_staff());

drop policy if exists inventory_items_update on public.inventory_items;
create policy inventory_items_update on public.inventory_items
  for update to authenticated using (app.is_owner()) with check (app.is_owner());

drop policy if exists stock_movements_select on public.stock_movements;
create policy stock_movements_select on public.stock_movements
  for select to authenticated using (app.is_owner());

-- ----------------------------------------------------------------------------
-- 5. RPCs
-- ----------------------------------------------------------------------------
create or replace function public.create_item(
  p_sku           text,
  p_name          text,
  p_category_id   uuid,
  p_brand         text,
  p_part_number   text,
  p_unit          text,
  p_reorder_level integer,
  p_selling_price numeric,
  p_location      text,
  p_opening_stock integer,
  p_client_id     uuid
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
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

  insert into public.inventory_items
    (sku, name, category_id, brand, part_number, unit, on_hand, reorder_level,
     selling_price, location, client_id)
  values
    (trim(p_sku), trim(p_name), p_category_id, nullif(trim(p_brand), ''),
     nullif(trim(p_part_number), ''), coalesce(nullif(trim(p_unit), ''), 'pc'),
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

-- p_quantity is always positive; the type decides the sign.
create or replace function public.record_movement(
  p_item_id   uuid,
  p_type      text,
  p_reason    text,
  p_quantity  integer,
  p_note      text,
  p_client_id uuid
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_item    public.inventory_items;
  v_signed  integer;
  v_balance integer;
begin
  if not app.is_staff() then
    raise exception 'Sign in to record stock' using errcode = '42501';
  end if;
  if not app.is_owner() and not (p_type = 'stock_out' and p_reason = 'sale') then
    raise exception 'Employees can only record sales' using errcode = '42501';
  end if;
  if coalesce(p_quantity, 0) <= 0 then
    raise exception 'Quantity must be at least 1';
  end if;

  select m.balance_after into v_balance
  from public.stock_movements m where m.client_id = p_client_id;
  if found then
    return v_balance;
  end if;

  select * into v_item from public.inventory_items i where i.id = p_item_id for update;
  if not found then
    raise exception 'Item not found';
  end if;
  if v_item.archived_at is not null then
    raise exception '% is archived', v_item.name;
  end if;

  v_signed  := case when p_type = 'stock_in' then p_quantity else -p_quantity end;
  v_balance := v_item.on_hand + v_signed;
  if v_balance < 0 then
    raise exception 'Only % % of % left', v_item.on_hand, v_item.unit, v_item.name;
  end if;

  update public.inventory_items i set on_hand = v_balance where i.id = p_item_id;

  insert into public.stock_movements
    (item_id, type, reason, quantity, balance_after, note, client_id, created_by, created_by_name)
  values
    (p_item_id, p_type, p_reason, v_signed, v_balance, nullif(trim(p_note), ''),
     p_client_id, app.user_id(), app.actor_name());

  return v_balance;
end;
$$;

-- Dashboard numbers in one round trip; counts match the inventory status filters.
create or replace function public.inventory_summary()
returns table (
  item_count     bigint,
  units_on_hand  bigint,
  low_count      bigint,
  out_count      bigint
)
language sql stable set search_path = '' as $$
  select
    count(*),
    coalesce(sum(i.on_hand), 0),
    count(*) filter (where i.stock_status = 'low'),
    count(*) filter (where i.stock_status = 'out')
  from public.inventory_items i
  where i.archived_at is null;
$$;

revoke execute on function public.create_item(text, text, uuid, text, text, text, integer, numeric, text, integer, uuid) from public, anon;
revoke execute on function public.record_movement(uuid, text, text, integer, text, uuid) from public, anon;
revoke execute on function public.inventory_summary() from public, anon;
grant execute on function public.create_item(text, text, uuid, text, text, text, integer, numeric, text, integer, uuid) to authenticated;
grant execute on function public.record_movement(uuid, text, text, integer, text, uuid) to authenticated;
grant execute on function public.inventory_summary() to authenticated;
