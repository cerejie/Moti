-- ============================================================================
-- Moti V1.7 Phase 3 — receive a delivery, count stock
--
--   * receive_delivery (owner): many items in one save, all or none. Each line
--     writes one stock_in / restock row.
--   * record_stock_count (owner): per line the shelf count and the on-hand the
--     screen showed. Only the difference (counted − seen) is recorded, as a
--     correction, so a count queued offline never erases sales made before it
--     syncs. A matching line records nothing. A difference that would take the
--     stock below zero refuses the whole count: the item changed since it was
--     counted.
--   * Offline replay: every row's client_id is derived from the batch's client
--     id and its item, so a replayed batch is ignored and a concurrent duplicate
--     hits the existing unique index.
--   * No table or column change. record_movement stays for damaged or lost (and
--     for any older adjustment still waiting in an offline queue).
-- ============================================================================

-- p_lines: [{ "item_id": uuid, "quantity": int }, ...]. Repeated items are summed.
create or replace function public.receive_delivery(
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_line    record;
  v_item    public.inventory_items;
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

    v_balance := v_item.on_hand + v_line.quantity;
    update public.inventory_items i set on_hand = v_balance where i.id = v_line.item_id;

    insert into public.stock_movements
      (item_id, type, reason, quantity, balance_after, note, client_id,
       created_by, created_by_name)
    values
      (v_line.item_id, 'stock_in', 'restock', v_line.quantity, v_balance,
       nullif(trim(p_note), ''), md5(p_client_id::text || v_line.item_id::text)::uuid,
       app.user_id(), app.actor_name());

    v_written := v_written + 1;
  end loop;

  return v_written;
end;
$$;

-- p_lines: [{ "item_id": uuid, "counted": int, "on_hand_seen": int }, ...]. Each item once.
create or replace function public.record_stock_count(
  p_lines     jsonb,
  p_note      text,
  p_client_id uuid
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_line       record;
  v_item       public.inventory_items;
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

    v_balance := v_item.on_hand + v_difference;
    if v_balance < 0 then
      raise exception '% changed since you counted it — count it again', v_item.name;
    end if;

    update public.inventory_items i set on_hand = v_balance where i.id = v_line.item_id;

    insert into public.stock_movements
      (item_id, type, reason, quantity, balance_after, note, client_id,
       created_by, created_by_name)
    values
      (v_line.item_id,
       case when v_difference > 0 then 'stock_in' else 'stock_out' end,
       'correction', v_difference, v_balance,
       nullif(trim(p_note), ''), md5(p_client_id::text || v_line.item_id::text)::uuid,
       app.user_id(), app.actor_name());

    v_written := v_written + 1;
  end loop;

  return v_written;
end;
$$;

revoke execute on function public.receive_delivery(jsonb, text, uuid) from public, anon;
revoke execute on function public.record_stock_count(jsonb, text, uuid) from public, anon;
grant execute on function public.receive_delivery(jsonb, text, uuid) to authenticated;
grant execute on function public.record_stock_count(jsonb, text, uuid) to authenticated;
