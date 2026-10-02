-- ============================================================================
-- Moti V1.1 — brands, multi-item transactions and voids
--
--   * brands           — owner-managed list, like categories. The free-text
--                        inventory_items.brand is moved here (case and space
--                        duplicates merged), linked through brand_id, and the
--                        old column is dropped.
--   * transactions     — one checkout of several items. Its lines are the
--                        'sale' rows in stock_movements that carry its id, with
--                        the selling price at the time (display only).
--   * record_transaction deducts every line or none; employees use it.
--   * void_transaction (owner) puts the stock back with 'void' ledger rows,
--                        so the ledger stays append-only.
--   * record_movement becomes owner-only adjustments; sales come only from
--                        transactions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Brands
-- ----------------------------------------------------------------------------
create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists brands_name_key on public.brands (lower(name));

drop trigger if exists brands_touch on public.brands;
create trigger brands_touch before update on public.brands
  for each row execute function app.touch_updated_at();

alter table public.inventory_items
  add column if not exists brand_id uuid references public.brands (id) on delete set null;
create index if not exists inventory_items_brand_idx on public.inventory_items (brand_id);

-- create_item reads the old column; drop it before the column goes.
drop function if exists public.create_item(text, text, uuid, text, text, text, integer, numeric, text, integer, uuid);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'inventory_items' and column_name = 'brand'
  ) then
    -- The first spelling entered wins for each case-insensitive name.
    insert into public.brands (name)
    select distinct on (lower(trim(i.brand))) trim(i.brand)
    from public.inventory_items i
    where nullif(trim(i.brand), '') is not null
    order by lower(trim(i.brand)), i.created_at
    on conflict do nothing;

    update public.inventory_items i
       set brand_id = b.id
      from public.brands b
     where i.brand_id is null
       and lower(trim(i.brand)) = lower(b.name);

    alter table public.inventory_items drop column brand;
  end if;
end;
$$;

alter table public.brands enable row level security;
revoke all on public.brands from anon, authenticated;
grant select, insert, delete on public.brands to authenticated;
grant update (name) on public.brands to authenticated;

drop policy if exists brands_select on public.brands;
create policy brands_select on public.brands
  for select to authenticated using (app.is_staff());

drop policy if exists brands_insert on public.brands;
create policy brands_insert on public.brands
  for insert to authenticated with check (app.is_owner());

drop policy if exists brands_update on public.brands;
create policy brands_update on public.brands
  for update to authenticated using (app.is_owner()) with check (app.is_owner());

drop policy if exists brands_delete on public.brands;
create policy brands_delete on public.brands
  for delete to authenticated using (app.is_owner());

revoke update on public.inventory_items from authenticated;
grant update (sku, name, category_id, brand_id, part_number, unit, reorder_level,
              selling_price, location, archived_at)
  on public.inventory_items to authenticated;

