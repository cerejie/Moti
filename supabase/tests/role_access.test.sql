-- Role access inside one shop: an employee browses and sells only, an owner manages
-- their shop and its employees, the superadmin names a shop for every write, and
-- nobody writes to a table directly. Self-contained: builds its own fixture and rolls back.
--
-- Fixture ids (prefix 7e570000-0000-4000-8000-):
--   shop A ...00000000000a  owners ...a1 ...a3  employee ...a2  category ...ca  item ...1a0
--   superadmin ...000000000001
begin;

create extension if not exists pgtap with schema extensions;

select plan(33);

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
  ('7e570000-0000-4000-8000-000000000001', 'superadmin@roles.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a1', 'owner.a@roles.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a2', 'employee.a@roles.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a3', 'owner.a2@roles.moti.invalid');

insert into public.shops (id, name) values
  ('7e570000-0000-4000-8000-00000000000a', 'Test Shop A');

insert into public.profiles (id, shop_id, role, full_name) values
  ('7e570000-0000-4000-8000-000000000001', null, 'superadmin', 'Test Superadmin'),
  ('7e570000-0000-4000-8000-0000000000a1', '7e570000-0000-4000-8000-00000000000a', 'owner', 'Owner A'),
  ('7e570000-0000-4000-8000-0000000000a2', '7e570000-0000-4000-8000-00000000000a', 'employee', 'Employee A'),
  ('7e570000-0000-4000-8000-0000000000a3', '7e570000-0000-4000-8000-00000000000a', 'owner', 'Second Owner A');

insert into public.categories (id, shop_id, name) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-00000000000a', 'Test Category');

insert into public.inventory_items (id, shop_id, category_id, sku, name, on_hand, reorder_level) values
  ('7e570000-0000-4000-8000-0000000001a0', '7e570000-0000-4000-8000-00000000000a',
   '7e570000-0000-4000-8000-0000000000ca', 'TEST-A', 'Test item A', 10, 2);

insert into public.stock_movements (shop_id, item_id, movement_type, reason, quantity, balance_after, client_id) values
  ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-0000000001a0',
   'stock_in', 'opening_balance', 10, 10, '7e570000-0000-4000-8000-0000000001a0');

-- Employee: browse and sell, nothing else.
select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select isnt_empty(
  $$ select id from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a0' $$,
  'employee browses items'
);
select isnt_empty(
  $$ select id from public.categories where shop_id = '7e570000-0000-4000-8000-00000000000a' $$,
  'employee browses categories'
);
select is_empty(
  $$ select id from public.stock_movements $$,
  'employee cannot read the ledger'
);
select is_empty(
  $$ select id from public.stock_movement_history $$,
  'employee cannot read movement history'
);
select is_empty(
  $$ select id from public.profiles where id <> '7e570000-0000-4000-8000-0000000000a2' $$,
  'employee reads only their own profile'
);
select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c001', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'sale', 1
     ) $$,
  'employee records a sale'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c002', '7e570000-0000-4000-8000-0000000001a0',
       'stock_in', 'restock', 1
     ) $$,
  '42501', null, 'employee cannot add stock'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c003', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'damaged', 1
     ) $$,
  '42501', null, 'employee cannot deduct damaged stock'
);
select throws_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c004', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'correction', 1
     ) $$,
  '42501', null, 'employee cannot deduct a correction'
);
select throws_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-00000000f001', null, null,
       'EMP-1', 'Employee item', null, null, null, null, null, null, null, 0
     ) $$,
  '42501', null, 'employee cannot create items'
);
select throws_ok(
  $$ select public.update_item(
       '7e570000-0000-4000-8000-0000000001a0', null, 'TEST-A', 'Renamed by employee',
       null, null, null, null, null, null, null
     ) $$,
  '42501', null, 'employee cannot edit items'
);
select throws_ok(
  $$ select public.set_item_archived('7e570000-0000-4000-8000-0000000001a0', true) $$,
  '42501', null, 'employee cannot archive items'
);
select throws_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000f002', null, 'Employee category') $$,
  '42501', null, 'employee cannot create categories'
);
select is_empty(
  $$ update public.shop_settings set default_reorder_level = 9
     where shop_id = '7e570000-0000-4000-8000-00000000000a' returning shop_id $$,
  'employee cannot change shop settings'
);
select throws_ok(
  $$ select public.update_staff_profile('7e570000-0000-4000-8000-0000000000a1', 'Renamed by employee', true) $$,
  '42501', null, 'employee cannot edit other users'
);

