-- ============================================================================
-- Moti V1.7 Phase 4 — the order list
--
--   * order_lists: one header per list; only one list is open at a time. A
--     list closes when its last line is received and is kept (status closed).
--   * order_list_lines: what to buy, one line per item. quantity is what is
--     still to come: a delivery takes what arrived off it.
--   * Owner only (RLS). The owner reads both tables and changes or removes a
--     line directly; lines are added only through add_to_order_list.
--   * add_to_order_list (owner): opens a list if none is open and adds items,
--     skipping any already on it, so a replayed offline add changes nothing.
--   * receive_order_list (owner): receive_delivery plus the list update in one
--     save. A line that arrived in full (or more) goes; the rest stays open.
--     receive_delivery itself is unchanged.
-- ============================================================================

create table if not exists public.order_lists (
  id          uuid primary key default gen_random_uuid(),
  status      text not null default 'open' check (status in ('open', 'closed')),
  -- No foreign key, like stock_movements.created_by: the developer account is not in public.users.
  created_by  uuid,
  closed_at   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check ((status = 'closed') = (closed_at is not null))
);
create unique index if not exists order_lists_one_open_key
  on public.order_lists (status) where status = 'open';

drop trigger if exists order_lists_touch on public.order_lists;
create trigger order_lists_touch before update on public.order_lists
  for each row execute function app.touch_updated_at();

create table if not exists public.order_list_lines (
  id          uuid primary key default gen_random_uuid(),
  list_id     uuid not null references public.order_lists (id) on delete cascade,
  item_id     uuid not null references public.inventory_items (id) on delete cascade,
  quantity    integer not null check (quantity between 1 and 99999),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (list_id, item_id)
);
create index if not exists order_list_lines_item_idx on public.order_list_lines (item_id);

drop trigger if exists order_list_lines_touch on public.order_list_lines;
create trigger order_list_lines_touch before update on public.order_list_lines
  for each row execute function app.touch_updated_at();

alter table public.order_lists      enable row level security;
alter table public.order_list_lines enable row level security;

revoke all on public.order_lists      from anon, authenticated;
revoke all on public.order_list_lines from anon, authenticated;

grant select on public.order_lists to authenticated;
grant select, delete on public.order_list_lines to authenticated;
grant update (quantity) on public.order_list_lines to authenticated;

drop policy if exists order_lists_select on public.order_lists;
create policy order_lists_select on public.order_lists
  for select to authenticated using (app.is_owner());

drop policy if exists order_list_lines_select on public.order_list_lines;
create policy order_list_lines_select on public.order_list_lines
  for select to authenticated using (app.is_owner());

drop policy if exists order_list_lines_update on public.order_list_lines;
create policy order_list_lines_update on public.order_list_lines
  for update to authenticated using (app.is_owner()) with check (app.is_owner());

drop policy if exists order_list_lines_delete on public.order_list_lines;
create policy order_list_lines_delete on public.order_list_lines
  for delete to authenticated using (app.is_owner());

-- p_lines: [{ "item_id": uuid, "quantity": int }, ...]. Returns the lines added.
create or replace function public.add_to_order_list(
  p_lines jsonb
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_list_id uuid;
  v_added   integer;
begin
  if not app.is_owner() then
    raise exception 'Only the owner can change the order list' using errcode = '42501';
  end if;
  -- Nested, because SQL does not promise to short-circuit OR.
  if jsonb_typeof(p_lines) is distinct from 'array' then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) = 0 then
    raise exception 'Add at least one item';
  end if;
  if jsonb_array_length(p_lines) > 200 then
    raise exception 'An order list can take up to 200 items at once';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_lines) as l(item_id uuid, quantity integer)
    where l.item_id is null or l.quantity is null or l.quantity not between 1 and 99999
  ) then
    raise exception 'Every line needs an item and a quantity of at least 1';
  end if;

  insert into public.order_lists (status, created_by)
  values ('open', app.user_id())
  on conflict (status) where status = 'open' do nothing;

  select o.id into v_list_id from public.order_lists o where o.status = 'open';

  insert into public.order_list_lines (list_id, item_id, quantity)
  select v_list_id, l.item_id, max(l.quantity)
  from jsonb_to_recordset(p_lines) as l(item_id uuid, quantity integer)
  join public.inventory_items i on i.id = l.item_id and i.archived_at is null
  group by l.item_id
  on conflict (list_id, item_id) do nothing;

  get diagnostics v_added = row_count;
  return v_added;
end;
$$;

-- Receives the delivery, then takes what arrived off the list, all in one save.
create or replace function public.receive_order_list(
  p_list_id   uuid,
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_written integer;
begin
  if not app.is_owner() then
    raise exception 'Only the owner can receive a delivery' using errcode = '42501';
  end if;

  v_written := public.receive_delivery(p_lines, p_note, p_client_id);
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

revoke execute on function public.add_to_order_list(jsonb) from public, anon;
revoke execute on function public.receive_order_list(uuid, jsonb, text, uuid) from public, anon;
grant execute on function public.add_to_order_list(jsonb) to authenticated;
grant execute on function public.receive_order_list(uuid, jsonb, text, uuid) to authenticated;
