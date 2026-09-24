-- Phase 2: the inventory catalog. Categories, items and the append-only stock
-- ledger, a status view, and the functions every catalog write goes through.
-- Clients have read policies only: all writes are the security definer
-- functions at the bottom, which set shop_id on the server and apply role rules.

create extension if not exists pg_trgm with schema extensions;

create type app.movement_type as enum ('stock_in', 'stock_out');

create type app.movement_reason as enum (
  'restock', 'opening_balance', 'correction', 'sale', 'damaged'
);

-- ============================================================================
-- Tables
-- ============================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Target of the items' composite foreign key.
  constraint categories_id_shop_key unique (id, shop_id)
);

create unique index categories_shop_name_key on public.categories (shop_id, lower(name));

create trigger categories_touch_updated_at
  before update on public.categories
  for each row execute function app.touch_updated_at();

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete restrict,
  category_id uuid,
  sku text not null check (length(btrim(sku)) between 1 and 60),
  name text not null check (length(btrim(name)) between 1 and 160),
  brand text check (length(brand) <= 80),
  part_number text check (length(part_number) <= 80),
  fitment text check (length(fitment) <= 240),
  unit text not null default 'pc' check (length(btrim(unit)) between 1 and 20),
  -- Changed only by app.apply_stock_movement, always together with a ledger row.
  on_hand integer not null default 0 check (on_hand >= 0),
  reorder_level integer not null check (reorder_level >= 0),
  -- Display-only: quoted at the counter, never used in any total.
  selling_price numeric(12, 2) check (selling_price >= 0),
  location text check (length(location) <= 80),
  archived_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(
      sku || ' ' || name || ' ' || coalesce(brand, '') || ' '
      || coalesce(part_number, '') || ' ' || coalesce(fitment, '')
    )
  ) stored,
  constraint inventory_items_id_shop_key unique (id, shop_id),
  -- Composite: an item can only point at a category of its own shop.
  constraint inventory_items_category_fkey foreign key (category_id, shop_id)
    references public.categories (id, shop_id) on delete restrict
);

create unique index inventory_items_shop_sku_key on public.inventory_items (shop_id, lower(sku));
create index inventory_items_shop_name_idx on public.inventory_items (shop_id, name);
create index inventory_items_shop_category_idx on public.inventory_items (shop_id, category_id);
create index inventory_items_created_by_idx on public.inventory_items (created_by);
create index inventory_items_search_idx on public.inventory_items
  using gin (search_text extensions.gin_trgm_ops);

create trigger inventory_items_touch_updated_at
  before update on public.inventory_items
  for each row execute function app.touch_updated_at();

-- Append-only: no update or delete policy exists and no function edits a row.
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete restrict,
  item_id uuid not null,
  movement_type app.movement_type not null,
  reason app.movement_reason not null,
  -- Signed: positive for stock_in, negative for stock_out.
  quantity integer not null,
  balance_after integer not null check (balance_after >= 0),
  note text check (length(note) <= 240),
  occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  -- The client's idempotency key: a replayed offline write is ignored.
  client_id uuid not null unique,
  created_at timestamptz not null default now(),
  constraint stock_movements_item_fkey foreign key (item_id, shop_id)
    references public.inventory_items (id, shop_id) on delete restrict,
  constraint stock_movements_quantity_sign check (
    (movement_type = 'stock_in' and quantity > 0)
    or (movement_type = 'stock_out' and quantity < 0)
  ),
  constraint stock_movements_reason_matches_type check (
    (movement_type = 'stock_in' and reason in ('restock', 'opening_balance', 'correction'))
    or (movement_type = 'stock_out' and reason in ('sale', 'damaged', 'correction'))
  )
);

create index stock_movements_item_occurred_idx on public.stock_movements (item_id, occurred_at desc);
create index stock_movements_shop_occurred_idx on public.stock_movements (shop_id, occurred_at desc);
create index stock_movements_created_by_idx on public.stock_movements (created_by);

