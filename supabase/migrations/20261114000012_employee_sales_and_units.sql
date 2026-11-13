-- ============================================================================
-- Moti V1.7 Phase 5 — employee and polish
--
--   * Employees read their own sales: the transaction header and its sale rows
--     in the stock ledger. Owners are unchanged; voiding stays owner-only.
--   * "New item" no longer reaches employees (they get account notices only):
--     the trigger that sent it goes, and the notices already sent are removed.
--   * Unit is one of pc, set, box, pair, liter, meter. Existing text is
--     converted first; the migration stops if a value is left unmapped.
--   * units_sold on each item (sales minus voids), kept by a ledger trigger, so
--     the Sell picker can list top sellers first without reading the ledger.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Employees read their own sales
-- ----------------------------------------------------------------------------
drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions
  for select to authenticated
  using (app.is_owner() or (app.is_staff() and created_by = app.user_id()));

drop policy if exists stock_movements_select_own_sales on public.stock_movements;
create policy stock_movements_select_own_sales on public.stock_movements
  for select to authenticated
  using (app.is_staff() and reason = 'sale' and created_by = app.user_id());

-- ----------------------------------------------------------------------------
-- 2. No "New item" notices for employees
-- ----------------------------------------------------------------------------
drop trigger if exists inventory_items_new_push on public.inventory_items;
drop function if exists app.push_item_event();

delete from public.notifications n
using public.users u
where n.user_id = u.id and u.role = 'employee' and n.tag like 'item-%';

-- ----------------------------------------------------------------------------
-- 3. Unit from a short list
-- ----------------------------------------------------------------------------
update public.inventory_items
set unit = case lower(trim(unit))
  when 'pcs'    then 'pc'
  when 'piece'  then 'pc'
  when 'pieces' then 'pc'
  when 'sets'   then 'set'
  when 'boxes'  then 'box'
  when 'pairs'  then 'pair'
  when 'l'      then 'liter'
  when 'liters' then 'liter'
  when 'litre'  then 'liter'
  when 'litres' then 'liter'
  when 'm'      then 'meter'
  when 'meters' then 'meter'
  when 'metre'  then 'meter'
  when 'metres' then 'meter'
  else lower(trim(unit))
end
where unit not in ('pc', 'set', 'box', 'pair', 'liter', 'meter');

do $$
declare
  v_unmapped text;
begin
  select string_agg(distinct i.unit, ', ') into v_unmapped
  from public.inventory_items i
  where i.unit not in ('pc', 'set', 'box', 'pair', 'liter', 'meter');
  if v_unmapped is not null then
    raise exception 'Units with no match, fix these items first: %', v_unmapped;
  end if;
end;
$$;

alter table public.inventory_items drop constraint if exists inventory_items_unit_check;
alter table public.inventory_items add constraint inventory_items_unit_check
  check (unit in ('pc', 'set', 'box', 'pair', 'liter', 'meter'));

-- ----------------------------------------------------------------------------
-- 4. Units sold per item, for "top sellers first"
-- ----------------------------------------------------------------------------
alter table public.inventory_items
  add column if not exists units_sold integer not null default 0 check (units_sold >= 0);

-- A sale row carries a negative quantity, its void a positive one.
update public.inventory_items i
set units_sold = greatest(s.units, 0)
from (
  select m.item_id, sum(-m.quantity)::integer as units
  from public.stock_movements m
  where m.reason in ('sale', 'void')
  group by m.item_id
) s
where s.item_id = i.id and i.units_sold is distinct from greatest(s.units, 0);

create or replace function app.count_units_sold() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.inventory_items i
  set units_sold = greatest(i.units_sold - new.quantity, 0)
  where i.id = new.item_id;
  return null;
end;
$$;

revoke execute on function app.count_units_sold() from public, anon, authenticated;

drop trigger if exists stock_movements_units_sold on public.stock_movements;
create trigger stock_movements_units_sold
  after insert on public.stock_movements
  for each row when (new.reason in ('sale', 'void'))
  execute function app.count_units_sold();

create index if not exists inventory_items_units_sold_idx
  on public.inventory_items (units_sold desc, name) where archived_at is null;