create or replace function public.create_item(
  p_sku           text,
  p_name          text,
  p_category_id   uuid,
  p_brand_id      uuid,
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
    (sku, name, category_id, brand_id, part_number, unit, on_hand, reorder_level,
     selling_price, location, client_id)
  values
    (trim(p_sku), trim(p_name), p_category_id, p_brand_id,
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

-- ----------------------------------------------------------------------------
-- 2. Transactions
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id              uuid primary key default gen_random_uuid(),
  number          bigint generated always as identity unique,
  status          text not null default 'completed' check (status in ('completed', 'voided')),
  line_count      integer not null check (line_count > 0),
  total_quantity  integer not null check (total_quantity > 0),
  -- Display only: selling price × quantity of the priced lines; null when none had a price.
  total_amount    numeric(12, 2) check (total_amount is null or total_amount >= 0),
  note            text,
  client_id       uuid unique,
  created_by      uuid,
  created_by_name text not null,
  created_at      timestamptz not null default now(),
  voided_at       timestamptz,
  voided_by_name  text,
  void_reason     text,
  constraint transactions_void_check check ((status = 'voided') = (voided_at is not null))
);
create index if not exists transactions_created_idx on public.transactions (created_at desc);
create index if not exists transactions_status_idx on public.transactions (status, created_at desc);

alter table public.stock_movements
  add column if not exists transaction_id uuid references public.transactions (id) on delete restrict,
  add column if not exists unit_price numeric(12, 2) check (unit_price is null or unit_price >= 0);
create index if not exists stock_movements_transaction_idx
  on public.stock_movements (transaction_id) where transaction_id is not null;

alter table public.stock_movements drop constraint if exists stock_movements_reason_check;
alter table public.stock_movements add constraint stock_movements_reason_check check (
  (type = 'stock_in'  and reason in ('restock', 'opening_balance', 'correction', 'void') and quantity > 0)
  or
  (type = 'stock_out' and reason in ('sale', 'damaged', 'correction') and quantity < 0)
);
alter table public.stock_movements drop constraint if exists stock_movements_void_check;
alter table public.stock_movements add constraint stock_movements_void_check
  check (reason <> 'void' or transaction_id is not null);

alter table public.transactions enable row level security;
revoke all on public.transactions from anon, authenticated;
grant select on public.transactions to authenticated;

drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions
  for select to authenticated using (app.is_owner());

-- ----------------------------------------------------------------------------
-- 3. RPCs
-- ----------------------------------------------------------------------------
-- p_lines: [{ "item_id": uuid, "quantity": int }, ...]. Repeated items are summed.
create or replace function public.record_transaction(
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id         uuid;
  v_line       record;
  v_item       public.inventory_items;
  v_count      integer := 0;
  v_quantity   integer := 0;
  v_total      numeric(12, 2);
  v_actor      uuid := app.user_id();
  v_actor_name text := app.actor_name();
begin
  if not app.is_staff() then
    raise exception 'Sign in to record a transaction' using errcode = '42501';
  end if;
  if p_client_id is null then
    raise exception 'This transaction is missing its id';
  end if;

  select t.id into v_id from public.transactions t where t.client_id = p_client_id;
  if found then
    return v_id;
  end if;

  -- Nested, because SQL does not promise to short-circuit OR.
  if jsonb_typeof(p_lines) is distinct from 'array' then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) = 0 then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) > 100 then
    raise exception 'A transaction can hold up to 100 items';
  end if;

  -- Lock in id order so two checkouts sharing items never deadlock.
  for v_line in
    select l.item_id, sum(l.quantity)::integer as quantity
    from jsonb_to_recordset(p_lines) as l(item_id uuid, quantity integer)
    group by l.item_id
    order by l.item_id
  loop
    if v_line.item_id is null or coalesce(v_line.quantity, 0) <= 0 then
      raise exception 'Every line needs an item and a quantity of at least 1';
    end if;

    select * into v_item from public.inventory_items i where i.id = v_line.item_id for update;
    if not found then
      raise exception 'An item in this transaction no longer exists';
    end if;
    if v_item.archived_at is not null then
      raise exception '% is archived', v_item.name;
    end if;
    if v_item.on_hand < v_line.quantity then
      raise exception 'Only % % of % left', v_item.on_hand, v_item.unit, v_item.name;
    end if;

    v_count    := v_count + 1;
    v_quantity := v_quantity + v_line.quantity;
    if v_item.selling_price is not null then
      v_total := coalesce(v_total, 0) + v_item.selling_price * v_line.quantity;
    end if;
  end loop;

  insert into public.transactions
    (line_count, total_quantity, total_amount, note, client_id, created_by, created_by_name)
  values
    (v_count, v_quantity, v_total, nullif(trim(p_note), ''), p_client_id, v_actor, v_actor_name)
  returning id into v_id;

  for v_line in
    select l.item_id, sum(l.quantity)::integer as quantity
    from jsonb_to_recordset(p_lines) as l(item_id uuid, quantity integer)
    group by l.item_id
    order by l.item_id
  loop
    update public.inventory_items i
       set on_hand = i.on_hand - v_line.quantity
     where i.id = v_line.item_id
    returning * into v_item;

    insert into public.stock_movements
      (item_id, type, reason, quantity, balance_after, transaction_id, unit_price,
       created_by, created_by_name)
    values
      (v_line.item_id, 'stock_out', 'sale', -v_line.quantity, v_item.on_hand, v_id,
       v_item.selling_price, v_actor, v_actor_name);
  end loop;

  return v_id;
end;
$$;

create or replace function public.void_transaction(
  p_transaction_id uuid,
  p_reason         text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_tx         public.transactions;
  v_line       record;
  v_balance    integer;
  v_actor_name text := app.actor_name();
begin
  if not app.is_owner() then
    raise exception 'Only the owner can void a transaction' using errcode = '42501';
  end if;

  select * into v_tx from public.transactions t where t.id = p_transaction_id for update;
  if not found then
    raise exception 'Transaction not found';
  end if;
  -- A replayed void (offline queue) is a no-op.
  if v_tx.status = 'voided' then
    return;
  end if;
  if nullif(trim(p_reason), '') is null then
    raise exception 'Enter why this transaction is voided';
  end if;

  for v_line in
    select m.item_id, -m.quantity as quantity
    from public.stock_movements m
    where m.transaction_id = p_transaction_id and m.reason = 'sale'
    order by m.item_id
  loop
    update public.inventory_items i
       set on_hand = i.on_hand + v_line.quantity
     where i.id = v_line.item_id
    returning i.on_hand into v_balance;

    insert into public.stock_movements
      (item_id, type, reason, quantity, balance_after, note, transaction_id,
       created_by, created_by_name)
    values
      (v_line.item_id, 'stock_in', 'void', v_line.quantity, v_balance,
       'Void #' || v_tx.number || ': ' || trim(p_reason), p_transaction_id,
       app.user_id(), v_actor_name);
  end loop;

  update public.transactions t
     set status         = 'voided',
         voided_at      = now(),
         voided_by_name = v_actor_name,
         void_reason    = trim(p_reason)
   where t.id = p_transaction_id;
end;
$$;

-- Owner adjustments only: restock, damaged, correction. Sales go through transactions.
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
  if not app.is_owner() then
    raise exception 'Only the owner can adjust stock' using errcode = '42501';
  end if;
  if p_reason in ('sale', 'void', 'opening_balance') then
    raise exception 'Record sales through a transaction';
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

revoke execute on function public.create_item(text, text, uuid, uuid, text, text, integer, numeric, text, integer, uuid) from public, anon;
revoke execute on function public.record_transaction(jsonb, text, uuid) from public, anon;
revoke execute on function public.void_transaction(uuid, text) from public, anon;
grant execute on function public.create_item(text, text, uuid, uuid, text, text, integer, numeric, text, integer, uuid) to authenticated;
grant execute on function public.record_transaction(jsonb, text, uuid) to authenticated;
grant execute on function public.void_transaction(uuid, text) to authenticated;
