-- Phase 4: read-only views for the owner dashboard and the stock alerts.
-- Both read inventory_item_status with the Inventory list's own "not archived"
-- rule, so every count equals what the matching Inventory tab shows.
-- security_invoker, so the caller's RLS on every underlying table applies.

-- One row per shop that has at least one active item; no row means all zeros.
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

revoke all on public.inventory_stock_summary from anon;
grant select on public.inventory_stock_summary to authenticated;

-- Active items that need attention. severity orders them Out → Reorder → Low.
create view public.inventory_attention_items
with (security_invoker = true)
as
select
  s.id,
  s.shop_id,
  s.category_name,
  s.sku,
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

revoke all on public.inventory_attention_items from anon;
grant select on public.inventory_attention_items to authenticated;
