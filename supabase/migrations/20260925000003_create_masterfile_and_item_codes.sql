-- Phase 9: the masterfile and server-made item codes.
--   1. sku becomes item_code. A new item gets CAT-BRD-001 from the server: its
--      category's code, its brand's code and the category's own counter. Changing
--      an item's category or brand gives it a new code. Existing codes are kept.
--   2. Brands, units and storage locations become per-shop lists that items point
--      at; the old free text is converted into entries.
--   3. Categories carry a code and the brands they sell. New items need both, and
--      the brand must be one the category carries.

-- ============================================================================
-- 1. Drop what is rebuilt below. The views and two analyzer functions expose the
--    old columns; the item and category functions change signature.
-- ============================================================================

drop function public.analyzer_volume_ranking(uuid, date, date, text, uuid, text);
drop function public.analyzer_reorder_items(uuid);
drop view public.inventory_attention_items;
drop view public.inventory_stock_summary;
drop view public.stock_movement_history;
drop view public.inventory_item_status;

drop function public.create_category(uuid, uuid, text);
drop function public.update_category(uuid, text);
drop function public.create_item(uuid, uuid, uuid, text, text, text, text, text, text, integer, numeric, text, integer);
drop function public.update_item(uuid, uuid, text, text, text, text, text, text, integer, numeric, text);

-- The backfill below must not look like an edit to every row.
alter table public.categories disable trigger categories_touch_updated_at;
alter table public.inventory_items disable trigger inventory_items_touch_updated_at;

-- ============================================================================
-- 2. Masterfile tables
-- ============================================================================

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 80),
  code text not null check (code ~ '^[A-Z0-9]{2,6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_id_shop_key unique (id, shop_id)
);

create unique index brands_shop_name_key on public.brands (shop_id, lower(name));
create unique index brands_shop_code_key on public.brands (shop_id, code);

create trigger brands_touch_updated_at
  before update on public.brands
  for each row execute function app.touch_updated_at();

-- Which brands a category sells. Items point at a pair, so an item's brand is
-- always one its category carries.
create table public.category_brands (
  category_id uuid not null,
  brand_id uuid not null,
  shop_id uuid not null references public.shops (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (category_id, brand_id),
  constraint category_brands_category_fkey foreign key (category_id, shop_id)
    references public.categories (id, shop_id) on delete cascade,
  constraint category_brands_brand_fkey foreign key (brand_id, shop_id)
    references public.brands (id, shop_id) on delete cascade
);

create index category_brands_brand_idx on public.category_brands (brand_id);
create index category_brands_shop_idx on public.category_brands (shop_id);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint units_id_shop_key unique (id, shop_id)
);

create unique index units_shop_name_key on public.units (shop_id, lower(name));

create trigger units_touch_updated_at
  before update on public.units
  for each row execute function app.touch_updated_at();

create table public.storage_locations (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storage_locations_id_shop_key unique (id, shop_id)
);

create unique index storage_locations_shop_name_key on public.storage_locations (shop_id, lower(name));

create trigger storage_locations_touch_updated_at
  before update on public.storage_locations
  for each row execute function app.touch_updated_at();

-- Every shop starts with a "pc" unit, the old default.
create or replace function app.create_shop_units() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.units (shop_id, name) values (new.id, 'pc') on conflict do nothing;
  return new;
end;
$$;

create trigger shops_create_units
  after insert on public.shops
  for each row execute function app.create_shop_units();

-- ============================================================================
-- 3. Codes
-- ============================================================================