-- Owner: manages the shop and its employees, but not themselves or another owner.
select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select lives_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000f003', null, 'Owner category') $$,
  'owner creates a category'
);
select lives_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-00000000f004', null, '7e570000-0000-4000-8000-00000000f003',
       'OWN-1', 'Owner item', null, null, null, null, null, null, null, 5
     ) $$,
  'owner creates an item with opening stock'
);
select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c005', '7e570000-0000-4000-8000-0000000001a0',
       'stock_in', 'restock', 3
     ) $$,
  'owner adds stock'
);
select lives_ok(
  $$ select public.record_stock_movement(
       '7e570000-0000-4000-8000-00000000c006', '7e570000-0000-4000-8000-0000000001a0',
       'stock_out', 'damaged', 1
     ) $$,
  'owner deducts damaged stock'
);
select isnt_empty(
  $$ update public.shop_settings set low_stock_margin_pct = 25
     where shop_id = '7e570000-0000-4000-8000-00000000000a' returning shop_id $$,
  'owner changes their shop''s settings'
);
select is(
  (select count(*) from public.profiles where shop_id = '7e570000-0000-4000-8000-00000000000a'),
  3::bigint, 'owner reads every profile in their shop'
);
select lives_ok(
  $$ select public.update_staff_profile('7e570000-0000-4000-8000-0000000000a2', 'Employee A renamed', true) $$,
  'owner edits their employee'
);
select throws_ok(
  $$ select public.update_staff_profile('7e570000-0000-4000-8000-0000000000a1', 'Owner A', false) $$,
  'P0001', 'You can''t change your own account here.', 'owner cannot edit or deactivate themselves'
);
select throws_ok(
  $$ select public.update_staff_profile('7e570000-0000-4000-8000-0000000000a3', 'Renamed by owner', false) $$,
  '42501', null, 'owner cannot edit another owner'
);

-- Direct table writes are refused: every write is an RPC.
select throws_ok(
  $$ insert into public.inventory_items (shop_id, sku, name, reorder_level)
     values ('7e570000-0000-4000-8000-00000000000a', 'DIRECT-1', 'Direct item', 1) $$,
  '42501', null, 'owner cannot insert items directly'
);
select throws_ok(
  $$ insert into public.stock_movements (shop_id, item_id, movement_type, reason, quantity, balance_after, client_id)
     values ('7e570000-0000-4000-8000-00000000000a', '7e570000-0000-4000-8000-0000000001a0',
             'stock_in', 'restock', 1, 11, '7e570000-0000-4000-8000-00000000c007') $$,
  '42501', null, 'owner cannot insert ledger rows directly'
);
select throws_ok(
  $$ insert into public.shops (name) values ('Owner shop') $$,
  '42501', null, 'owner cannot create shops'
);
select throws_ok(
  $$ insert into public.profiles (id, shop_id, role, full_name)
     values ('7e570000-0000-4000-8000-00000000f005', '7e570000-0000-4000-8000-00000000000a', 'employee', 'Direct') $$,
  '42501', null, 'owner cannot insert profiles directly'
);
select throws_ok(
  $$ update public.profiles set full_name = 'Direct rename'
     where id = '7e570000-0000-4000-8000-0000000000a2' $$,
  '42501', null, 'owner cannot update profiles directly'
);

-- Superadmin: names a shop for every write, creates shops, edits anyone.
select tests.act_as('7e570000-0000-4000-8000-000000000001');

select throws_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000f006', null, 'No shop') $$,
  'P0001', 'Choose a shop first.', 'superadmin must choose a shop before writing'
);
select lives_ok(
  $$ select public.create_category(
       '7e570000-0000-4000-8000-00000000f007', '7e570000-0000-4000-8000-00000000000a', 'Superadmin category'
     ) $$,
  'superadmin writes to the shop they name'
);
select lives_ok(
  $$ insert into public.shops (name) values ('Superadmin shop') $$,
  'superadmin creates shops'
);
select lives_ok(
  $$ select public.update_staff_profile('7e570000-0000-4000-8000-0000000000a1', 'Owner A', true) $$,
  'superadmin edits an owner'
);

reset role;

select * from finish();

rollback;
