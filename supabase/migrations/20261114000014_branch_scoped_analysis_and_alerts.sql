-- ============================================================================
-- Moti V1.8 UX overhaul — branch-scoped "What to buy" and clearer stock alerts
--
--   * stock_analysis gains p_branch_id. With a branch, the sales, the quantity
--     available and the Low / Out status are all that branch's, and only the
--     items the branch carries are listed. Without one (All branches) it keeps
--     the shop-wide totals and adds short_branches: how many active branches
--     are Low or Out on that item, so a shortage in one branch cannot hide
--     behind a healthy total. Such an item is put in order_now.
--     The return type changes, so the old function is dropped first (no data).
--   * Low / Out alerts read "<item> is running low" with
--     "<branch> · N <unit> available · Alert level: X" and open the product
--     page instead of the list. Deduplication is unchanged: an alert fires only
--     when a branch shelf changes status, so repeated sales while already Low
--     send nothing, and a refill above the alert level re-arms it.
--   * No table or column changes; nothing is deleted.
-- ============================================================================

drop function if exists public.stock_analysis(integer, integer, integer, integer, uuid);

create function public.stock_analysis(
  p_days       integer,
  p_cover_days integer,
  p_slow_days  integer,
  p_min_sales  integer,
  p_item_id    uuid default null,
  p_branch_id  uuid default null
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
  short_branches     integer,
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
  if p_branch_id is not null
     and not exists (select 1 from public.branches b where b.id = p_branch_id) then
    raise exception 'That branch does not exist';
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
      and (p_branch_id is null or m.branch_id = p_branch_id)
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
  -- One row per item: the picked branch's shelf, or (All branches) the count of short shelves.
  shelves as (
    select
      bs.item_id,
      sum(bs.on_hand)::integer as on_hand,
      max(bs.stock_status) as stock_status,
      (count(*) filter (where bs.stock_status in ('low', 'out')))::integer as short_branches
    from public.branch_stock bs
    join public.branches b on b.id = bs.branch_id and b.archived_at is null
    where p_branch_id is null or bs.branch_id = p_branch_id
    group by bs.item_id
  ),
  paced as (
    select
      i.id, i.name, i.item_code, i.unit, i.reorder_level, i.created_at,
      case when p_branch_id is null then i.on_hand else sh.on_hand end as on_hand,
      case when p_branch_id is null then i.stock_status else sh.stock_status end as stock_status,
      coalesce(sh.short_branches, 0) as short_branches,
      coalesce(p.sold_units, 0) as sold_units,
      coalesce(p.sale_count, 0) as sale_count,
      p.last_sold_at,
      case
        when coalesce(p.sale_count, 0) >= p_min_sales then
          coalesce(p.sold_units, 0)::numeric
            / greatest(1, least(p_days, ceil(extract(epoch from now() - i.created_at) / 86400)))
      end as pace
    from public.inventory_items i
    left join shelves sh on sh.item_id = i.id
    left join per_item p on p.item_id = i.id
    where i.archived_at is null
      and (p_item_id is null or i.id = p_item_id)
      -- A branch lists only what it carries, like the Stocks list.
      and (p_branch_id is null or sh.item_id is not null)
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
        when ms.stock_status in ('out', 'low')
          or ms.short_branches > 0
          or ms.days_left < p_cover_days then 'order_now'
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
    g.short_branches,
    g.analysis_group
  from grouped g
  -- The whole-shop view carries only items that need a look or sold something.
  where p_item_id is not null or g.analysis_group <> 'ok' or g.sold_units > 0
  order by g.days_left asc nulls last, g.sold_units desc, g.name;
end;
$$;

revoke execute on function public.stock_analysis(integer, integer, integer, integer, uuid, uuid) from public, anon;
grant execute on function public.stock_analysis(integer, integer, integer, integer, uuid, uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Low / Out alerts: plain words, the branch first, and a link to the product.
-- ----------------------------------------------------------------------------
create or replace function app.push_branch_stock_event() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_item   public.inventory_items;
  v_branch text;
begin
  if new.stock_status = 'in_stock'
     or old.stock_status is not distinct from new.stock_status then
    return null;
  end if;

  select * into v_item from public.inventory_items i where i.id = new.item_id;
  if v_item.archived_at is not null then
    return null;
  end if;
  -- One branch needs no name; with more, the alert says where.
  if (select count(*) from public.branches b where b.archived_at is null) > 1 then
    select b.name into v_branch from public.branches b where b.id = new.branch_id;
  end if;

  perform app.notify(
    app.push_owners(),
    v_item.name || case new.stock_status when 'out' then ' is out of stock' else ' is running low' end,
    concat_ws(' · ',
      v_branch,
      new.on_hand || ' ' || v_item.unit || ' available',
      'Alert level: ' || new.reorder_level),
    '/inventory/' || new.item_id,
    'stock-' || new.item_id || '-' || new.branch_id,
    p_skip_actor := false
  );
  return null;
end;
$$;

revoke execute on function app.push_branch_stock_event() from public, anon, authenticated;
