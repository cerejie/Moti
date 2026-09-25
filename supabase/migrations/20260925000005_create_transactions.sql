-- Phase 10, part 2: transaction-based selling.
--   1. A transaction deducts every line as stock_out / sale in one all-or-nothing
--      write and is saved with a per-shop number. No payments or revenue.
--   2. An owner can void a transaction: each line comes back as stock_in /
--      transaction_void and the transaction stays visible as voided.
--   3. Every sale belongs to a transaction; record_stock_movement no longer takes one.
--   4. The analyzer's quantity sold leaves out voided transactions, and stock
--      returned by a void is not counted as added.

-- ============================================================================
-- 1. Tables
-- ============================================================================

create type app.transaction_status as enum ('confirmed', 'voided');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete restrict,
  transaction_no integer not null check (transaction_no > 0),
  status app.transaction_status not null default 'confirmed',
  -- The prices the cart showed, summed; display only, never revenue.
  total_amount numeric(14, 2) not null check (total_amount >= 0),
  line_count integer not null check (line_count > 0),
  occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  -- The client's idempotency key: a replayed offline write is ignored.
  client_id uuid not null unique,
  voided_by uuid references public.profiles (id) on delete set null,
  voided_at timestamptz,
  void_reason text check (length(btrim(void_reason)) between 1 and 240),
  created_at timestamptz not null default now(),
  constraint transactions_id_shop_key unique (id, shop_id),
  constraint transactions_shop_no_key unique (shop_id, transaction_no),
  constraint transactions_void_complete check (
    (status = 'confirmed' and voided_at is null and void_reason is null)
    or (status = 'voided' and voided_at is not null and void_reason is not null)
  )
);

create index transactions_shop_occurred_idx on public.transactions (shop_id, occurred_at desc);
create index transactions_created_by_idx on public.transactions (created_by, occurred_at desc);
create index transactions_voided_by_idx on public.transactions (voided_by);

create table public.transaction_lines (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null,
  shop_id uuid not null,
  item_id uuid not null,
  quantity integer not null check (quantity > 0),
  -- Null when the item had no selling price; the line then adds 0 to the total.
  unit_price numeric(12, 2) check (unit_price >= 0),
  line_amount numeric(14, 2) not null check (line_amount >= 0),
  movement_id uuid not null unique references public.stock_movements (id) on delete restrict,
  void_movement_id uuid unique references public.stock_movements (id) on delete restrict,
  constraint transaction_lines_item_once unique (transaction_id, item_id),
  -- Composite: a line can only point at its own shop's transaction and item.
  constraint transaction_lines_transaction_fkey foreign key (transaction_id, shop_id)
    references public.transactions (id, shop_id) on delete restrict,
  constraint transaction_lines_item_fkey foreign key (item_id, shop_id)
    references public.inventory_items (id, shop_id) on delete restrict
);

create index transaction_lines_item_idx on public.transaction_lines (item_id);

-- A void returns stock under its own reason.
alter table public.stock_movements drop constraint stock_movements_reason_matches_type;
alter table public.stock_movements add constraint stock_movements_reason_matches_type check (
  (movement_type = 'stock_in' and reason in ('restock', 'opening_balance', 'correction', 'transaction_void'))
  or (movement_type = 'stock_out' and reason in ('sale', 'damaged', 'correction'))
);

-- ============================================================================
-- 2. RLS: owners read their shop's transactions, employees only their own.
--    Writes are the functions below.
-- ============================================================================

alter table public.transactions enable row level security;
alter table public.transaction_lines enable row level security;

create policy transactions_select on public.transactions
  for select to authenticated
  using (
    (select app.is_superadmin())
    or (
      shop_id = (select app.current_shop_id())
      and (
        (select app.current_user_role()) = 'owner'
        or created_by = (select auth.uid())
      )
    )
  );

-- A line is visible when its transaction is, so the rule above is the only one.
create policy transaction_lines_select on public.transaction_lines
  for select to authenticated
  using (
    (select app.is_superadmin())
    or (
      shop_id = (select app.current_shop_id())
      and exists (select 1 from public.transactions t where t.id = transaction_lines.transaction_id)
    )
  );

revoke all on public.transactions, public.transaction_lines from anon;
revoke insert, update, delete on public.transactions, public.transaction_lines from authenticated;

-- ============================================================================
-- 3. Views
-- ============================================================================

create view public.transaction_history
with (security_invoker = true)
as
select
  t.id,
  t.shop_id,
  t.transaction_no,
  t.status,
  t.total_amount,
  t.line_count,
  t.occurred_at,
  t.created_by,
  -- Null when the profile is gone or hidden from the caller.
  c.full_name as created_by_name,
  t.voided_by,
  v.full_name as voided_by_name,
  t.voided_at,
  t.void_reason
