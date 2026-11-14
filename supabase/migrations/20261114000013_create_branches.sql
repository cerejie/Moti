-- ============================================================================
-- Moti V1.6 Phase 1 — branches
--
--   * branches: the shop's branches. Archived, never deleted; a branch is
--     archived only when it holds no stock and is not the last active one.
--     Everything that exists today moves into the first branch, "Main".
--   * user_branches: which employees work in which branch. Owners and the
--     developer see every branch. Until Team assigns branches (Phase 5), a new
--     employee is put in the first branch.
--   * branch_stock: the count of each item in each branch. A branch carries an
--     item once it is created there or receives it; Low / Out is judged per row
--     against the item's one warning level, copied onto the row by a trigger.
--     inventory_items.on_hand stays as the all-branches total, kept by a trigger.
--   * branch_id on transactions and stock_movements, backfilled to Main.
--   * Every stock RPC takes an optional last p_branch_id. Without one it falls
--     back to the caller's branch (an employee's first branch, else Main), so
--     the current app and queued offline writes keep working unchanged.
--   * Low / Out push moves to branch_stock and names the branch once there is
--     more than one; the 08:00 digest counts branch rows.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Branches
-- ----------------------------------------------------------------------------
create table if not exists public.branches (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 1 and 60),
  sort        integer not null default 0,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index if not exists branches_name_key on public.branches (lower(name));
create index if not exists branches_active_idx
  on public.branches (sort, created_at) where archived_at is null;

drop trigger if exists branches_touch on public.branches;
create trigger branches_touch before update on public.branches
  for each row execute function app.touch_updated_at();

insert into public.branches (name, sort)
select 'Main', 0
where not exists (select 1 from public.branches);

-- The first active branch: where today's data lives and where a write with no branch goes.
create or replace function app.first_branch() returns uuid
language sql stable security definer set search_path = '' as $$
  select b.id from public.branches b
  where b.archived_at is null
  order by b.sort, b.created_at
  limit 1;
$$;

create or replace function app.guard_branch_archive() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.archived_at is not null and old.archived_at is null then
    if exists (
      select 1 from public.branch_stock s where s.branch_id = new.id and s.on_hand > 0
    ) then
      raise exception '% still holds stock. Count it to zero first', new.name;
    end if;
    if not exists (
      select 1 from public.branches b where b.archived_at is null and b.id <> new.id
    ) then
      raise exception 'Keep at least one active branch';
    end if;
  end if;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Who works where
