-- Phase 3: a read-only view of the stock ledger for the history screens.
-- security_invoker, so the caller's RLS on every joined table applies: owners
-- see their shop's ledger, the superadmin every shop's, employees nothing.

create view public.stock_movement_history
with (security_invoker = true)
as
select
  m.id,
  m.shop_id,
  m.item_id,
  i.name as item_name,
  i.sku as item_sku,
  i.unit as item_unit,
  i.search_text as item_search_text,
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
left join public.profiles p on p.id = m.created_by;

revoke all on public.stock_movement_history from anon;
grant select on public.stock_movement_history to authenticated;
