-- Stock ledger rules: on_hand changes only through record_stock_movement, every
-- movement is logged with its running balance, replays are ignored, and the ledger
-- is append-only. Self-contained: builds its own fixture and rolls back.
--
-- Fixture ids (prefix 7e570000-0000-4000-8000-):
--   shop A ...00000000000a  owner ...a1  employee ...a2  category ...ca  brand ...ba
--   item ...1a0 (created in the test), item ...1a1  movement client ids ...c001 to ...c007
begin;

create extension if not exists pgtap with schema extensions;

select plan(31);

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

-- Acts as p_user for the statements that follow; null acts as a signed-out visitor.
create or replace function tests.act_as(p_user uuid) returns void
language plpgsql
as $$
begin
  perform set_config('role', case when p_user is null then 'anon' else 'authenticated' end, true);
  perform set_config(
    'request.jwt.claims',
    case
      when p_user is null then '{"role":"anon"}'
      else json_build_object('sub', p_user, 'role', 'authenticated')::text
    end,
    true
  );
end;
$$;

grant execute on function tests.act_as(uuid) to anon, authenticated;

insert into auth.users (id, email) values
  ('7e570000-0000-4000-8000-0000000000a1', 'owner.a@ledger.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a2', 'employee.a@ledger.moti.invalid');

insert into public.shops (id, name) values
  ('7e570000-0000-4000-8000-00000000000a', 'Test Shop A');

insert into public.profiles (id, shop_id, role, full_name) values
  ('7e570000-0000-4000-8000-0000000000a1', '7e570000-0000-4000-8000-00000000000a', 'owner', 'Owner A'),
  ('7e570000-0000-4000-8000-0000000000a2', '7e570000-0000-4000-8000-00000000000a', 'employee', 'Employee A');

insert into public.categories (id, shop_id, name, code) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-00000000000a', 'Ledger Category', 'LDG');

insert into public.brands (id, shop_id, name, code) values
  ('7e570000-0000-4000-8000-0000000000ba', '7e570000-0000-4000-8000-00000000000a', 'Test Brand', 'TBR');

insert into public.category_brands (category_id, brand_id, shop_id) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-0000000000ba', '7e570000-0000-4000-8000-00000000000a');

-- A second item, for keys and dates that must not touch the first one's balance.
insert into public.inventory_items (id, shop_id, item_code, name, unit_id, on_hand, reorder_level) values
  ('7e570000-0000-4000-8000-0000000001a1', '7e570000-0000-4000-8000-00000000000a', 'LEDGER-2', 'Second item', (select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000a' and name = 'pc'), 5, 1);

insert into public.stock_movements (shop_id, item_id, movement_type, reason, quantity, balance_after, client_id) values
  ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-0000000001a1',
   'stock_in', 'opening_balance', 5, 5, '7e570000-0000-4000-8000-0000000001a1');

-- Opening balance: 10.
select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select lives_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a0', null, '7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-0000000000ba',
       'Ledger item', null, null, null, 2, null, null, 10
     ) $$,
  'owner creates an item with opening stock'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0'),
  10, 'opening stock sets on-hand'
);
select is(
  (select format('%s/%s/%s/%s', movement_type, reason, quantity, balance_after)
   from public.stock_movements where client_id = '7e570000-0000-4000-8000-0000000001a0'),
  'stock_in/opening_balance/10/10', 'opening stock is logged, keyed by the item id'
);

-- Restock 5: 15.
select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c001', '7e570000-0000-4000-8000-0000000001a0',
       'stock_in', 'restock', 5
     ) $$,
  'owner restocks'
);
select is(
  (select format('%s/%s/%s/%s', movement_type, reason, quantity, balance_after)
   from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c001'),
  'stock_in/restock/5/15', 'a restock is positive and carries the new balance'
);

-- Employee sells 3: 12.
select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c002', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'sale', 3
     ) $$,
  'employee sells'
);