-- ============================================================================
-- Status view. security_invoker, so the caller's RLS on every joined table applies.
-- Low: above the reorder level but within the shop's margin of it,
-- e.g. reorder level 5 and a 20% margin is Low at 6.
-- ============================================================================

create view public.inventory_item_status
with (security_invoker = true)
as
select
  i.id,
  i.shop_id,
  i.category_id,
  c.name as category_name,
  i.sku,
  i.name,
  i.brand,
  i.part_number,
  i.fitment,
  i.unit,
  i.on_hand,
  i.reorder_level,
  i.selling_price,
  i.location,
  i.archived_at,
  i.created_at,
  i.updated_at,
  i.search_text,
  case
    when i.on_hand = 0 then 'out_of_stock'
    when i.on_hand <= i.reorder_level then 'reorder'
    when i.on_hand <= i.reorder_level + ceil(i.reorder_level * s.low_stock_margin_pct / 100)
      then 'low'
    else 'in_stock'
  end as stock_status
from public.inventory_items i
join public.shop_settings s on s.shop_id = i.shop_id
left join public.categories c on c.id = i.category_id;

revoke all on public.inventory_item_status from anon;
grant select on public.inventory_item_status to authenticated;

-- ============================================================================
-- RLS: every member of a shop reads its catalog; only managers read the ledger.
-- ============================================================================

alter table public.categories enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_movements enable row level security;

create policy categories_select on public.categories
  for select to authenticated
  using ((select app.is_superadmin()) or shop_id = (select app.current_shop_id()));

create policy inventory_items_select on public.inventory_items
  for select to authenticated
  using ((select app.is_superadmin()) or shop_id = (select app.current_shop_id()));

create policy stock_movements_select on public.stock_movements
  for select to authenticated
  using (
    (select app.is_superadmin())
    or (shop_id = (select app.current_shop_id()) and (select app.current_user_role()) = 'owner')
  );

-- ============================================================================
-- Internal helpers (not granted to clients).
-- ============================================================================

-- The shop a write lands in. Owners and employees always write to their own
-- shop; the superadmin must name one. p_manage limits the write to managers.
create or replace function app.write_shop_id(p_shop_id uuid, p_manage boolean)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_role app.user_role := app.current_user_role();
  v_shop_id uuid;
begin
  if v_role = 'superadmin' then
    if p_shop_id is null or not exists (select 1 from public.shops where id = p_shop_id) then
      raise exception 'Choose a shop first.';
    end if;
    return p_shop_id;
  end if;

  v_shop_id := app.current_shop_id();

  if v_role is null
    or v_shop_id is null
    or (p_shop_id is not null and p_shop_id <> v_shop_id)
    or (p_manage and v_role <> 'owner')
  then
    raise exception 'You don''t have permission to do that.' using errcode = '42501';
  end if;

  return v_shop_id;
end;
$$;

-- The one place on_hand changes. Callers have already authorized the write.
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
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Enter a quantity greater than zero.';
  end if;

  -- Serializes every movement on this item, replays included.
  select * into v_item from public.inventory_items where id = p_item_id for update;
  if not found then
    raise exception 'This item no longer exists.';
  end if;

  select id into v_id from public.stock_movements where client_id = p_client_id;
  if found then
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
    -- An offline write keeps the time it happened, but never a future one.
    least(coalesce(p_occurred_at, now()), now()),
    auth.uid(), p_client_id
  )
  returning id into v_id;

  update public.inventory_items set on_hand = v_balance where id = v_item.id;

  return v_id;
end;
$$;

revoke all on function
  app.write_shop_id(uuid, boolean),
  app.apply_stock_movement(uuid, app.movement_type, app.movement_reason, integer, text, timestamptz, uuid)
from public;

-- ============================================================================
-- Client functions. Each takes a client-generated id, so a replayed offline
-- write changes nothing the second time.
-- ============================================================================

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

  return p_id;
