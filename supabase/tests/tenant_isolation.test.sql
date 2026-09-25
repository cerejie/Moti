-- Tenant isolation: a shop's members see and change only their own shop, the
-- superadmin sees every shop, and a suspended shop or deactivated user sees nothing.
-- Self-contained: builds its own fixture and rolls back, so it leaves no trace.
--
-- Fixture ids (prefix 7e570000-0000-4000-8000-):
--   shop A ...00000000000a  owner ...a1  employee ...a2  category ...ca  item ...1a0
--   shop B ...00000000000b  owner ...b1  employee ...b2  category ...cb  item ...1b0
--   superadmin ...000000000001
begin;

create extension if not exists pgtap with schema extensions;

select plan(35);

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
  ('7e570000-0000-4000-8000-000000000001', 'superadmin@tenant.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a1', 'owner.a@tenant.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a2', 'employee.a@tenant.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000b1', 'owner.b@tenant.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000b2', 'employee.b@tenant.moti.invalid');

insert into public.shops (id, name) values
  ('7e570000-0000-4000-8000-00000000000a', 'Test Shop A'),
  ('7e570000-0000-4000-8000-00000000000b', 'Test Shop B');

insert into public.profiles (id, shop_id, role, full_name) values
  ('7e570000-0000-4000-8000-000000000001', null, 'superadmin', 'Test Superadmin'),
  ('7e570000-0000-4000-8000-0000000000a1', '7e570000-0000-4000-8000-00000000000a', 'owner', 'Owner A'),
  ('7e570000-0000-4000-8000-0000000000a2', '7e570000-0000-4000-8000-00000000000a', 'employee', 'Employee A'),
  ('7e570000-0000-4000-8000-0000000000b1', '7e570000-0000-4000-8000-00000000000b', 'owner', 'Owner B'),
  ('7e570000-0000-4000-8000-0000000000b2', '7e570000-0000-4000-8000-00000000000b', 'employee', 'Employee B');

insert into public.categories (id, shop_id, name) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-00000000000a', 'Test Category'),
  ('7e570000-0000-4000-8000-0000000000cb', '7e570000-0000-4000-8000-00000000000b', 'Test Category');

-- Item B sits at its reorder level, so shop B has an alert to leak.
insert into public.inventory_items (id, shop_id, category_id, sku, name, on_hand, reorder_level) values
  ('7e570000-0000-4000-8000-0000000001a0', '7e570000-0000-4000-8000-00000000000a',
   '7e570000-0000-4000-8000-0000000000ca', 'TEST-A', 'Test item A', 10, 2),
  ('7e570000-0000-4000-8000-0000000001b0', '7e570000-0000-4000-8000-00000000000b',
   '7e570000-0000-4000-8000-0000000000cb', 'TEST-B', 'Test item B', 1, 2);

insert into public.stock_movements (shop_id, item_id, movement_type, reason, quantity, balance_after, client_id) values
  ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-0000000001a0',
   'stock_in', 'opening_balance', 10, 10, '7e570000-0000-4000-8000-0000000001a0'),
  ('7e570000-0000-4000-8000-00000000000b', '7e570000-0000-4000-8000-0000000001b0',
   'stock_in', 'opening_balance', 1, 1, '7e570000-0000-4000-8000-0000000001b0');

-- Owner A reads only shop A.
select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select is_empty(
  $$ select id from public.inventory_items where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees no other shop''s items'
);
select isnt_empty(
  $$ select id from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0' $$,
  'owner sees their own shop''s items'
);
select is_empty(
  $$ select id from public.categories where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees no other shop''s categories'
);
select is_empty(
  $$ select id from public.stock_movements where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees no other shop''s ledger'
);
select isnt_empty(
  $$ select id from public.stock_movements where shop_id = '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees their own shop''s ledger'
);
select is_empty(
  $$ select shop_id from public.shop_settings where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees no other shop''s settings'
);
select is_empty(
  $$ select id from public.shops where id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees no other shop'
);
select is_empty(
  $$ select id from public.profiles where shop_id is distinct from '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees no profile outside their shop, the superadmin''s included'
);
select is_empty(
  $$ select id from public.inventory_item_status where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'status view hides other shops'
);
select is_empty(
  $$ select id from public.stock_movement_history where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'history view hides other shops'
);
select is_empty(
  $$ select shop_id from public.inventory_stock_summary where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'dashboard summary hides other shops'
);
select is_empty(
  $$ select id from public.inventory_attention_items where shop_id <> '7e570000-0000-4000-8000-00000000000a' $$,
  'stock alerts hide other shops'
);
select is_empty(
  $$ select id from public.analyzer_reorder_items('7e570000-0000-4000-8000-00000000000b') $$,
  'analyzer reorder list returns nothing for another shop'
);

