-- Phase 5: Smart Analyzer. Read-only functions that aggregate the stock ledger.
-- security invoker, so the caller's RLS applies: stock_movements is readable by
-- the shop's owner and the superadmin only, so an employee gets no rows.
-- Archived items are left out, the same rule as the Inventory list and the dashboard.
-- Periods are calendar dates in the shop's timezone, from the first day's
-- midnight up to (not including) the midnight after the last day.

create or replace function app.shop_period_bounds(
  p_shop_id uuid,
  p_from date,
  p_to date,
  out starts_at timestamptz,
  out ends_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_timezone text;
begin
  if p_from is null or p_to is null or p_from > p_to then
    raise exception 'Pick a start date on or before the end date.';
  end if;

  select s.timezone into v_timezone from public.shop_settings s where s.shop_id = p_shop_id;
  if v_timezone is null then
    raise exception 'Choose a shop first.';
  end if;

  starts_at := p_from::timestamp at time zone v_timezone;
  ends_at := (p_to + 1)::timestamp at time zone v_timezone;
end;
$$;

revoke all on function app.shop_period_bounds(uuid, date, date) from public;
grant execute on function app.shop_period_bounds(uuid, date, date) to authenticated;

-- ============================================================================
-- Volume ranking. Sold is the sum of stock_out / sale; added is the sum of every
-- stock_in. Only items that moved in the period are ranked; rank() is taken
-- inside the category and status filters, and ties share a rank.
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
  sku text,
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
    s.sku,
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

-- ============================================================================
-- Period summary: one row for the whole shop, ignoring the ranking's filters.
-- unsold_stocked_count is always about sales: active items with stock on hand
-- now and no sale in the period.
-- ============================================================================

create or replace function public.analyzer_period_summary(
  p_shop_id uuid,
  p_from date,
  p_to date,
  p_metric text default 'sold'
)
returns table (
  total_units bigint,
  item_count bigint,
  top_item_id uuid,
  top_item_name text,
  top_item_unit text,
  top_item_quantity bigint,
  unsold_stocked_count bigint
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
    select m.item_id, sum(abs(m.quantity))::bigint as quantity
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
  ),
  active_volume as (
    select v.item_id, v.quantity, s.name, s.unit
    from volume v
    join public.inventory_item_status s on s.id = v.item_id
    where s.archived_at is null
  ),
  top_item as (
    select a.item_id, a.name, a.unit, a.quantity
    from active_volume a
    order by a.quantity desc, a.name, a.item_id
    limit 1
  )
  select
    coalesce((select sum(a.quantity) from active_volume a), 0)::bigint,
    (select count(*) from active_volume)::bigint,
    t.item_id,
    t.name,
    t.unit,
    t.quantity,
    (
      select count(*)
      from public.inventory_item_status s
      where s.shop_id = p_shop_id
        and s.archived_at is null
        and s.on_hand > 0
        and not exists (
          select 1
          from public.stock_movements m
          cross join bounds b
          where m.item_id = s.id
            and m.movement_type = 'stock_out'
            and m.reason = 'sale'
            and m.occurred_at >= b.starts_at
            and m.occurred_at < b.ends_at
        )
    )::bigint
  from (select 1) as one
  left join top_item t on true;
$$;

-- ============================================================================
-- Needs reorder: the dashboard's attention items (Out → Reorder → Low), then by
-- units sold in the last 30 calendar days in the shop's timezone, today included.
-- ============================================================================

create or replace function public.analyzer_reorder_items(p_shop_id uuid)
returns table (
  id uuid,
  category_name text,
  sku text,
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
    a.sku,
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
  public.analyzer_period_summary(uuid, date, date, text),
  public.analyzer_reorder_items(uuid)
from public, anon;

grant execute on function
  public.analyzer_volume_ranking(uuid, date, date, text, uuid, text),
  public.analyzer_period_summary(uuid, date, date, text),
  public.analyzer_reorder_items(uuid)
to authenticated;