-- A free category or brand code made from a name: its first three letters or
-- digits in capitals, plus a number when another row of the shop has it,
-- e.g. Brakes → BRA, then BRA2.
create or replace function app.free_code(p_shop_id uuid, p_name text, p_kind text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_base text := left(upper(regexp_replace(coalesce(p_name, ''), '[^A-Za-z0-9]', '', 'g')), 3);
  v_code text;
  v_suffix integer := 1;
begin
  if length(v_base) < 2 then
    v_base := rpad(v_base, 2, 'X');
  end if;
  v_code := v_base;

  while (
    case p_kind
      when 'category' then exists (
        select 1 from public.categories where shop_id = p_shop_id and code = v_code
      )
      else exists (select 1 from public.brands where shop_id = p_shop_id and code = v_code)
    end
  ) loop
    v_suffix := v_suffix + 1;
    v_code := v_base || v_suffix;
  end loop;

  return v_code;
end;
$$;

alter table public.categories
  add column code text,
  add column next_number integer not null default 1 check (next_number >= 1);

do $$
declare
  v_row record;
begin
  for v_row in select id, shop_id, name from public.categories order by shop_id, created_at, id loop
    update public.categories
    set code = app.free_code(v_row.shop_id, v_row.name, 'category')
    where id = v_row.id;
  end loop;
end;
$$;

alter table public.categories
  alter column code set not null,
  add constraint categories_code_format check (code ~ '^[A-Z0-9]{2,6}$');

create unique index categories_shop_code_key on public.categories (shop_id, code);

-- ============================================================================
-- 4. Convert the items' free text into masterfile entries
-- ============================================================================

insert into public.units (shop_id, name)
select id, 'pc' from public.shops
on conflict do nothing;

insert into public.units (shop_id, name)
select distinct on (shop_id, lower(btrim(unit))) shop_id, btrim(unit)
from public.inventory_items
order by shop_id, lower(btrim(unit)), btrim(unit)
on conflict do nothing;

insert into public.storage_locations (shop_id, name)
select distinct on (shop_id, lower(btrim(location))) shop_id, btrim(location)
from public.inventory_items
where nullif(btrim(location), '') is not null
order by shop_id, lower(btrim(location)), btrim(location);

do $$
declare
  v_row record;
begin
  for v_row in
    select distinct on (shop_id, lower(btrim(brand))) shop_id, btrim(brand) as name
    from public.inventory_items
    where nullif(btrim(brand), '') is not null
    order by shop_id, lower(btrim(brand)), btrim(brand)
  loop
    insert into public.brands (shop_id, name, code)
    values (v_row.shop_id, v_row.name, app.free_code(v_row.shop_id, v_row.name, 'brand'));
  end loop;
end;
$$;

alter table public.inventory_items
  add column brand_id uuid,
  add column unit_id uuid,
  add column location_id uuid;

update public.inventory_items i set
  brand_id = (
    select b.id from public.brands b
    where b.shop_id = i.shop_id and lower(b.name) = lower(btrim(i.brand))
  ),
  unit_id = (
    select u.id from public.units u
    where u.shop_id = i.shop_id and lower(u.name) = lower(btrim(i.unit))
  ),
  location_id = (
    select l.id from public.storage_locations l
    where l.shop_id = i.shop_id and lower(l.name) = lower(btrim(i.location))
  );

-- Each category carries the brands its items already use.
insert into public.category_brands (category_id, brand_id, shop_id)
select distinct category_id, brand_id, shop_id
from public.inventory_items
where category_id is not null and brand_id is not null;

-- search_text read the brand text, so it goes first and is rebuilt without it.
alter table public.inventory_items
  drop column search_text,
  drop column brand,
  drop column unit,
  drop column location;

alter table public.inventory_items rename column sku to item_code;
alter table public.inventory_items rename constraint inventory_items_sku_check to inventory_items_item_code_check;
alter index public.inventory_items_shop_sku_key rename to inventory_items_shop_item_code_key;

alter table public.inventory_items
  alter column unit_id set not null,
  add column search_text text generated always as (
    lower(
      item_code || ' ' || name || ' '
      || coalesce(part_number, '') || ' ' || coalesce(fitment, '')
    )
  ) stored,
  add constraint inventory_items_brand_fkey foreign key (brand_id, shop_id)
    references public.brands (id, shop_id) on delete restrict,
  -- Unchecked while either is empty, so older items without a brand still load.
  add constraint inventory_items_category_brand_fkey foreign key (category_id, brand_id)
    references public.category_brands (category_id, brand_id) on delete restrict,
  add constraint inventory_items_unit_fkey foreign key (unit_id, shop_id)
    references public.units (id, shop_id) on delete restrict,
  add constraint inventory_items_location_fkey foreign key (location_id, shop_id)
    references public.storage_locations (id, shop_id) on delete restrict;

create index inventory_items_search_idx on public.inventory_items
  using gin (search_text extensions.gin_trgm_ops);
create index inventory_items_shop_brand_idx on public.inventory_items (shop_id, brand_id);
create index inventory_items_category_brand_idx on public.inventory_items (category_id, brand_id);
create index inventory_items_unit_idx on public.inventory_items (unit_id);
create index inventory_items_location_idx on public.inventory_items (location_id);

alter table public.categories enable trigger categories_touch_updated_at;
alter table public.inventory_items enable trigger inventory_items_touch_updated_at;

-- ============================================================================
-- 5. RLS: every member of a shop reads its masterfile; writes are the functions below.
-- ============================================================================

alter table public.brands enable row level security;
alter table public.category_brands enable row level security;
alter table public.units enable row level security;
alter table public.storage_locations enable row level security;

create policy brands_select on public.brands
  for select to authenticated
  using ((select app.is_superadmin()) or shop_id = (select app.current_shop_id()));

create policy category_brands_select on public.category_brands
  for select to authenticated
  using ((select app.is_superadmin()) or shop_id = (select app.current_shop_id()));

create policy units_select on public.units
  for select to authenticated
  using ((select app.is_superadmin()) or shop_id = (select app.current_shop_id()));

create policy storage_locations_select on public.storage_locations
  for select to authenticated
  using ((select app.is_superadmin()) or shop_id = (select app.current_shop_id()));

revoke all on
  public.brands, public.category_brands, public.units, public.storage_locations
from anon;

revoke insert, update, delete on
  public.brands, public.category_brands, public.units, public.storage_locations
from authenticated;

-- ============================================================================
-- 6. Views, rebuilt with item_code and the masterfile names. Unit, brand and
--    location keep their old column names, so readers see the same shape.
-- ============================================================================

create view public.inventory_item_status
with (security_invoker = true)
as
select
  i.id,
  i.shop_id,
  i.category_id,
  c.name as category_name,
  i.item_code,
  i.name,
  i.brand_id,
  b.name as brand,
  i.part_number,
  i.fitment,
  i.unit_id,
  u.name as unit,
  i.on_hand,
  i.reorder_level,
  i.selling_price,
  i.location_id,
  l.name as location,
  i.archived_at,
  i.created_at,
  i.updated_at,
  -- The brand lives on its own row, so its name joins the search text here.
  i.search_text || ' ' || coalesce(lower(b.name), '') as search_text,
  case
    when i.on_hand = 0 then 'out_of_stock'
    when i.on_hand <= i.reorder_level then 'reorder'
    when i.on_hand <= i.reorder_level + ceil(i.reorder_level * s.low_stock_margin_pct / 100)
      then 'low'
    else 'in_stock'
  end as stock_status
from public.inventory_items i
join public.shop_settings s on s.shop_id = i.shop_id
left join public.categories c on c.id = i.category_id
left join public.brands b on b.id = i.brand_id
left join public.units u on u.id = i.unit_id
left join public.storage_locations l on l.id = i.location_id;

create view public.stock_movement_history
with (security_invoker = true)
as
select
  m.id,
  m.shop_id,
  m.item_id,
  i.name as item_name,
  i.item_code,
  u.name as item_unit,
  i.search_text || ' ' || coalesce(lower(b.name), '') as item_search_text,
  m.movement_type,
  m.reason,
  m.quantity,
  m.balance_after,
  m.note,
  m.occurred_at,
  m.created_by,
  -- Null when the recorder's profile is gone or hidden from the caller.
  p.full_name as created_by_name
from public.stock_movements m
join public.inventory_items i on i.id = m.item_id
left join public.units u on u.id = i.unit_id
left join public.brands b on b.id = i.brand_id
left join public.profiles p on p.id = m.created_by;

create view public.inventory_stock_summary
with (security_invoker = true)
as
select
  s.shop_id,
  count(*)::integer as item_count,
  coalesce(sum(s.on_hand), 0)::bigint as units_on_hand,
  (count(*) filter (where s.stock_status = 'in_stock'))::integer as in_stock_count,
  (count(*) filter (where s.stock_status = 'low'))::integer as low_count,
  (count(*) filter (where s.stock_status = 'reorder'))::integer as reorder_count,
  (count(*) filter (where s.stock_status = 'out_of_stock'))::integer as out_of_stock_count
from public.inventory_item_status s
where s.archived_at is null
group by s.shop_id;

create view public.inventory_attention_items
with (security_invoker = true)
as
select
  s.id,
  s.shop_id,
  s.category_name,
  s.item_code,
  s.name,
  s.unit,
  s.on_hand,
  s.reorder_level,
  s.stock_status,
  case s.stock_status
    when 'out_of_stock' then 1
    when 'reorder' then 2
    else 3
  end as severity
from public.inventory_item_status s
where s.archived_at is null
  and s.stock_status <> 'in_stock';

revoke all on
  public.inventory_item_status,
  public.stock_movement_history,
  public.inventory_stock_summary,
  public.inventory_attention_items
from anon;

revoke insert, update, delete on
  public.inventory_item_status,
  public.stock_movement_history,
  public.inventory_stock_summary,
  public.inventory_attention_items
from authenticated;

grant select on
  public.inventory_item_status,
  public.stock_movement_history,
  public.inventory_stock_summary,
  public.inventory_attention_items
to authenticated;

-- ============================================================================
-- 7. Internal helpers (not granted to clients).
-- ============================================================================

-- Unchanged from 20260925000002 except that the unit's name now lives on its own row.
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
  v_unit text;
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
    select name into v_unit from public.units where id = v_item.unit_id;
    raise exception 'Not enough stock: only % % on hand.', v_item.on_hand, v_unit;
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

-- An item needs a category of its shop and a brand that category carries.
create or replace function app.check_category_brand(p_shop_id uuid, p_category_id uuid, p_brand_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_category_id is null
    or not exists (select 1 from public.categories where id = p_category_id and shop_id = p_shop_id)
  then
    raise exception 'Choose a category.';
  end if;

  if p_brand_id is null
    or not exists (
      select 1 from public.category_brands
      where category_id = p_category_id and brand_id = p_brand_id
    )
  then
    raise exception 'Choose a brand this category carries.';
  end if;
end;
$$;

-- The category's next free item code, e.g. BRK-UMI-001; the number widens past 999.
-- Locks the category row, so two items saved at once never draw the same number.
create or replace function app.next_item_code(p_category_id uuid, p_brand_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category public.categories%rowtype;
  v_brand_code text;
  v_number integer;
  v_code text;
begin
  select * into v_category from public.categories where id = p_category_id for update;
  select code into v_brand_code from public.brands where id = p_brand_id;
  v_number := v_category.next_number;

  -- Skips a code an older item already holds, e.g. after a category code change.
  loop
    v_code := v_category.code || '-' || v_brand_code || '-'
      || lpad(v_number::text, greatest(3, length(v_number::text)), '0');
    v_number := v_number + 1;
    exit when not exists (
      select 1 from public.inventory_items
      where shop_id = v_category.shop_id and lower(item_code) = lower(v_code)
    );
  end loop;

  update public.categories set next_number = v_number where id = p_category_id;

  return v_code;
end;
$$;

-- Sets the brands a category carries. Taking away one its items still use is refused.
create or replace function app.set_category_brands(p_category_id uuid, p_shop_id uuid, p_brand_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.category_brands
  where category_id = p_category_id and not (brand_id = any (p_brand_ids));

  insert into public.category_brands (category_id, brand_id, shop_id)
  select p_category_id, b.id, p_shop_id
  from public.brands b
  where b.id = any (p_brand_ids) and b.shop_id = p_shop_id
  on conflict do nothing;
exception
  when foreign_key_violation then
    raise exception 'Some items in this category still use that brand. Change those items first.';
end;
$$;

-- Sets the categories a brand is sold in, with the same rule.
create or replace function app.set_brand_categories(p_brand_id uuid, p_shop_id uuid, p_category_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.category_brands
  where brand_id = p_brand_id and not (category_id = any (p_category_ids));

  insert into public.category_brands (category_id, brand_id, shop_id)
  select c.id, p_brand_id, p_shop_id
  from public.categories c
  where c.id = any (p_category_ids) and c.shop_id = p_shop_id
  on conflict do nothing;
exception
  when foreign_key_violation then
    raise exception 'Some items still use this brand in that category. Change those items first.';
end;
$$;

-- Upper-cased and checked here, so a typed code gets a readable error.
create or replace function app.clean_code(p_code text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_code text := upper(nullif(btrim(p_code), ''));
begin
  if v_code is not null and v_code !~ '^[A-Z0-9]{2,6}$' then
    raise exception 'Use 2 to 6 letters or digits for the code.';
  end if;
  return v_code;
end;
$$;

revoke all on function
  app.create_shop_units(),
  app.free_code(uuid, text, text),
  app.check_category_brand(uuid, uuid, uuid),
  app.next_item_code(uuid, uuid),
  app.set_category_brands(uuid, uuid, uuid[]),
  app.set_brand_categories(uuid, uuid, uuid[]),
  app.clean_code(text)
from public;

-- ============================================================================
-- 8. Client functions. Each takes a client-generated id, so a replayed offline
--    write changes nothing the second time. p_code and the id lists default to
--    null, so a category write queued before this migration still replays.
-- ============================================================================

create or replace function public.create_category(
  p_id uuid,
  p_shop_id uuid,
  p_name text,
  p_code text default null,
  p_brand_ids uuid[] default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, true);
  v_code text := app.clean_code(p_code);
  v_constraint text;
begin
  insert into public.categories (id, shop_id, name, code)
  values (p_id, v_shop_id, btrim(p_name), coalesce(v_code, app.free_code(v_shop_id, p_name, 'category')))
  on conflict (id) do nothing;

  -- Already created by an earlier replay, unless the id is another shop's.
  if not found then
    if not exists (select 1 from public.categories where id = p_id and shop_id = v_shop_id) then
      raise exception 'You don''t have permission to do that.' using errcode = '42501';
    end if;
    return p_id;
  end if;

  if p_brand_ids is not null then
    perform app.set_category_brands(p_id, v_shop_id, p_brand_ids);
  end if;

  return p_id;
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'categories_shop_code_key' then
      raise exception 'Another category already uses the code "%".', v_code;
    end if;
    raise exception 'A category named "%" already exists.', btrim(p_name);
end;
$$;

-- A new code only changes the codes of items created after it.
create or replace function public.update_category(
  p_id uuid,
  p_name text,
  p_code text default null,
  p_brand_ids uuid[] default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
  v_code text := app.clean_code(p_code);
  v_constraint text;
begin
  select shop_id into v_shop_id from public.categories where id = p_id;
  if not found then
    raise exception 'This category no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, true);

  update public.categories set name = btrim(p_name), code = coalesce(v_code, code) where id = p_id;

  if p_brand_ids is not null then
    perform app.set_category_brands(p_id, v_shop_id, p_brand_ids);
  end if;

  return p_id;
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'categories_shop_code_key' then
      raise exception 'Another category already uses the code "%".', v_code;
    end if;
    raise exception 'A category named "%" already exists.', btrim(p_name);
end;
$$;

create or replace function public.create_brand(
  p_id uuid,
  p_shop_id uuid,
  p_name text,
  p_code text default null,
  p_category_ids uuid[] default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, true);
  v_code text := app.clean_code(p_code);
  v_constraint text;
begin
  insert into public.brands (id, shop_id, name, code)
  values (p_id, v_shop_id, btrim(p_name), coalesce(v_code, app.free_code(v_shop_id, p_name, 'brand')))
  on conflict (id) do nothing;

  if not found then
    if not exists (select 1 from public.brands where id = p_id and shop_id = v_shop_id) then
      raise exception 'You don''t have permission to do that.' using errcode = '42501';
    end if;
    return p_id;
  end if;

  if p_category_ids is not null then
    perform app.set_brand_categories(p_id, v_shop_id, p_category_ids);
  end if;

  return p_id;
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'brands_shop_code_key' then
      raise exception 'Another brand already uses the code "%".', v_code;
    end if;
    raise exception 'A brand named "%" already exists.', btrim(p_name);
end;
$$;

create or replace function public.update_brand(
  p_id uuid,
  p_name text,
  p_code text default null,
  p_category_ids uuid[] default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
  v_code text := app.clean_code(p_code);
  v_constraint text;
begin
  select shop_id into v_shop_id from public.brands where id = p_id;
  if not found then
    raise exception 'This brand no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, true);

  update public.brands set name = btrim(p_name), code = coalesce(v_code, code) where id = p_id;

  if p_category_ids is not null then
    perform app.set_brand_categories(p_id, v_shop_id, p_category_ids);
  end if;

  return p_id;
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'brands_shop_code_key' then
      raise exception 'Another brand already uses the code "%".', v_code;
    end if;
    raise exception 'A brand named "%" already exists.', btrim(p_name);
end;
$$;

-- A brand still used by items is refused by the foreign key (23503).
create or replace function public.delete_brand(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.brands where id = p_id;
  if not found then
    return;
  end if;

  perform app.write_shop_id(v_shop_id, true);

  delete from public.brands where id = p_id;
end;
$$;

create or replace function public.create_unit(p_id uuid, p_shop_id uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, true);
begin
  insert into public.units (id, shop_id, name)
  values (p_id, v_shop_id, btrim(p_name))
  on conflict (id) do nothing;

  if not found
    and not exists (select 1 from public.units where id = p_id and shop_id = v_shop_id)
  then
    raise exception 'You don''t have permission to do that.' using errcode = '42501';
  end if;

  return p_id;
exception
  when unique_violation then
    raise exception 'A unit named "%" already exists.', btrim(p_name);
end;
$$;

create or replace function public.update_unit(p_id uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.units where id = p_id;
  if not found then
    raise exception 'This unit no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, true);

  update public.units set name = btrim(p_name) where id = p_id;

  return p_id;
exception
  when unique_violation then
    raise exception 'A unit named "%" already exists.', btrim(p_name);
end;
$$;

-- A unit still used by items is refused by the foreign key (23503).
create or replace function public.delete_unit(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.units where id = p_id;
  if not found then
    return;
  end if;

  perform app.write_shop_id(v_shop_id, true);

  delete from public.units where id = p_id;
end;
$$;

create or replace function public.create_storage_location(p_id uuid, p_shop_id uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, true);
begin
  insert into public.storage_locations (id, shop_id, name)
  values (p_id, v_shop_id, btrim(p_name))
  on conflict (id) do nothing;

  if not found
    and not exists (select 1 from public.storage_locations where id = p_id and shop_id = v_shop_id)
  then
    raise exception 'You don''t have permission to do that.' using errcode = '42501';
  end if;

  return p_id;
exception
  when unique_violation then
    raise exception 'A location named "%" already exists.', btrim(p_name);
end;
$$;

create or replace function public.update_storage_location(p_id uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.storage_locations where id = p_id;
  if not found then
    raise exception 'This location no longer exists.';
  end if;

  perform app.write_shop_id(v_shop_id, true);

  update public.storage_locations set name = btrim(p_name) where id = p_id;

  return p_id;
exception
  when unique_violation then
    raise exception 'A location named "%" already exists.', btrim(p_name);
end;
$$;

-- A location still used by items is refused by the foreign key (23503).
create or replace function public.delete_storage_location(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid;
begin
  select shop_id into v_shop_id from public.storage_locations where id = p_id;
  if not found then
    return;
  end if;

  perform app.write_shop_id(v_shop_id, true);

  delete from public.storage_locations where id = p_id;
end;
$$;

create or replace function public.create_item(
  p_id uuid,
  p_shop_id uuid,
  p_category_id uuid,
  p_brand_id uuid,
  p_name text,
  p_part_number text,
  p_fitment text,
  p_unit_id uuid,
  p_reorder_level integer,
  p_selling_price numeric,
  p_location_id uuid,
  p_opening_quantity integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, true);
  v_unit_id uuid;
begin
  -- Already created by an earlier replay of this write, unless the id is another
  -- shop's. Checked first, so a replay never draws a second code.
  if exists (select 1 from public.inventory_items where id = p_id) then
    if not exists (select 1 from public.inventory_items where id = p_id and shop_id = v_shop_id) then
      raise exception 'You don''t have permission to do that.' using errcode = '42501';
    end if;
    return p_id;
  end if;

  if coalesce(p_opening_quantity, 0) < 0 then
    raise exception 'Opening stock cannot be negative.';
  end if;

  perform app.check_category_brand(v_shop_id, p_category_id, p_brand_id);

  -- Blank falls back to the shop's "pc" unit, the old default.
  v_unit_id := coalesce(
    p_unit_id,
    (select id from public.units where shop_id = v_shop_id and lower(name) = 'pc')
  );
  if v_unit_id is null then
    raise exception 'Choose a unit.';
  end if;

  insert into public.inventory_items (
    id, shop_id, category_id, brand_id, item_code, name, part_number, fitment,
    unit_id, reorder_level, selling_price, location_id, created_by
  )
  values (
    p_id, v_shop_id, p_category_id, p_brand_id,
    app.next_item_code(p_category_id, p_brand_id),
    btrim(p_name), nullif(btrim(p_part_number), ''), nullif(btrim(p_fitment), ''),
    v_unit_id,
    coalesce(
      p_reorder_level,
      (select default_reorder_level from public.shop_settings where shop_id = v_shop_id)
    ),
    p_selling_price, p_location_id, auth.uid()
  )
  on conflict (id) do nothing;

  -- A concurrent replay of this write got there first.
  if not found then
    return p_id;
  end if;

  if coalesce(p_opening_quantity, 0) > 0 then
    perform app.apply_stock_movement(
      p_id, 'stock_in', 'opening_balance', p_opening_quantity, null, now(), p_id
    );
  end if;

  return p_id;
end;
$$;

-- Never touches on_hand: stock only changes through a movement.
create or replace function public.update_item(
  p_id uuid,
  p_category_id uuid,
  p_brand_id uuid,
  p_name text,
  p_part_number text,
  p_fitment text,
  p_unit_id uuid,
  p_reorder_level integer,
  p_selling_price numeric,
  p_location_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.inventory_items%rowtype;
begin
  select * into v_item from public.inventory_items where id = p_id;
  if not found then
    raise exception 'This item no longer exists.';
  end if;

  perform app.write_shop_id(v_item.shop_id, true);
  perform app.check_category_brand(v_item.shop_id, p_category_id, p_brand_id);

  update public.inventory_items set
    category_id = p_category_id,
    brand_id = p_brand_id,
    -- A new category or brand gives the item a new code.
    item_code = case
      when category_id is distinct from p_category_id or brand_id is distinct from p_brand_id
        then app.next_item_code(p_category_id, p_brand_id)
      else item_code
    end,
    name = btrim(p_name),
    part_number = nullif(btrim(p_part_number), ''),
    fitment = nullif(btrim(p_fitment), ''),
    unit_id = coalesce(p_unit_id, v_item.unit_id),
    reorder_level = coalesce(p_reorder_level, v_item.reorder_level),
    selling_price = p_selling_price,
    location_id = p_location_id
  where id = p_id;

  return p_id;
end;
$$;

revoke all on function
  public.create_category(uuid, uuid, text, text, uuid[]),
  public.update_category(uuid, text, text, uuid[]),
  public.create_brand(uuid, uuid, text, text, uuid[]),
  public.update_brand(uuid, text, text, uuid[]),
  public.delete_brand(uuid),
  public.create_unit(uuid, uuid, text),
  public.update_unit(uuid, text),
  public.delete_unit(uuid),
  public.create_storage_location(uuid, uuid, text),
  public.update_storage_location(uuid, text),
  public.delete_storage_location(uuid),
  public.create_item(uuid, uuid, uuid, uuid, text, text, text, uuid, integer, numeric, uuid, integer),
  public.update_item(uuid, uuid, uuid, text, text, text, uuid, integer, numeric, uuid)
from public, anon;

grant execute on function
  public.create_category(uuid, uuid, text, text, uuid[]),
  public.update_category(uuid, text, text, uuid[]),
  public.create_brand(uuid, uuid, text, text, uuid[]),
  public.update_brand(uuid, text, text, uuid[]),
  public.delete_brand(uuid),
  public.create_unit(uuid, uuid, text),
  public.update_unit(uuid, text),
  public.delete_unit(uuid),
  public.create_storage_location(uuid, uuid, text),
  public.update_storage_location(uuid, text),
  public.delete_storage_location(uuid),
  public.create_item(uuid, uuid, uuid, uuid, text, text, text, uuid, integer, numeric, uuid, integer),
  public.update_item(uuid, uuid, uuid, text, text, text, uuid, integer, numeric, uuid)
to authenticated;

-- ============================================================================
-- 9. Analyzer functions that return the code. Unchanged from 20260924000005
--    except sku → item_code.
-- ============================================================================

create or replace function public.analyzer_volume_ranking(
  p_shop_id uuid,
  p_from date,
  p_to date,
  p_metric text default 'sold',
  p_category_id uuid default null,
  p_status text default null
)
returns table (
  rank bigint,
  item_id uuid,
  name text,
  item_code text,
  unit text,
  category_id uuid,
  category_name text,
  quantity bigint,
  transaction_count bigint,
  on_hand integer,
  reorder_level integer,
  stock_status text
)
language sql
stable
security invoker
set search_path = ''
as $$
  with bounds as (
    select * from app.shop_period_bounds(p_shop_id, p_from, p_to)
  ),
  volume as (
    select
      m.item_id,
      sum(abs(m.quantity))::bigint as quantity,
      count(*)::bigint as transaction_count
    from public.stock_movements m
    cross join bounds b
    where m.shop_id = p_shop_id
      and m.occurred_at >= b.starts_at
      and m.occurred_at < b.ends_at
      and (
        (p_metric = 'sold' and m.movement_type = 'stock_out' and m.reason = 'sale')
        or (p_metric = 'added' and m.movement_type = 'stock_in')
      )
    group by m.item_id
  )
  select
    rank() over (order by v.quantity desc) as rank,
    s.id,
    s.name,
    s.item_code,
    s.unit,
    s.category_id,
    s.category_name,
    v.quantity,
    v.transaction_count,
    s.on_hand,
    s.reorder_level,
    s.stock_status
  from volume v
  join public.inventory_item_status s on s.id = v.item_id
  where s.archived_at is null
    and (p_category_id is null or s.category_id = p_category_id)
    and (p_status is null or s.stock_status = p_status)
  order by rank, s.name, s.id;
$$;

create or replace function public.analyzer_reorder_items(p_shop_id uuid)
returns table (
  id uuid,
  category_name text,
  item_code text,
  name text,
  unit text,
  on_hand integer,
  reorder_level integer,
  stock_status text,
  severity integer,
  sold_30d bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with today as (
    select (now() at time zone s.timezone)::date as day
    from public.shop_settings s
    where s.shop_id = p_shop_id
  ),
  bounds as (
    select b.*
    from today t
    cross join lateral app.shop_period_bounds(p_shop_id, t.day - 29, t.day) b
  ),
  sales as (
    select m.item_id, sum(-m.quantity)::bigint as quantity
    from public.stock_movements m
    cross join bounds b
    where m.shop_id = p_shop_id
      and m.movement_type = 'stock_out'
      and m.reason = 'sale'
      and m.occurred_at >= b.starts_at
      and m.occurred_at < b.ends_at
    group by m.item_id
  )
  select
    a.id,
    a.category_name,
    a.item_code,
    a.name,
    a.unit,
    a.on_hand,
    a.reorder_level,
    a.stock_status,
    a.severity,
    coalesce(s.quantity, 0)::bigint
  from public.inventory_attention_items a
  left join sales s on s.item_id = a.id
  where a.shop_id = p_shop_id
  order by a.severity, coalesce(s.quantity, 0) desc, a.name, a.id;
$$;

revoke all on function
  public.analyzer_volume_ranking(uuid, date, date, text, uuid, text),
  public.analyzer_reorder_items(uuid)
from public, anon;

grant execute on function
  public.analyzer_volume_ranking(uuid, date, date, text, uuid, text),
  public.analyzer_reorder_items(uuid)
to authenticated;
