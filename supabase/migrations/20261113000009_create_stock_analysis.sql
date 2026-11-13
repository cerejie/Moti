-- ============================================================================
-- Moti V1.7 Phase 2 — stock analyzer (read-only)
--
--   * stock_analysis (owner) works out, per active item, how fast it sells and
--     what to order, from the sale rows in stock_movements. Plain arithmetic:
--       pace       = units sold in the period ÷ days (a newer item uses its age)
--       days left  = on hand ÷ pace
--       suggested  = pace × cover days − on hand, rounded up
--     Voided sales are left out. With fewer than p_min_sales sales in the period
--     pace, days left and suggested stay null ("Not enough sales yet").
--   * Groups: order_now (out, at the warning quantity, or under the cover
--     target), low_soon (under twice the cover target), slow (in stock, at
--     least p_slow_days old, no sale in p_slow_days), ok.
--   * No table, no data change; one partial index for the sale rows.
-- ============================================================================

create index if not exists stock_movements_sale_idx
  on public.stock_movements (item_id, created_at desc) where reason = 'sale';

create or replace function public.stock_analysis(
  p_days       integer,
  p_cover_days integer,
  p_slow_days  integer,
  p_min_sales  integer,
  p_item_id    uuid default null
) returns table (
  item_id            uuid,
  name               text,
  item_code          text,
  unit               text,
  on_hand            integer,
  reorder_level      integer,
  stock_status       text,
  sold_units         integer,
  sale_count         integer,
  pace               numeric,
  days_left          numeric,
  suggested_quantity integer,
  last_sold_at       timestamptz,
  analysis_group     text
)
language plpgsql stable security invoker set search_path = '' as $$
-- The output columns share names with table columns; the query always means the column.
#variable_conflict use_column
begin
  if not app.is_owner() then
    raise exception 'Only the owner can see the stock analysis' using errcode = '42501';
  end if;
  if p_days is null or p_days not between 1 and 365 then
    raise exception 'Pick a period between 1 and 365 days';
  end if;
  if p_cover_days is null or p_cover_days not between 1 and 365 then
    raise exception 'Pick a cover target between 1 and 365 days';
  end if;
  if p_slow_days is null or p_slow_days not between 1 and 365 then
    raise exception 'Pick a slow stock limit between 1 and 365 days';
  end if;
  if p_min_sales is null or p_min_sales < 1 then
    raise exception 'The minimum number of sales must be at least 1';
  end if;

  return query
  with sales as (
    -- Sales from before transactions existed have no transaction; each counts once.
    select m.item_id, m.created_at, -m.quantity as units, coalesce(m.transaction_id, m.id) as sale_id
    from public.stock_movements m
    left join public.transactions t on t.id = m.transaction_id
    where m.reason = 'sale'
      and (t.id is null or t.status = 'completed')
      and (p_item_id is null or m.item_id = p_item_id)
  ),
  per_item as (
    select
      s.item_id,
      coalesce(sum(s.units) filter (where s.created_at >= now() - make_interval(days => p_days)), 0)::integer as sold_units,
      count(distinct s.sale_id) filter (where s.created_at >= now() - make_interval(days => p_days))::integer as sale_count,
      max(s.created_at) as last_sold_at
    from sales s
    group by s.item_id
  ),
  paced as (
    select
      i.id, i.name, i.item_code, i.unit, i.on_hand, i.reorder_level, i.stock_status, i.created_at,
      coalesce(p.sold_units, 0) as sold_units,
      coalesce(p.sale_count, 0) as sale_count,
      p.last_sold_at,
      case
        when coalesce(p.sale_count, 0) >= p_min_sales then
          coalesce(p.sold_units, 0)::numeric
            / greatest(1, least(p_days, ceil(extract(epoch from now() - i.created_at) / 86400)))
      end as pace
    from public.inventory_items i
    left join per_item p on p.item_id = i.id
    where i.archived_at is null
      and (p_item_id is null or i.id = p_item_id)
  ),
  measured as (
    select
      pc.*,
      case when pc.pace > 0 then pc.on_hand / pc.pace end as days_left
    from paced pc
  ),
  grouped as (
    select
      ms.*,
      case
        when ms.stock_status in ('out', 'low') or ms.days_left < p_cover_days then 'order_now'
        when ms.days_left < p_cover_days * 2 then 'low_soon'
        when ms.on_hand > 0
          and ms.created_at <= now() - make_interval(days => p_slow_days)
          and (ms.last_sold_at is null or ms.last_sold_at < now() - make_interval(days => p_slow_days))
          then 'slow'
        else 'ok'
      end as analysis_group
    from measured ms
  )
  select
    g.id,
    g.name,
    g.item_code,
    g.unit,
    g.on_hand,
    g.reorder_level,
    g.stock_status,
    g.sold_units,
    g.sale_count,
    round(g.pace, 2),
    round(g.days_left, 1),
    case when g.pace is not null then greatest(0, ceil(g.pace * p_cover_days - g.on_hand))::integer end,
    g.last_sold_at,
    g.analysis_group
  from grouped g
  -- The whole-shop view carries only items that need a look or sold something.
  where p_item_id is not null or g.analysis_group <> 'ok' or g.sold_units > 0
  order by g.days_left asc nulls last, g.sold_units desc, g.name;
end;
$$;

revoke execute on function public.stock_analysis(integer, integer, integer, integer, uuid) from public, anon;
grant execute on function public.stock_analysis(integer, integer, integer, integer, uuid) to authenticated;