-- Owner A cannot write into shop B.
select throws_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000f001', '7e570000-0000-4000-8000-00000000000b', 'Intruder') $$,
  '42501', null, 'owner cannot create a category in another shop'
);
select throws_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-00000000f002', '7e570000-0000-4000-8000-00000000000b', null,
       'INTRUDER-1', 'Intruder item', null, null, null, null, null, null, null, 0
     ) $$,
  '42501', null, 'owner cannot create an item in another shop'
);
select throws_ok(
  $$ select public.update_item(
       '7e570000-0000-4000-8000-0000000001b0', null, 'TEST-B', 'Renamed by intruder',
       null, null, null, null, null, null, null
     ) $$,
  '42501', null, 'owner cannot edit another shop''s item'
);
select throws_ok(
  $$ select public.set_item_archived('7e570000-0000-4000-8000-0000000001b0', true) $$,
  '42501', null, 'owner cannot archive another shop''s item'
);
select throws_ok(
  $$ select public.update_category('7e570000-0000-4000-8000-0000000000cb', 'Renamed by intruder') $$,
  '42501', null, 'owner cannot rename another shop''s category'
);
select throws_ok(
  $$ select public.delete_category('7e570000-0000-4000-8000-0000000000cb') $$,
  '42501', null, 'owner cannot delete another shop''s category'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000f003', '7e570000-0000-4000-8000-0000000001b0',
       'stock_out', 'sale', 1
     ) $$,
  '42501', null, 'owner cannot record stock on another shop''s item'
);
select is_empty(
  $$ update public.shop_settings set default_reorder_level = 9
     where shop_id = '7e570000-0000-4000-8000-00000000000b' returning shop_id $$,
  'owner cannot change another shop''s settings'
);
select throws_ok(
  $$ select public.update_staff_profile('7e570000-0000-4000-8000-0000000000b2', 'Renamed by intruder', false) $$,
  '42501', null, 'owner cannot edit another shop''s employee'
);

-- Employee B reads only shop B.
select tests.act_as('7e570000-0000-4000-8000-0000000000b2');

select is_empty(
  $$ select id from public.inventory_items where shop_id <> '7e570000-0000-4000-8000-00000000000b' $$,
  'employee sees no other shop''s items'
);

-- An item can never point at another shop's category.
reset role;

select throws_ok(
  $$ insert into public.inventory_items (shop_id, category_id, sku, name, reorder_level)
     values ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-0000000000cb',
             'CROSS-1', 'Cross-shop item', 1) $$,
  '23503', null, 'composite key refuses a category from another shop'
);

-- The superadmin sees every shop.
select tests.act_as('7e570000-0000-4000-8000-000000000001');

select is(
  (select count(*) from public.shops
   where id in ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-00000000000b')),
  2::bigint, 'superadmin sees both shops'
);
select is(
  (select count(*) from public.inventory_items
   where id in ('7e570000-0000-4000-8000-0000000001a0', '7e570000-0000-4000-8000-0000000001b0')),
  2::bigint, 'superadmin sees both shops'' items'
);
select is(
  (select count(*) from public.stock_movements
   where shop_id in ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-00000000000b')),
  2::bigint, 'superadmin sees both shops'' ledgers'
);

-- A suspended shop locks out its owner and employees.
reset role;
update public.shops set is_active = false where id = '7e570000-0000-4000-8000-00000000000a';

select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select is_empty(
  $$ select id from public.inventory_items $$,
  'owner of a suspended shop sees no items'
);
select is(
  (select is_active from public.shops where id = '7e570000-0000-4000-8000-00000000000a'),
  false, 'owner of a suspended shop can still read why they are locked out'
);

select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000f004', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'sale', 1
     ) $$,
  '42501', null, 'employee of a suspended shop cannot sell'
);

-- A deactivated user is locked out of an active shop.
reset role;
update public.shops set is_active = true where id = '7e570000-0000-4000-8000-00000000000a';
update public.profiles set is_active = false where id = '7e570000-0000-4000-8000-0000000000a1';

select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select is_empty(
  $$ select id from public.categories $$,
  'deactivated owner sees no categories'
);
select throws_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000f005', null, 'Locked out') $$,
  '42501', null, 'deactivated owner cannot write'
);

-- A signed-out visitor gets nothing.
select tests.act_as(null);

select is_empty(
  $$ select id from public.inventory_items $$,
  'anon sees no items'
);
select throws_ok(
  $$ select id from public.inventory_item_status $$,
  '42501', null, 'anon cannot read the status view'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000f006', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'sale', 1
     ) $$,
  '42501', null, 'anon cannot record stock'
);

reset role;

select * from finish();

rollback;