-- ----------------------------------------------------------------------------
create table if not exists public.user_branches (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  branch_id  uuid not null references public.branches (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (user_id, branch_id)
);
create index if not exists user_branches_branch_idx on public.user_branches (branch_id);

insert into public.user_branches (user_id, branch_id)
select u.id, app.first_branch()
from public.users u
where u.role = 'employee'
on conflict (user_id, branch_id) do nothing;

create or replace function app.can_see_branch(p_branch_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app.is_owner()
    or (app.is_staff() and exists (
      select 1 from public.user_branches ub
      where ub.user_id = app.user_id() and ub.branch_id = p_branch_id
    ));
$$;

-- Phase 5 replaces this with a branch picked under Team.
create or replace function app.assign_first_branch() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.role = 'employee'
     and not exists (select 1 from public.user_branches ub where ub.user_id = new.id) then
    insert into public.user_branches (user_id, branch_id)
    values (new.id, app.first_branch())
    on conflict (user_id, branch_id) do nothing;
  end if;
  return null;
end;
$$;

drop trigger if exists users_assign_branch on public.users;
create trigger users_assign_branch
  after insert or update of role on public.users
  for each row execute function app.assign_first_branch();

-- ----------------------------------------------------------------------------
-- 3. Stock per branch
-- ----------------------------------------------------------------------------
create table if not exists public.branch_stock (
  id            uuid primary key default gen_random_uuid(),
  branch_id     uuid not null references public.branches (id) on delete restrict,
  item_id       uuid not null references public.inventory_items (id) on delete restrict,
  on_hand       integer not null default 0 check (on_hand >= 0),
  -- A copy of the item's one warning level, so the status can be generated here.
  reorder_level integer not null default 0 check (reorder_level >= 0),
  stock_status  text generated always as (
    case
      when on_hand = 0 then 'out'
      when on_hand <= reorder_level then 'low'
      else 'in_stock'
    end
  ) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (branch_id, item_id)
);
create index if not exists branch_stock_item_idx on public.branch_stock (item_id);
create index if not exists branch_stock_status_idx on public.branch_stock (branch_id, stock_status);

drop trigger if exists branch_stock_touch on public.branch_stock;
create trigger branch_stock_touch before update on public.branch_stock
  for each row execute function app.touch_updated_at();

-- Main carries every existing item. Filled before the total trigger exists, so nothing doubles.
insert into public.branch_stock (branch_id, item_id, on_hand, reorder_level)
select app.first_branch(), i.id, i.on_hand, i.reorder_level
from public.inventory_items i
on conflict (branch_id, item_id) do nothing;

-- inventory_items.on_hand is the all-branches total; only this trigger changes it now.
create or replace function app.sync_item_on_hand() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_delta integer;
begin
  v_delta := case tg_op when 'INSERT' then new.on_hand else new.on_hand - old.on_hand end;
  if v_delta <> 0 then
    update public.inventory_items i set on_hand = i.on_hand + v_delta where i.id = new.item_id;
  end if;
  return null;
end;
$$;

drop trigger if exists branch_stock_sync_total on public.branch_stock;
create trigger branch_stock_sync_total
  after insert or update of on_hand on public.branch_stock
  for each row execute function app.sync_item_on_hand();

create or replace function app.sync_branch_reorder_level() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.branch_stock s
  set reorder_level = new.reorder_level
  where s.item_id = new.id and s.reorder_level is distinct from new.reorder_level;
  return null;
end;
$$;

drop trigger if exists inventory_items_sync_reorder on public.inventory_items;
create trigger inventory_items_sync_reorder
  after update of reorder_level on public.inventory_items
  for each row execute function app.sync_branch_reorder_level();

drop trigger if exists branches_guard_archive on public.branches;
create trigger branches_guard_archive
  before update of archived_at on public.branches
  for each row execute function app.guard_branch_archive();

-- ----------------------------------------------------------------------------
-- 4. Sales and the ledger carry their branch
-- ----------------------------------------------------------------------------
alter table public.transactions
  add column if not exists branch_id uuid references public.branches (id) on delete restrict;
update public.transactions set branch_id = app.first_branch() where branch_id is null;
alter table public.transactions alter column branch_id set not null;
create index if not exists transactions_branch_idx
  on public.transactions (branch_id, created_at desc);

alter table public.stock_movements
  add column if not exists branch_id uuid references public.branches (id) on delete restrict;
update public.stock_movements set branch_id = app.first_branch() where branch_id is null;
alter table public.stock_movements alter column branch_id set not null;
create index if not exists stock_movements_branch_idx
  on public.stock_movements (branch_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 5. Write helpers
-- ----------------------------------------------------------------------------
-- The branch a write lands in. Locks the branch row so it cannot be archived mid-save.
create or replace function app.write_branch(p_branch_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if p_branch_id is null then
    if app.is_owner() then
      v_id := app.first_branch();
    else
      select ub.branch_id into v_id
      from public.user_branches ub
      join public.branches b on b.id = ub.branch_id and b.archived_at is null
      where ub.user_id = app.user_id()
      order by b.sort, b.created_at
      limit 1;
    end if;
    if v_id is null then
      raise exception 'You are not assigned to a branch yet' using errcode = '42501';
    end if;
  else
    v_id := p_branch_id;
    if not app.can_see_branch(v_id) then
      raise exception 'You do not work in this branch' using errcode = '42501';
    end if;
  end if;

  perform 1 from public.branches b where b.id = v_id and b.archived_at is null for share;
  if not found then
    raise exception 'This branch is archived or no longer exists';
  end if;
  return v_id;
end;
$$;

-- The item's row in a branch, created at 0 if the branch does not carry it yet, locked.
-- Callers lock the item first, so locks are always taken item, then branch row.
create or replace function app.lock_branch_stock(
  p_branch_id uuid,
  p_item_id   uuid
) returns public.branch_stock
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.branch_stock;
begin
  insert into public.branch_stock (branch_id, item_id, reorder_level)
  select p_branch_id, i.id, i.reorder_level from public.inventory_items i where i.id = p_item_id
  on conflict (branch_id, item_id) do nothing;

  select * into v_row from public.branch_stock s
  where s.branch_id = p_branch_id and s.item_id = p_item_id
  for update;
  return v_row;
end;
$$;

revoke execute on function app.first_branch() from public, anon;
revoke execute on function app.write_branch(uuid) from public, anon, authenticated;
revoke execute on function app.lock_branch_stock(uuid, uuid) from public, anon, authenticated;
revoke execute on function app.guard_branch_archive() from public, anon, authenticated;
revoke execute on function app.assign_first_branch() from public, anon, authenticated;
revoke execute on function app.sync_item_on_hand() from public, anon, authenticated;
revoke execute on function app.sync_branch_reorder_level() from public, anon, authenticated;
grant execute on function app.first_branch() to authenticated;
grant execute on function app.can_see_branch(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 6. Stock RPCs write branch_stock
-- ----------------------------------------------------------------------------
-- Adding an input changes the signature, so each old version goes first.
drop function if exists public.create_item(text, uuid, uuid, text, integer, numeric, text, integer, uuid);
drop function if exists public.record_movement(uuid, text, text, integer, text, uuid);
drop function if exists public.record_transaction(jsonb, text, uuid);
drop function if exists public.receive_delivery(jsonb, text, uuid);
drop function if exists public.record_stock_count(jsonb, text, uuid);
drop function if exists public.receive_order_list(uuid, jsonb, text, uuid);
drop function if exists public.inventory_summary();

-- The new item is carried by its branch from the start, with or without opening stock.
create or replace function public.create_item(
  p_name          text,
  p_category_id   uuid,
  p_brand_id      uuid,
  p_unit          text,
  p_reorder_level integer,
  p_selling_price numeric,
  p_location      text,
  p_opening_stock integer,
  p_client_id     uuid,
  p_branch_id     uuid default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id       uuid;
  v_branch   uuid;
  v_category text;
  v_brand    text;
  v_prefix   text;
  v_series   integer;
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

  v_branch := app.write_branch(p_branch_id);

  select app.code_part(c.name) into v_category from public.categories c where c.id = p_category_id;
  if coalesce(v_category, '') = '' then
    raise exception 'Pick a category for this item';
  end if;
  select app.code_part(b.name) into v_brand from public.brands b where b.id = p_brand_id;
  if coalesce(v_brand, '') = '' then
    raise exception 'Pick a brand for this item';
  end if;

  -- One row per prefix; the upsert locks it, so two saves never share a number.
  v_prefix := v_category || '-' || v_brand;
  insert into app.item_code_series as s (prefix, last_value)
  values (v_prefix, 1)
  on conflict (prefix) do update set last_value = s.last_value + 1
  returning s.last_value into v_series;

  -- on_hand starts at 0; the branch_stock insert below adds the opening stock to it.
  insert into public.inventory_items
    (item_code, name, category_id, brand_id, unit, on_hand, reorder_level,
     selling_price, location, client_id)
  values
    -- lpad would cut a 7-digit number, so it only pads.
    (v_prefix || '-' || case when v_series < 1000000 then lpad(v_series::text, 6, '0') else v_series::text end,
     trim(p_name), p_category_id, p_brand_id,
     coalesce(nullif(trim(p_unit), ''), 'pc'),
     0, coalesce(p_reorder_level, 0), p_selling_price,
     nullif(trim(p_location), ''), p_client_id)
  returning id into v_id;

  insert into public.branch_stock (branch_id, item_id, on_hand, reorder_level)
  values (v_branch, v_id, coalesce(p_opening_stock, 0), coalesce(p_reorder_level, 0));

  if coalesce(p_opening_stock, 0) > 0 then
    insert into public.stock_movements
      (item_id, branch_id, type, reason, quantity, balance_after, created_by, created_by_name)
    values
      (v_id, v_branch, 'stock_in', 'opening_balance', p_opening_stock, p_opening_stock,
       app.user_id(), app.actor_name());
  end if;

  return v_id;
end;
$$;

-- Owner adjustments only: restock, damaged, correction. Sales go through transactions.
create or replace function public.record_movement(
  p_item_id   uuid,
  p_type      text,
  p_reason    text,
  p_quantity  integer,
  p_note      text,
  p_client_id uuid,
  p_branch_id uuid default null
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_item    public.inventory_items;
  v_stock   public.branch_stock;
  v_branch  uuid;
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

  v_branch := app.write_branch(p_branch_id);

  select * into v_item from public.inventory_items i where i.id = p_item_id for update;
  if not found then
    raise exception 'Item not found';
  end if;
  if v_item.archived_at is not null then
    raise exception '% is archived', v_item.name;
  end if;

  v_stock   := app.lock_branch_stock(v_branch, p_item_id);
  v_signed  := case when p_type = 'stock_in' then p_quantity else -p_quantity end;
  v_balance := v_stock.on_hand + v_signed;
  if v_balance < 0 then
    raise exception 'Only % % of % left', v_stock.on_hand, v_item.unit, v_item.name;
  end if;

  update public.branch_stock s set on_hand = v_balance where s.id = v_stock.id;

  insert into public.stock_movements
    (item_id, branch_id, type, reason, quantity, balance_after, note, client_id,
     created_by, created_by_name)
  values
    (p_item_id, v_branch, p_type, p_reason, v_signed, v_balance, nullif(trim(p_note), ''),
     p_client_id, app.user_id(), app.actor_name());

  return v_balance;
end;
$$;

-- p_lines: [{ "item_id": uuid, "quantity": int }, ...]. Repeated items are summed.
create or replace function public.record_transaction(
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid,
  p_branch_id uuid default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id         uuid;
  v_branch     uuid;
  v_line       record;
  v_item       public.inventory_items;
  v_stock      public.branch_stock;
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

  v_branch := app.write_branch(p_branch_id);

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
    v_stock := app.lock_branch_stock(v_branch, v_line.item_id);
    if v_stock.on_hand < v_line.quantity then
      raise exception 'Only % % of % left', v_stock.on_hand, v_item.unit, v_item.name;
    end if;

    v_count    := v_count + 1;
    v_quantity := v_quantity + v_line.quantity;
    if v_item.selling_price is not null then
      v_total := coalesce(v_total, 0) + v_item.selling_price * v_line.quantity;
    end if;
  end loop;

  insert into public.transactions
    (branch_id, line_count, total_quantity, total_amount, note, client_id,
     created_by, created_by_name)
  values
    (v_branch, v_count, v_quantity, v_total, nullif(trim(p_note), ''), p_client_id,
     v_actor, v_actor_name)
  returning id into v_id;

  for v_line in
    select l.item_id, sum(l.quantity)::integer as quantity
    from jsonb_to_recordset(p_lines) as l(item_id uuid, quantity integer)
    group by l.item_id
    order by l.item_id
  loop
    update public.branch_stock s
       set on_hand = s.on_hand - v_line.quantity
     where s.branch_id = v_branch and s.item_id = v_line.item_id
    returning * into v_stock;

    insert into public.stock_movements
      (item_id, branch_id, type, reason, quantity, balance_after, transaction_id, unit_price,
       created_by, created_by_name)
    select
      v_line.item_id, v_branch, 'stock_out', 'sale', -v_line.quantity, v_stock.on_hand, v_id,
      i.selling_price, v_actor, v_actor_name
    from public.inventory_items i where i.id = v_line.item_id;
  end loop;

  return v_id;
end;
$$;

-- Stock goes back to the branch that sold it.
create or replace function public.void_transaction(
  p_transaction_id uuid,
  p_reason         text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_tx         public.transactions;
  v_line       record;
  v_stock      public.branch_stock;
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
    perform 1 from public.inventory_items i where i.id = v_line.item_id for update;
    v_stock := app.lock_branch_stock(v_tx.branch_id, v_line.item_id);

    update public.branch_stock s
       set on_hand = s.on_hand + v_line.quantity
     where s.id = v_stock.id
    returning * into v_stock;

    insert into public.stock_movements
      (item_id, branch_id, type, reason, quantity, balance_after, note, transaction_id,
       created_by, created_by_name)
    values
      (v_line.item_id, v_tx.branch_id, 'stock_in', 'void', v_line.quantity, v_stock.on_hand,
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

-- p_lines: [{ "item_id": uuid, "quantity": int }, ...]. Repeated items are summed.
create or replace function public.receive_delivery(
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid,
  p_branch_id uuid default null
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_line    record;
  v_item    public.inventory_items;
  v_stock   public.branch_stock;
  v_branch  uuid;
  v_balance integer;
  v_written integer := 0;
begin
  if not app.is_owner() then
    raise exception 'Only the owner can receive a delivery' using errcode = '42501';
  end if;
  if p_client_id is null then
    raise exception 'This delivery is missing its id';
  end if;
  -- Nested, because SQL does not promise to short-circuit OR.
  if jsonb_typeof(p_lines) is distinct from 'array' then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) = 0 then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) > 100 then
    raise exception 'A delivery can hold up to 100 items';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_lines) as l(item_id uuid)
    join public.stock_movements m
      on m.client_id = md5(p_client_id::text || l.item_id::text)::uuid
  ) then
    return 0;
  end if;

  v_branch := app.write_branch(p_branch_id);

  -- Lock in id order so two saves sharing items never deadlock.
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
      raise exception 'An item in this delivery no longer exists';
    end if;
    if v_item.archived_at is not null then
      raise exception '% is archived', v_item.name;
    end if;

    v_stock   := app.lock_branch_stock(v_branch, v_line.item_id);
    v_balance := v_stock.on_hand + v_line.quantity;
    update public.branch_stock s set on_hand = v_balance where s.id = v_stock.id;

    insert into public.stock_movements
      (item_id, branch_id, type, reason, quantity, balance_after, note, client_id,
       created_by, created_by_name)
    values
      (v_line.item_id, v_branch, 'stock_in', 'restock', v_line.quantity, v_balance,
       nullif(trim(p_note), ''), md5(p_client_id::text || v_line.item_id::text)::uuid,
       app.user_id(), app.actor_name());
    v_written := v_written + 1;
  end loop;

  return v_written;
end;
$$;

-- p_lines: [{ "item_id": uuid, "counted": int, "on_hand_seen": int }, ...]. Each item once.
-- on_hand_seen is the branch's count the screen showed.
create or replace function public.record_stock_count(
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid,
  p_branch_id uuid default null
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_line       record;
  v_item       public.inventory_items;
  v_stock      public.branch_stock;
  v_branch     uuid;
  v_difference integer;
  v_balance    integer;
  v_written    integer := 0;
begin
  if not app.is_owner() then
    raise exception 'Only the owner can count stock' using errcode = '42501';
  end if;
  if p_client_id is null then
    raise exception 'This count is missing its id';
  end if;
  if jsonb_typeof(p_lines) is distinct from 'array' then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) = 0 then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) > 200 then
    raise exception 'A count can hold up to 200 items';
  end if;
  if (select count(distinct l.item_id) from jsonb_to_recordset(p_lines) as l(item_id uuid))
     <> jsonb_array_length(p_lines) then
    raise exception 'Count each item once';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_lines) as l(item_id uuid)
    join public.stock_movements m
      on m.client_id = md5(p_client_id::text || l.item_id::text)::uuid
  ) then
    return 0;
  end if;

  v_branch := app.write_branch(p_branch_id);

  for v_line in
    select l.item_id, l.counted, l.on_hand_seen
    from jsonb_to_recordset(p_lines) as l(item_id uuid, counted integer, on_hand_seen integer)
    order by l.item_id
  loop
    if v_line.item_id is null or v_line.counted is null or v_line.counted < 0
       or v_line.on_hand_seen is null or v_line.on_hand_seen < 0 then
      raise exception 'Every line needs an item and a count of 0 or more';
    end if;

    v_difference := v_line.counted - v_line.on_hand_seen;
    continue when v_difference = 0;

    select * into v_item from public.inventory_items i where i.id = v_line.item_id for update;
    if not found then
      raise exception 'An item in this count no longer exists';
    end if;
    if v_item.archived_at is not null then
      raise exception '% is archived', v_item.name;
    end if;

    v_stock   := app.lock_branch_stock(v_branch, v_line.item_id);
    v_balance := v_stock.on_hand + v_difference;
    if v_balance < 0 then
      raise exception '% changed since you counted it. Count it again', v_item.name;
    end if;

    update public.branch_stock s set on_hand = v_balance where s.id = v_stock.id;

    insert into public.stock_movements
      (item_id, branch_id, type, reason, quantity, balance_after, note, client_id,
       created_by, created_by_name)
    values
      (v_line.item_id, v_branch,
       case when v_difference > 0 then 'stock_in' else 'stock_out' end,
       'correction', v_difference, v_balance,
       nullif(trim(p_note), ''), md5(p_client_id::text || v_line.item_id::text)::uuid,
       app.user_id(), app.actor_name());
    v_written := v_written + 1;
  end loop;

  return v_written;
end;
$$;

-- Receives the delivery into its branch, then takes what arrived off the shop's one list.
create or replace function public.receive_order_list(
  p_list_id   uuid,
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid,
  p_branch_id uuid default null
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_written integer;
begin
  if not app.is_owner() then
    raise exception 'Only the owner can receive a delivery' using errcode = '42501';
  end if;

  v_written := public.receive_delivery(p_lines, p_note, p_client_id, p_branch_id);
  -- 0 means this delivery was already saved (an offline replay): the list was updated then.
  if v_written = 0 then
    return 0;
  end if;

  perform 1 from public.order_lists o
  where o.id = p_list_id and o.status = 'open'
  for update;
  if not found then
    return v_written;
  end if;

  -- One statement, so a shortened line is never re-checked against what arrived.
  with arrived as (
    select l.item_id, sum(l.quantity)::integer as quantity
    from jsonb_to_recordset(p_lines) as l(item_id uuid, quantity integer)
    group by l.item_id
  ),
  received_in_full as (
    delete from public.order_list_lines ol
    using arrived a
    where ol.list_id = p_list_id and ol.item_id = a.item_id and ol.quantity <= a.quantity
    returning ol.id
  )
  update public.order_list_lines ol
  set quantity = ol.quantity - a.quantity
  from arrived a
  where ol.list_id = p_list_id and ol.item_id = a.item_id and ol.quantity > a.quantity;

  if not exists (select 1 from public.order_list_lines ol where ol.list_id = p_list_id) then
    update public.order_lists o set status = 'closed', closed_at = now() where o.id = p_list_id;
  end if;

  return v_written;
end;
$$;

-- Without a branch: the all-branches totals. With one: that branch's carried items.
create or replace function public.inventory_summary(p_branch_id uuid default null)
returns table (
  item_count     bigint,
  units_on_hand  bigint,
  low_count      bigint,
  out_count      bigint
)
language plpgsql stable set search_path = '' as $$
begin
  if not app.is_owner() then
    raise exception 'Only the owner can see the stock summary' using errcode = '42501';
  end if;

  if p_branch_id is null then
    return query
      select
        count(*),
        coalesce(sum(i.on_hand), 0)::bigint,
        count(*) filter (where i.stock_status = 'low'),
        count(*) filter (where i.stock_status = 'out')
      from public.inventory_items i
      where i.archived_at is null;
  else
    return query
      select
        count(*),
        coalesce(sum(s.on_hand), 0)::bigint,
        count(*) filter (where s.stock_status = 'low'),
        count(*) filter (where s.stock_status = 'out')
      from public.branch_stock s
      join public.inventory_items i on i.id = s.item_id and i.archived_at is null
      where s.branch_id = p_branch_id;
  end if;
end;
$$;

revoke execute on function public.create_item(text, uuid, uuid, text, integer, numeric, text, integer, uuid, uuid) from public, anon;
revoke execute on function public.record_movement(uuid, text, text, integer, text, uuid, uuid) from public, anon;
revoke execute on function public.record_transaction(jsonb, text, uuid, uuid) from public, anon;
revoke execute on function public.void_transaction(uuid, text) from public, anon;
revoke execute on function public.receive_delivery(jsonb, text, uuid, uuid) from public, anon;
revoke execute on function public.record_stock_count(jsonb, text, uuid, uuid) from public, anon;
revoke execute on function public.receive_order_list(uuid, jsonb, text, uuid, uuid) from public, anon;
revoke execute on function public.inventory_summary(uuid) from public, anon;
grant execute on function public.create_item(text, uuid, uuid, text, integer, numeric, text, integer, uuid, uuid) to authenticated;
grant execute on function public.record_movement(uuid, text, text, integer, text, uuid, uuid) to authenticated;
grant execute on function public.record_transaction(jsonb, text, uuid, uuid) to authenticated;
grant execute on function public.void_transaction(uuid, text) to authenticated;
grant execute on function public.receive_delivery(jsonb, text, uuid, uuid) to authenticated;
grant execute on function public.record_stock_count(jsonb, text, uuid, uuid) to authenticated;
grant execute on function public.receive_order_list(uuid, jsonb, text, uuid, uuid) to authenticated;
grant execute on function public.inventory_summary(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 7. RLS
-- ----------------------------------------------------------------------------
alter table public.branches      enable row level security;
alter table public.user_branches enable row level security;
alter table public.branch_stock  enable row level security;

revoke all on public.branches      from anon, authenticated;
revoke all on public.user_branches from anon, authenticated;
revoke all on public.branch_stock  from anon, authenticated;

-- Branches are never deleted; archive instead.
grant select on public.branches to authenticated;
grant insert (id, name, sort) on public.branches to authenticated;
grant update (name, sort, archived_at) on public.branches to authenticated;
-- Assignments change under Team (Phase 5); until then only the trigger above writes them.
grant select on public.user_branches to authenticated;
-- Only the stock RPCs write counts.
grant select on public.branch_stock to authenticated;

drop policy if exists branches_select on public.branches;
create policy branches_select on public.branches
  for select to authenticated
  using (app.is_owner() or (archived_at is null and app.can_see_branch(id)));

drop policy if exists branches_insert on public.branches;
create policy branches_insert on public.branches
  for insert to authenticated with check (app.is_owner());

drop policy if exists branches_update on public.branches;
create policy branches_update on public.branches
  for update to authenticated using (app.is_owner()) with check (app.is_owner());

drop policy if exists user_branches_select on public.user_branches;
create policy user_branches_select on public.user_branches
  for select to authenticated
  using (app.is_owner() or user_id = app.user_id());

drop policy if exists branch_stock_select on public.branch_stock;
create policy branch_stock_select on public.branch_stock
  for select to authenticated using (app.can_see_branch(branch_id));

drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions
  for select to authenticated
  using (
    app.can_see_branch(branch_id)
    and (app.is_owner() or (app.is_staff() and created_by = app.user_id()))
  );

drop policy if exists stock_movements_select_own_sales on public.stock_movements;
create policy stock_movements_select_own_sales on public.stock_movements
  for select to authenticated
  using (
    app.is_staff() and reason = 'sale' and created_by = app.user_id()
    and app.can_see_branch(branch_id)
  );

-- ----------------------------------------------------------------------------
-- 8. Low / Out alerts per branch
-- ----------------------------------------------------------------------------
drop trigger if exists inventory_items_push on public.inventory_items;

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
    case new.stock_status when 'out' then 'Out of stock' else 'Low stock' end,
    concat_ws(' · ',
      v_item.name,
      v_item.item_code,
      v_branch,
      new.on_hand || ' ' || v_item.unit || ' left',
      'warning at ' || new.reorder_level),
    '/inventory',
    'stock-' || new.item_id || '-' || new.branch_id,
    p_skip_actor := false
  );
  return null;
end;
$$;

revoke execute on function app.push_branch_stock_event() from public, anon, authenticated;

drop trigger if exists branch_stock_push on public.branch_stock;
create trigger branch_stock_push
  after update of on_hand, reorder_level on public.branch_stock
  for each row execute function app.push_branch_stock_event();

create or replace function app.send_low_stock_digest() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_low bigint;
  v_out bigint;
begin
  select count(*) filter (where s.stock_status = 'low'),
         count(*) filter (where s.stock_status = 'out')
    into v_low, v_out
  from public.branch_stock s
  join public.inventory_items i on i.id = s.item_id and i.archived_at is null
  join public.branches b on b.id = s.branch_id and b.archived_at is null;

  if v_low + v_out = 0 then
    return;
  end if;

  perform app.send_push(
    app.push_owners(),
    'Stock check',
    concat_ws(', ',
      case when v_out > 0 then v_out || ' out of stock' end,
      case when v_low > 0 then v_low || ' running low' end),
    '/inventory',
    'low-stock-digest'
  );
end;
$$;

revoke execute on function app.send_low_stock_digest() from public, anon, authenticated;