exception
  when unique_violation then
    raise exception 'A category named "%" already exists.', btrim(p_name);
end;
$$;

create or replace function public.update_category(p_id uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.categories where id = p_id;
  if not found then
    raise exception 'This category no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, true);

  update public.categories set name = btrim(p_name) where id = p_id;

  return p_id;
exception
  when unique_violation then
    raise exception 'A category named "%" already exists.', btrim(p_name);
end;
$$;

-- A category still used by items is refused by the foreign key (23503).
create or replace function public.delete_category(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.categories where id = p_id;
  if not found then
    return;
  end if;

  perform app.write_shop_id(v_shop_id, true);

  delete from public.categories where id = p_id;
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

  -- Already created by an earlier replay of this write.
  if not found then
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

-- Never touches on_hand: stock only changes through a movement.
create or replace function public.update_item(
  p_id uuid,
  p_category_id uuid,
  p_sku text,
  p_name text,
  p_brand text,
  p_part_number text,
  p_fitment text,
  p_unit text,
  p_reorder_level integer,
  p_selling_price numeric,
  p_location text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
  v_reorder_level integer;
begin
  select shop_id, reorder_level into v_shop_id, v_reorder_level
  from public.inventory_items where id = p_id;
  if not found then
    raise exception 'This item no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, true);

  update public.inventory_items set
    category_id = p_category_id,
    sku = btrim(p_sku),
    name = btrim(p_name),
    brand = nullif(btrim(p_brand), ''),
    part_number = nullif(btrim(p_part_number), ''),
    fitment = nullif(btrim(p_fitment), ''),
    unit = coalesce(nullif(btrim(p_unit), ''), 'pc'),
    reorder_level = coalesce(p_reorder_level, v_reorder_level),
    selling_price = p_selling_price,
    location = nullif(btrim(p_location), '')
  where id = p_id;

  return p_id;
exception
  when unique_violation then
    raise exception 'An item with SKU "%" already exists in this shop.', btrim(p_sku);
end;
$$;

create or replace function public.set_item_archived(p_id uuid, p_archived boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.inventory_items where id = p_id;
  if not found then
    raise exception 'This item no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, true);

  update public.inventory_items
  set archived_at = case when p_archived then coalesce(archived_at, now()) end
  where id = p_id;

  return p_id;
end;
$$;

-- Employees may only record a sale; every other movement needs a manager.
create or replace function public.record_stock_movement(
  p_client_id uuid,
  p_item_id uuid,
  p_type app.movement_type,
  p_reason app.movement_reason,
  p_quantity integer,
  p_note text default null,
  p_occurred_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.inventory_items where id = p_item_id;
  if not found then
    raise exception 'This item no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, not (p_type = 'stock_out' and p_reason = 'sale'));

  return app.apply_stock_movement(
    p_item_id, p_type, p_reason, p_quantity, p_note, p_occurred_at, p_client_id
  );
end;
$$;

revoke all on function
  public.create_category(uuid, uuid, text),
  public.update_category(uuid, text),
  public.delete_category(uuid),
  public.create_item(uuid, uuid, uuid, text, text, text, text, text, text, integer, numeric, text, integer),
  public.update_item(uuid, uuid, text, text, text, text, text, text, integer, numeric, text),
  public.set_item_archived(uuid, boolean),
  public.record_stock_movement(uuid, uuid, app.movement_type, app.movement_reason, integer, text, timestamptz)
from public, anon;

grant execute on function
  public.create_category(uuid, uuid, text),
  public.update_category(uuid, text),
  public.delete_category(uuid),
  public.create_item(uuid, uuid, uuid, text, text, text, text, text, text, integer, numeric, text, integer),
  public.update_item(uuid, uuid, text, text, text, text, text, text, integer, numeric, text),
  public.set_item_archived(uuid, boolean),
  public.record_stock_movement(uuid, uuid, app.movement_type, app.movement_reason, integer, text, timestamptz)
to authenticated;
