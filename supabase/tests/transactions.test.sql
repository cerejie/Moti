-- Transactions: every line or none, one sync per client_id, per-shop numbers,
-- employees see only their own, only owners void, a void returns the stock and
-- no longer counts as sold, and another shop sees none of it. Self-contained:
-- builds its own fixture and rolls back.
--
-- Fixture ids (prefix 7e570000-0000-4000-8000-):
--   shop A ...00000000000a  owner ...a1  employees ...a2 ...a3  category ...ca  brand ...ba
--   items ...1a0 (Brake pad, 10 on hand, 100.00) ...1a1 (Spark plug, 5 on hand, no price)
--   shop B ...00000000000b  owner ...b1  item ...1b0
--   transaction client ids ...d001 to ...d006
begin;

create extension if not exists pgtap with schema extensions;

select plan(41);

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
  ('7e570000-0000-4000-8000-0000000000a1', 'owner.a@transactions.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a2', 'employee.a@transactions.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a3', 'employee.a2@transactions.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000b1', 'owner.b@transactions.moti.invalid');

insert into public.shops (id, name) values
  ('7e570000-0000-4000-8000-00000000000a', 'Test Shop A'),
  ('7e570000-0000-4000-8000-00000000000b', 'Test Shop B');

insert into public.profiles (id, shop_id, role, full_name) values
  ('7e570000-0000-4000-8000-0000000000a1', '7e570000-0000-4000-8000-00000000000a', 'owner', 'Owner A'),
  ('7e570000-0000-4000-8000-0000000000a2', '7e570000-0000-4000-8000-00000000000a', 'employee', 'Employee A'),
  ('7e570000-0000-4000-8000-0000000000a3', '7e570000-0000-4000-8000-00000000000a', 'employee', 'Second Employee A'),
  ('7e570000-0000-4000-8000-0000000000b1', '7e570000-0000-4000-8000-00000000000b', 'owner', 'Owner B');

insert into public.categories (id, shop_id, name, code) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-00000000000a', 'Test Category', 'TST');

insert into public.brands (id, shop_id, name, code) values
  ('7e570000-0000-4000-8000-0000000000ba', '7e570000-0000-4000-8000-00000000000a', 'Test Brand', 'TBR');

insert into public.category_brands (category_id, brand_id, shop_id) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-0000000000ba', '7e570000-0000-4000-8000-00000000000a');