from public.transactions t
left join public.profiles c on c.id = t.created_by
left join public.profiles v on v.id = t.voided_by;

create view public.transaction_line_details
with (security_invoker = true)
as
select
  l.id,
  l.transaction_id,
  l.shop_id,
  l.item_id,
  i.name as item_name,
  i.item_code,
  u.name as item_unit,
  l.quantity,
  l.unit_price,
  l.line_amount
from public.transaction_lines l
join public.inventory_items i on i.id = l.item_id
left join public.units u on u.id = i.unit_id;

revoke all on public.transaction_history, public.transaction_line_details from anon;
revoke insert, update, delete on public.transaction_history, public.transaction_line_details from authenticated;
grant select on public.transaction_history, public.transaction_line_details to authenticated;

-- ============================================================================
-- 4. Client functions
-- ============================================================================

-- p_lines: [{ "item_id": uuid, "quantity": int, "unit_price": numeric | null }].
-- Every line or none: any refused line rolls the whole transaction back.
create or replace function public.create_transaction(
  p_client_id uuid,
  p_shop_id uuid,
  p_lines jsonb,
  p_occurred_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_shop_id uuid := app.write_shop_id(p_shop_id, false);
  v_existing_shop_id uuid;
  v_id uuid;
  v_no integer;
  v_count integer;
  v_total numeric(14, 2);
  v_line record;
  v_movement_id uuid;
  -- The same clamp as the ledger: never in the future, never more than 7 days back.
  v_occurred timestamptz :=
    least(greatest(coalesce(p_occurred_at, now()), now() - interval '7 days'), now());
begin
  if p_client_id is null then
    raise exception 'This transaction has no id. Please try again.';
  end if;

  -- A replay of a transaction already saved, unless the key is another shop's.
  select shop_id into v_existing_shop_id from public.transactions where client_id = p_client_id;
  if found then
    if v_existing_shop_id <> v_shop_id then
      raise exception 'You don''t have permission to do that.' using errcode = '42501';
    end if;
    return (select id from public.transactions where client_id = p_client_id);
  end if;

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'Add at least one item.';
  end if;
  if jsonb_array_length(p_lines) > 100 then
    raise exception 'Keep a transaction to 100 items or fewer.';
  end if;

  select count(*), sum(x.quantity * coalesce(x.unit_price, 0))
  into v_count, v_total
  from jsonb_to_recordset(p_lines) as x(item_id uuid, quantity integer, unit_price numeric);

  if exists (
    select 1
    from jsonb_to_recordset(p_lines) as x(item_id uuid, quantity integer, unit_price numeric)
    where x.item_id is null or x.quantity is null or x.quantity <= 0
      or x.unit_price < 0 or x.unit_price >= 10000000000
  ) then
    raise exception 'Every line needs an item, a quantity greater than zero and a valid price.';
  end if;

  if (
    select count(distinct x.item_id)
    from jsonb_to_recordset(p_lines) as x(item_id uuid, quantity integer, unit_price numeric)
  ) <> v_count then
    raise exception 'An item is listed twice. Combine it into one line.';
  end if;

  -- Locks every item in one fixed order, so two transactions sharing items never deadlock.
  perform 1
  from public.inventory_items i
  where i.id in (
    select x.item_id from jsonb_to_recordset(p_lines) as x(item_id uuid, quantity integer, unit_price numeric)
  )
  order by i.id
  for update;

  -- A concurrent replay of this same transaction may have finished while we waited.
  if exists (select 1 from public.transactions where client_id = p_client_id and shop_id = v_shop_id) then
    return (select id from public.transactions where client_id = p_client_id);
  end if;

  if (
    select count(*)
    from public.inventory_items i
    where i.shop_id = v_shop_id
      and i.id in (
        select x.item_id from jsonb_to_recordset(p_lines) as x(item_id uuid, quantity integer, unit_price numeric)
      )
  ) <> v_count then
    raise exception 'An item in this transaction no longer exists in this shop.';
  end if;

  -- Checked up front so the message names the item; the ledger checks again.
  for v_line in
    select i.name, i.on_hand, i.archived_at, x.quantity, u.name as unit
    from jsonb_to_recordset(p_lines) as x(item_id uuid, quantity integer, unit_price numeric)
    join public.inventory_items i on i.id = x.item_id
    left join public.units u on u.id = i.unit_id
    order by i.name
  loop
    if v_line.archived_at is not null then
      raise exception '% is archived. Remove it from the transaction.', v_line.name;
    end if;
    if v_line.quantity > v_line.on_hand then
      raise exception 'Not enough stock for %: only % % on hand.', v_line.name, v_line.on_hand, v_line.unit;
    end if;
  end loop;

  -- The shop row serializes numbering, so two transactions never share a number.
  perform 1 from public.shops where id = v_shop_id for update;
  select coalesce(max(transaction_no), 0) + 1 into v_no
  from public.transactions where shop_id = v_shop_id;

  v_id := gen_random_uuid();

  insert into public.transactions (
    id, shop_id, transaction_no, total_amount, line_count, occurred_at, created_by, client_id
  )
  values (v_id, v_shop_id, v_no, round(v_total, 2), v_count, v_occurred, auth.uid(), p_client_id);

  for v_line in
    select x.item_id, x.quantity, x.unit_price
    from jsonb_to_recordset(p_lines) as x(item_id uuid, quantity integer, unit_price numeric)
    order by x.item_id
  loop
    -- Idempotency is the transaction's client_id; each movement gets a fresh key.
    v_movement_id := app.apply_stock_movement(
      v_line.item_id, 'stock_out', 'sale', v_line.quantity,
      'Transaction #' || v_no, v_occurred, gen_random_uuid()
    );

    insert into public.transaction_lines (
      transaction_id, shop_id, item_id, quantity, unit_price, line_amount, movement_id
    )
    values (
      v_id, v_shop_id, v_line.item_id, v_line.quantity, round(v_line.unit_price, 2),
      round(v_line.quantity * coalesce(v_line.unit_price, 0), 2), v_movement_id
    );
  end loop;

  return v_id;
end;
$$;

-- Owners only. Voiding a voided transaction does nothing, so a replay is safe.
create or replace function public.void_transaction(p_id uuid, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_transaction public.transactions%rowtype;
  v_line record;
  v_movement_id uuid;
begin
  select * into v_transaction from public.transactions where id = p_id for update;
  if not found then
    raise exception 'This transaction no longer exists.';
  end if;

  perform app.write_shop_id(v_transaction.shop_id, true);

  if v_transaction.status = 'voided' then
    return p_id;
  end if;

  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'Enter a reason for the void.';
  end if;
  if length(btrim(p_reason)) > 240 then
    raise exception 'Keep the reason under 240 characters.';
  end if;

  for v_line in
    select l.id, l.item_id, l.quantity
    from public.transaction_lines l
    where l.transaction_id = p_id
    order by l.item_id
  loop
    v_movement_id := app.apply_stock_movement(
      v_line.item_id, 'stock_in', 'transaction_void', v_line.quantity,
      'Void of transaction #' || v_transaction.transaction_no, now(), gen_random_uuid()
    );
    update public.transaction_lines set void_movement_id = v_movement_id where id = v_line.id;
  end loop;

  update public.transactions
  set status = 'voided', voided_by = auth.uid(), voided_at = now(), void_reason = btrim(p_reason)
  where id = p_id;

  return p_id;
end;
$$;

-- Adjustments only: sales go through create_transaction and returns through
-- void_transaction, so every remaining reason needs a manager.
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

  perform app.write_shop_id(v_shop_id, true);

  if p_reason in ('sale', 'transaction_void') then
    raise exception 'Sales are recorded as transactions.';
  end if;

  return app.apply_stock_movement(
    p_item_id, p_type, p_reason, p_quantity, p_note, p_occurred_at, p_client_id
  );
end;
$$;

revoke all on function
  public.create_transaction(uuid, uuid, jsonb, timestamptz),
  public.void_transaction(uuid, text)
from public, anon;

grant execute on function
  public.create_transaction(uuid, uuid, jsonb, timestamptz),
  public.void_transaction(uuid, text)
to authenticated;

-- ============================================================================
-- 5. Analyzer. Unchanged from 20260925000003 / 20260924000005 except that sold
--    leaves out voided transactions and added leaves out stock a void returned.
-- ============================================================================

-- True when this sale belongs to a voided transaction.
create or replace function app.is_voided_sale(p_movement_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.transaction_lines l
    join public.transactions t on t.id = l.transaction_id
    where l.movement_id = p_movement_id and t.status = 'voided'
  );
$$;

revoke all on function app.is_voided_sale(uuid) from public, anon;
grant execute on function app.is_voided_sale(uuid) to authenticated;

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
        (p_metric = 'sold' and m.movement_type = 'stock_out' and m.reason = 'sale'
          and not app.is_voided_sale(m.id))
        or (p_metric = 'added' and m.movement_type = 'stock_in' and m.reason <> 'transaction_void')
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
        (p_metric = 'sold' and m.movement_type = 'stock_out' and m.reason = 'sale'
          and not app.is_voided_sale(m.id))
        or (p_metric = 'added' and m.movement_type = 'stock_in' and m.reason <> 'transaction_void')
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
            and not app.is_voided_sale(m.id)
            and m.occurred_at >= b.starts_at
            and m.occurred_at < b.ends_at
        )
    )::bigint
  from (select 1) as one
  left join top_item t on true;
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
      and not app.is_voided_sale(m.id)
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
