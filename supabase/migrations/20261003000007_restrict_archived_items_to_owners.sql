-- ============================================================================
-- Moti V1.3 — archived items and the stock summary are owner-only; legacy codes
--
--   * Employees read active items only; archived rows are for owners.
--   * inventory_summary refuses anyone but an owner (or the developer).
--   * Items still carrying a pre-V1.2 code (BPS-1) get a generated item code.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Archived items
-- ----------------------------------------------------------------------------
drop policy if exists inventory_items_select on public.inventory_items;
create policy inventory_items_select on public.inventory_items
  for select to authenticated
  using (app.is_owner() or (app.is_staff() and archived_at is null));

-- ----------------------------------------------------------------------------
-- 2. Stock summary
-- ----------------------------------------------------------------------------
create or replace function public.inventory_summary()
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

  return query
    select
      count(*),
      coalesce(sum(i.on_hand), 0)::bigint,
      count(*) filter (where i.stock_status = 'low'),
      count(*) filter (where i.stock_status = 'out')
    from public.inventory_items i
    where i.archived_at is null;
end;
$$;

revoke execute on function public.inventory_summary() from public, anon;
grant execute on function public.inventory_summary() to authenticated;

-- ----------------------------------------------------------------------------
-- 3. Legacy item codes
-- ----------------------------------------------------------------------------
-- Same series as create_item; items without a usable category or brand are listed, not guessed.
do $$
declare
  v_item     record;
  v_prefix   text;
  v_series   integer;
  v_code     text;
begin
  for v_item in
    select i.id, i.name, i.item_code,
           app.code_part(c.name) as category_part,
           app.code_part(b.name) as brand_part
    from public.inventory_items i
    left join public.categories c on c.id = i.category_id
    left join public.brands b on b.id = i.brand_id
    where i.item_code !~ '^[A-Z0-9]{1,3}-[A-Z0-9]{1,3}-[0-9]{6,}$'
    order by i.created_at
  loop
    if coalesce(v_item.category_part, '') = '' or coalesce(v_item.brand_part, '') = '' then
      raise notice 'Kept code % on "%": it needs a category and a brand first',
        v_item.item_code, v_item.name;
      continue;
    end if;

    v_prefix := v_item.category_part || '-' || v_item.brand_part;
    insert into app.item_code_series as s (prefix, last_value)
    values (v_prefix, 1)
    on conflict (prefix) do update set last_value = s.last_value + 1
    returning s.last_value into v_series;

    v_code := v_prefix || '-' ||
      case when v_series < 1000000 then lpad(v_series::text, 6, '0') else v_series::text end;
    update public.inventory_items i set item_code = v_code where i.id = v_item.id;

    raise notice 'Recoded "%": % -> %', v_item.name, v_item.item_code, v_code;
  end loop;
end;
$$;