insert into public.inventory_items (id, shop_id, category_id, brand_id, item_code, name, unit_id, on_hand, reorder_level, selling_price) values
  ('7e570000-0000-4000-8000-0000000001a0', '7e570000-0000-4000-8000-00000000000a',
   '7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-0000000000ba', 'TST-TBR-001', 'Brake pad',
   (select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000a' and name = 'pc'), 10, 2, 100),
  ('7e570000-0000-4000-8000-0000000001a1', '7e570000-0000-4000-8000-00000000000a',
   '7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-0000000000ba', 'TST-TBR-002', 'Spark plug',
   (select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000a' and name = 'pc'), 5, 1, null),
  ('7e570000-0000-4000-8000-0000000001b0', '7e570000-0000-4000-8000-00000000000b',
   null, null, 'B-001', 'Shop B item',
   (select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000b' and name = 'pc'), 5, 1, null);

insert into public.stock_movements (shop_id, item_id, movement_type, reason, quantity, balance_after, client_id) values
  ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-0000000001a0',
   'stock_in', 'opening_balance', 10, 10, '7e570000-0000-4000-8000-0000000001a0'),
  ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-0000000001a1',
   'stock_in', 'opening_balance', 5, 5, '7e570000-0000-4000-8000-0000000001a1'),
  ('7e570000-0000-4000-8000-00000000000b', '7e570000-0000-4000-8000-0000000001b0',
   'stock_in', 'opening_balance', 5, 5, '7e570000-0000-4000-8000-0000000001b0');

-- Today in shop A's timezone, for the analyzer checks.
create table tests.shop_day as
select (now() at time zone timezone)::date as day
from public.shop_settings where shop_id = '7e570000-0000-4000-8000-00000000000a';
grant select on tests.shop_day to authenticated;

-- ============================================================================
-- An employee's transaction: two lines, one without a price.
-- ============================================================================

select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select lives_ok(
  $$ select public.create_transaction(
       '7e570000-0000-4000-8000-00000000d001', null,
       '[{"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 2, "unit_price": 100},
         {"item_id": "7e570000-0000-4000-8000-0000000001a1", "quantity": 1, "unit_price": null}]'::jsonb
     ) $$,
  'employee confirms a two-line transaction'
);

reset role;

-- Transaction ids are made by the server; this keeps them for the checks below.
create table tests.transaction_ids (client_id uuid primary key, id uuid);
grant select on tests.transaction_ids to authenticated;
insert into tests.transaction_ids select client_id, id from public.transactions;

select is(
  (select format('%s/%s/%s/%s', transaction_no, status, total_amount, line_count)
   from public.transactions where client_id = '7e570000-0000-4000-8000-00000000d001'),
  '1/confirmed/200.00/2', 'the first transaction is #1 and an unpriced line adds nothing'
);
select is(
  (select created_by from public.transactions where client_id = '7e570000-0000-4000-8000-00000000d001'),
  '7e570000-0000-4000-8000-0000000000a2'::uuid, 'a transaction records who confirmed it'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0'),
  8, 'the first line is deducted'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a1'),
  4, 'the second line is deducted'
);
select is(
  (select count(*) from public.stock_movements
   where reason = 'sale' and movement_type = 'stock_out' and note = 'Transaction #1'),
  2::bigint, 'each line is a sale in the ledger, noted with the transaction number'
);
select is(
  (select count(*) from public.transaction_lines l
   join public.stock_movements m on m.id = l.movement_id
   where l.transaction_id = (select id from tests.transaction_ids where client_id = '7e570000-0000-4000-8000-00000000d001')
     and m.quantity = -l.quantity),
  2::bigint, 'each line points at its own sale'
);

-- A replay changes nothing.
select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select is(
  public.create_transaction(
    '7e570000-0000-4000-8000-00000000d001', null,
    '[{"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 2, "unit_price": 100},
      {"item_id": "7e570000-0000-4000-8000-0000000001a1", "quantity": 1, "unit_price": null}]'::jsonb
  ),
  (select id from tests.transaction_ids where client_id = '7e570000-0000-4000-8000-00000000d001'),
  'a replay returns the saved transaction'
);

reset role;

select is(
  (select count(*) from public.transactions where shop_id = '7e570000-0000-4000-8000-00000000000a'),
  1::bigint, 'a replay is not saved twice'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0'),
  8, 'a replay leaves on-hand alone'
);

-- ============================================================================
-- Every line or none.
-- ============================================================================

select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select throws_ok(
  $$ select public.create_transaction(
       '7e570000-0000-4000-8000-00000000d002', null,
       '[{"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 1, "unit_price": 100},
         {"item_id": "7e570000-0000-4000-8000-0000000001a1", "quantity": 9, "unit_price": null}]'::jsonb
     ) $$,
  'P0001', 'Not enough stock for Spark plug: only 4 pc on hand.',
  'a line over its stock refuses the whole transaction, naming the item'
);
select throws_ok(
  $$ select public.create_transaction(
       '7e570000-0000-4000-8000-00000000d002', null,
       '[{"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 1, "unit_price": 100},
         {"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 1, "unit_price": 100}]'::jsonb
     ) $$,
  'P0001', 'An item is listed twice. Combine it into one line.', 'an item listed twice is refused'
);
select throws_ok(
  $$ select public.create_transaction('7e570000-0000-4000-8000-00000000d002', null, '[]'::jsonb) $$,
  'P0001', 'Add at least one item.', 'an empty transaction is refused'
);
select throws_ok(
  $$ select public.create_transaction(
       '7e570000-0000-4000-8000-00000000d002', null,
       '[{"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 0, "unit_price": 100}]'::jsonb
     ) $$,
  'P0001', 'Every line needs an item, a quantity greater than zero and a valid price.',
  'a zero quantity is refused'
);

reset role;

select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0'),
  8, 'a refused transaction deducts nothing from its other lines'
);
select is_empty(
  $$ select id from public.transactions where client_id = '7e570000-0000-4000-8000-00000000d002' $$,
  'a refused transaction is not saved'
);

-- ============================================================================
-- Numbers and visibility.
-- ============================================================================

select tests.act_as('7e570000-0000-4000-8000-0000000000a3');

select lives_ok(
  $$ select public.create_transaction(
       '7e570000-0000-4000-8000-00000000d003', null,
       '[{"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 1, "unit_price": 100}]'::jsonb
     ) $$,
  'a second employee confirms a transaction'
);

reset role;
insert into tests.transaction_ids select client_id, id from public.transactions
where client_id = '7e570000-0000-4000-8000-00000000d003';

select is(
  (select transaction_no from public.transactions where client_id = '7e570000-0000-4000-8000-00000000d003'),
  2, 'the next transaction in the shop is #2'
);

select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select is(
  (select count(*) from public.transaction_history),
  1::bigint, 'an employee sees only their own transactions'
);
select is(
  (select count(*) from public.transaction_line_details),
  2::bigint, 'an employee sees only their own transactions'' lines'
);
select throws_ok(
  $$ select public.void_transaction(
       (select id from tests.transaction_ids where client_id = '7e570000-0000-4000-8000-00000000d001'),
       'Customer returned'
     ) $$,
  '42501', null, 'an employee cannot void, even their own transaction'
);

-- ============================================================================
-- The owner voids the first transaction.
-- ============================================================================

select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select is(
  (select count(*) from public.transaction_history),
  2::bigint, 'the owner sees every transaction in the shop'
);
select is(
  (select total_units from public.analyzer_period_summary(
     '7e570000-0000-4000-8000-00000000000a', (select day from tests.shop_day), (select day from tests.shop_day), 'sold')),
  4::bigint, 'before the void, sold counts both transactions'
);
select is(
  (select total_units from public.analyzer_period_summary(
     '7e570000-0000-4000-8000-00000000000a', (select day from tests.shop_day), (select day from tests.shop_day), 'added')),
  15::bigint, 'before the void, added is the opening stock'
);
select throws_ok(
  $$ select public.void_transaction(
       (select id from tests.transaction_ids where client_id = '7e570000-0000-4000-8000-00000000d001'),
       '   '
     ) $$,
  'P0001', 'Enter a reason for the void.', 'a void needs a reason'
);
select lives_ok(
  $$ select public.void_transaction(
       (select id from tests.transaction_ids where client_id = '7e570000-0000-4000-8000-00000000d001'),
       ' Customer returned '
     ) $$,
  'the owner voids a transaction'
);
select is(
  (select format('%s/%s/%s', status, void_reason, voided_by)
   from public.transactions where client_id = '7e570000-0000-4000-8000-00000000d001'),
  'voided/Customer returned/7e570000-0000-4000-8000-0000000000a1', 'the void is recorded with its reason and who made it'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0'),
  9, 'a void returns the first line''s stock'
);
select is(
  (select on_hand from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a1'),
  5, 'a void returns the second line''s stock'
);
select is(
  (select count(*) from public.stock_movements
   where reason = 'transaction_void' and movement_type = 'stock_in' and note = 'Void of transaction #1'),
  2::bigint, 'each returned line is logged as a transaction void'
);
select lives_ok(
  $$ select public.void_transaction(
       (select id from tests.transaction_ids where client_id = '7e570000-0000-4000-8000-00000000d001'),
       'Customer returned'
     ) $$,
  'voiding again is accepted as a replay'
);
select is(
  (select count(*) from public.stock_movements where reason = 'transaction_void'),
  2::bigint, 'a repeated void returns nothing twice'
);
select is(
  (select total_units from public.analyzer_period_summary(
     '7e570000-0000-4000-8000-00000000000a', (select day from tests.shop_day), (select day from tests.shop_day), 'sold')),
  1::bigint, 'a voided transaction no longer counts as sold'
);
select is(
  (select total_units from public.analyzer_period_summary(
     '7e570000-0000-4000-8000-00000000000a', (select day from tests.shop_day), (select day from tests.shop_day), 'added')),
  15::bigint, 'stock returned by a void does not count as added'
);
select throws_ok(
  $$ insert into public.transactions (shop_id, transaction_no, total_amount, line_count, client_id)
     values ('7e570000-0000-4000-8000-00000000000a', 99, 0, 1, '7e570000-0000-4000-8000-00000000d004') $$,
  '42501', null, 'transactions cannot be written directly'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000d005', '7e570000-0000-4000-8000-0000000001a0',
       'stock_in', 'transaction_void', 1
     ) $$,
  'P0001', 'Sales are recorded as transactions.', 'a void return cannot be recorded by hand'
);

-- ============================================================================
-- Another shop sees none of it.
-- ============================================================================

select tests.act_as('7e570000-0000-4000-8000-0000000000b1');

select is_empty(
  $$ select id from public.transaction_history where shop_id = '7e570000-0000-4000-8000-00000000000a' $$,
  'another shop''s owner sees no transactions'
);
select is_empty(
  $$ select id from public.transaction_lines $$,
  'another shop''s owner sees no transaction lines'
);
select throws_ok(
  $$ select public.create_transaction(
       '7e570000-0000-4000-8000-00000000d006', null,
       '[{"item_id": "7e570000-0000-4000-8000-0000000001a0", "quantity": 1, "unit_price": 100}]'::jsonb
     ) $$,
  'P0001', 'An item in this transaction no longer exists in this shop.',
  'another shop''s owner cannot sell this shop''s item'
);
select throws_ok(
  $$ select public.void_transaction(
       (select id from tests.transaction_ids where client_id = '7e570000-0000-4000-8000-00000000d003'),
       'Intruder'
     ) $$,
  '42501', null, 'another shop''s owner cannot void this shop''s transaction'
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