select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select is(
  (select format('%s/%s/%s/%s', movement_type, reason, quantity, balance_after)
   from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c002'),
  'stock_out/sale/-3/12', 'a sale is negative and carries the new balance'
);
select is(
  (select created_by from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c002'),
  '7e570000-0000-4000-8000-0000000000a2'::uuid, 'a movement records who made it'
);

-- A replayed offline write changes nothing.
select is(
  public.record_stock_movement(
    '7e570000-0000-4000-8000-00000000c002', '7e570000-0000-4000-8000-0000000001a0',
    'stock_out', 'sale', 3
  ),
  (select id from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c002'),
  'a replay returns the original movement'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0'),
  12, 'a replay leaves on-hand alone'
);
select is(
  (select count(*) from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c002'),
  1::bigint, 'a replay is not logged twice'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c002', '7e570000-0000-4000-8000-0000000001a1',
       'stock_out', 'sale', 1
     ) $$,
  'P0001', 'This change was already recorded for a different item.',
  'a key already used for another item is refused, not silently skipped'
);

-- Refused movements.
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c003', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'sale', 13
     ) $$,
  'P0001', 'Not enough stock: only 12 pc on hand.', 'stock cannot go below zero'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c003', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'sale', 0
     ) $$,
  'P0001', 'Enter a quantity greater than zero.', 'a zero quantity is refused'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c003', '7e570000-0000-4000-8000-0000000001a0',
       'stock_in', 'restock', -1
     ) $$,
  'P0001', 'Enter a quantity greater than zero.', 'a negative quantity is refused'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c003', '7e570000-0000-4000-8000-0000000001a0',
       'stock_in', 'sale', 1
     ) $$,
  '23514', null, 'a reason must match its movement type'
);

-- Device time: kept when past, clamped when in the future. Damaged 1: 11, correction +1: 12.
select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c004', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'damaged', 1, null, now() + interval '1 day'
     ) $$,
  'owner deducts damaged stock with a future device time'
);
select is(
  (select occurred_at from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c004'),
  now(), 'a future device time is clamped to now'
);
select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c005', '7e570000-0000-4000-8000-0000000001a0',
       'stock_in', 'correction', 1, 'Recount', now() - interval '2 days'
     ) $$,
  'owner records a correction made offline two days ago'
);
select is(
  (select occurred_at from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c005'),
  now() - interval '2 days', 'a past device time is kept'
);
select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c007', '7e570000-0000-4000-8000-0000000001a1',
       'stock_out', 'damaged', 1, null, now() - interval '30 days'
     ) $$,
  'owner records a movement dated a month ago'
);
select is(
  (select occurred_at from public.stock_movements where client_id = '7e570000-0000-4000-8000-00000000c007'),
  now() - interval '7 days', 'a device time older than 7 days is clamped to 7 days ago'
);

-- on_hand has no other way in.
select lives_ok(
  $$ select public.update_item(
       '7e570000-0000-4000-8000-0000000001a0', '7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-0000000000ba', 'Ledger item renamed',
       null, null, null, 2, null, null
     ) $$,
  'owner edits the item'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0'),
  12, 'editing an item never changes on-hand'
);
select throws_ok(
  $$ update public.inventory_items set on_hand = 999
     where id = '7e570000-0000-4000-8000-0000000001a0' $$,
  '42501', null, 'on-hand cannot be written directly'
);

-- The ledger is append-only.
select throws_ok(
  $$ update public.stock_movements set quantity = 99
     where item_id = '7e570000-0000-4000-8000-0000000001a0' $$,
  '42501', null, 'ledger rows cannot be edited'
);
select throws_ok(
  $$ delete from public.stock_movements
     where item_id = '7e570000-0000-4000-8000-0000000001a0' $$,
  '42501', null, 'ledger rows cannot be deleted'
);
select throws_ok(
  $$ truncate public.stock_movements cascade $$,
  '42501', null, 'the ledger cannot be truncated, which would skip RLS'
);

-- An archived item takes no movements.
select lives_ok(
  $$ select public.set_item_archived('7e570000-0000-4000-8000-0000000001a0', true) $$,
  'owner archives the item'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c006', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'sale', 1
     ) $$,
  'P0001', 'This item is archived. Restore it before changing its stock.', 'an archived item takes no movements'
);

-- on_hand always equals the ledger total.
reset role;

select is_empty(
  $$ select i.id
     from public.inventory_items i
     left join (
       select item_id, sum(quantity) as total from public.stock_movements group by item_id
     ) m on m.item_id = i.id
     where i.shop_id = '7e570000-0000-4000-8000-00000000000a'
       and i.on_hand <> coalesce(m.total, 0) $$,
  'on-hand equals the sum of the ledger'
);

select * from finish();

rollback;
