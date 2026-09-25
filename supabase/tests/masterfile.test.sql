-- Masterfile and item codes: codes come from the category and brand with one
-- count per category, a brand must be one the category carries, an entry in use
-- can't be deleted, only owners write, and no shop reaches another's lists.
-- Self-contained: builds its own fixture and rolls back.
--
-- Fixture ids (prefix 7e570000-0000-4000-8000-):
--   shops A ...00000000000a  B ...00000000000b  C ...00000000000c
--   owner A ...a1  employee A ...a2  owner B ...b1
--   category A ...ca (BRK)  brands A ...b0a1 (UMI, carried) ...b0a2 (NGK) ...b0a3 (GEN)
--   items ...1a1 to ...1a6 (created in the test)
begin;

create extension if not exists pgtap with schema extensions;

select plan(38);

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
  ('7e570000-0000-4000-8000-0000000000a1', 'owner.a@masterfile.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000a2', 'employee.a@masterfile.moti.invalid'),
  ('7e570000-0000-4000-8000-0000000000b1', 'owner.b@masterfile.moti.invalid');

insert into public.shops (id, name) values
  ('7e570000-0000-4000-8000-00000000000a', 'Test Shop A'),
  ('7e570000-0000-4000-8000-00000000000b', 'Test Shop B');

insert into public.profiles (id, shop_id, role, full_name) values
  ('7e570000-0000-4000-8000-0000000000a1', '7e570000-0000-4000-8000-00000000000a', 'owner', 'Owner A'),
  ('7e570000-0000-4000-8000-0000000000a2', '7e570000-0000-4000-8000-00000000000a', 'employee', 'Employee A'),
  ('7e570000-0000-4000-8000-0000000000b1', '7e570000-0000-4000-8000-00000000000b', 'owner', 'Owner B');

insert into public.categories (id, shop_id, name, code) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-00000000000a', 'Brakes', 'BRK');

insert into public.brands (id, shop_id, name, code) values
  ('7e570000-0000-4000-8000-00000000b0a1', '7e570000-0000-4000-8000-00000000000a', 'Umma Iridium', 'UMI'),
  ('7e570000-0000-4000-8000-00000000b0a2', '7e570000-0000-4000-8000-00000000000a', 'NGK', 'NGK'),
  ('7e570000-0000-4000-8000-00000000b0a3', '7e570000-0000-4000-8000-00000000000a', 'Generic', 'GEN');

insert into public.category_brands (category_id, brand_id, shop_id) values
  ('7e570000-0000-4000-8000-0000000000ca', '7e570000-0000-4000-8000-00000000b0a1', '7e570000-0000-4000-8000-00000000000a');

-- Item codes.
select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select lives_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a1', null, '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a1', 'Brake pad', null, null, null, null, null, null, 0
     ) $$,
  'owner creates an item with a category and a brand it carries'
);
select is(
  (select item_code from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a1'),
  'BRK-UMI-001', 'the code is category code, brand code and a 3-digit number'
);
select is(
  (select u.name from public.inventory_items i join public.units u on u.id = i.unit_id
   where i.id = '7e570000-0000-4000-8000-0000000001a1'),
  'pc', 'a blank unit falls back to the shop''s pc unit'
);
select lives_ok(
  $$ select public.update_category(
       '7e570000-0000-4000-8000-0000000000ca', 'Brakes', 'BRK',
       array['7e570000-0000-4000-8000-00000000b0a1', '7e570000-0000-4000-8000-00000000b0a2']::uuid[]
     ) $$,
  'owner adds a brand to a category'
);
select lives_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a2', null, '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a2', 'Spark plug', null, null, null, null, null, null, 0
     ) $$,
  'owner creates an item with the second brand'
);
select is(
  (select item_code from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a2'),
  'BRK-NGK-002', 'every brand in a category shares one count'
);
select lives_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a2', null, '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a2', 'Spark plug', null, null, null, null, null, null, 0
     ) $$,
  'a replayed create is accepted'
);
select is(
  (select next_number from public.categories where id = '7e570000-0000-4000-8000-0000000000ca'),
  3, 'a replay draws no number'
);
select throws_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a3', null, null,
       '7e570000-0000-4000-8000-00000000b0a1', 'No category', null, null, null, null, null, null, 0
     ) $$,
  'P0001', 'Choose a category.', 'a new item needs a category'
);
select throws_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a3', null, '7e570000-0000-4000-8000-0000000000ca',
       null, 'No brand', null, null, null, null, null, null, 0
     ) $$,
  'P0001', 'Choose a brand this category carries.', 'a new item needs a brand'
);
select throws_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a3', null, '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a3', 'Wrong brand', null, null, null, null, null, null, 0
     ) $$,
  'P0001', 'Choose a brand this category carries.', 'the brand must be one the category carries'
);
select lives_ok(
  $$ select public.update_item(
       '7e570000-0000-4000-8000-0000000001a1', '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a1', 'Brake pad renamed', null, null, null, null, null, null
     ) $$,
  'owner edits an item without moving it'
);
select is(
  (select item_code from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a1'),
  'BRK-UMI-001', 'an edit that keeps category and brand keeps the code'
);
select lives_ok(
  $$ select public.update_item(
       '7e570000-0000-4000-8000-0000000001a1', '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a2', 'Brake pad renamed', null, null, null, null, null, null
     ) $$,
  'owner changes an item''s brand'
);
select is(
  (select item_code from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a1'),
  'BRK-NGK-003', 'a new brand gives the item a new code'
);

-- A code an older item already holds is skipped, and the number widens past 999.
reset role;
insert into public.inventory_items (id, shop_id, item_code, name, unit_id, reorder_level) values
  ('7e570000-0000-4000-8000-0000000001a4', '7e570000-0000-4000-8000-00000000000a', 'BRK-UMI-004', 'Older item',
   (select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000a' and name = 'pc'), 1);
select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select lives_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a5', null, '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a1', 'After a taken code', null, null, null, null, null, null, 0
     ) $$,
  'owner creates an item after a taken code'
);
select is(
  (select item_code from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a5'),
  'BRK-UMI-005', 'a taken code is skipped'
);

reset role;
update public.categories set next_number = 1000 where id = '7e570000-0000-4000-8000-0000000000ca';
select tests.act_as('7e570000-0000-4000-8000-0000000000a1');

select lives_ok(
  $$ select public.create_item(
       '7e570000-0000-4000-8000-0000000001a6', null, '7e570000-0000-4000-8000-0000000000ca',
       '7e570000-0000-4000-8000-00000000b0a1', 'Item one thousand', null, null, null, null, null, null, 0
     ) $$,
  'owner creates the thousandth item'
);
select is(
  (select item_code from public.inventory_items where id = '7e570000-0000-4000-8000-0000000001a6'),
  'BRK-UMI-1000', 'the number widens past 999 instead of wrapping'
);
select has_index(
  'public', 'inventory_items', 'inventory_items_shop_item_code_key',
  'item codes are unique per shop, the backstop for concurrent saves'
);

-- Masterfile rules.
select throws_ok(
  $$ select public.update_category(
       '7e570000-0000-4000-8000-0000000000ca', 'Brakes', 'BRK',
       array['7e570000-0000-4000-8000-00000000b0a1']::uuid[]
     ) $$,
  'P0001', 'Some items in this category still use that brand. Change those items first.',
  'a brand its items use can''t be taken off a category'
);
select throws_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000c0a1', null, 'Bad code', 'B') $$,
  'P0001', 'Use 2 to 6 letters or digits for the code.', 'a category code needs 2 to 6 letters or digits'
);
select throws_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000c0a1', null, 'Other brakes', 'brk') $$,
  'P0001', 'Another category already uses the code "BRK".', 'category codes are unique per shop'
);
select lives_ok(
  $$ select public.create_category('7e570000-0000-4000-8000-00000000c0a2', null, 'Electrical') $$,
  'a category without a code gets one'
);
select is(
  (select code from public.categories where id = '7e570000-0000-4000-8000-00000000c0a2'),
  'ELE', 'the code is made from the name'
);
select lives_ok(
  $$ select public.create_unit('7e570000-0000-4000-8000-00000000d0a1', null, 'box') $$,
  'owner adds a unit'
);
select lives_ok(
  $$ select public.create_storage_location('7e570000-0000-4000-8000-00000000e0a1', null, 'Shelf A') $$,
  'owner adds a location'
);
select lives_ok(
  $$ select public.delete_storage_location('7e570000-0000-4000-8000-00000000e0a1') $$,
  'owner deletes an unused location'
);
select throws_ok(
  $$ select public.delete_unit(
       (select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000a' and name = 'pc')
     ) $$,
  '23503', null, 'a unit in use can''t be deleted'
);
select throws_ok(
  $$ select public.delete_brand('7e570000-0000-4000-8000-00000000b0a1') $$,
  '23503', null, 'a brand in use can''t be deleted'
);

-- Employee: reads the masterfile, writes nothing.
select tests.act_as('7e570000-0000-4000-8000-0000000000a2');

select isnt_empty(
  $$ select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000a' $$,
  'employee reads units'
);
select throws_ok(
  $$ select public.create_brand('7e570000-0000-4000-8000-00000000b0a9', null, 'Employee brand', 'EMP') $$,
  '42501', null, 'employee cannot create brands'
);
select throws_ok(
  $$ select public.create_unit('7e570000-0000-4000-8000-00000000d0a9', null, 'Employee unit') $$,
  '42501', null, 'employee cannot create units'
);

-- Owner B: sees and writes nothing of shop A's masterfile.
select tests.act_as('7e570000-0000-4000-8000-0000000000b1');

select is_empty(
  $$ select id from public.brands where shop_id = '7e570000-0000-4000-8000-00000000000a'
     union all select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000a'
     union all select id from public.storage_locations where shop_id = '7e570000-0000-4000-8000-00000000000a'
     union all select category_id from public.category_brands where shop_id = '7e570000-0000-4000-8000-00000000000a' $$,
  'owner sees no other shop''s brands, units, locations or category brands'
);
select throws_ok(
  $$ select public.create_brand(
       '7e570000-0000-4000-8000-00000000b0b1', '7e570000-0000-4000-8000-00000000000a', 'Intruder', 'INT'
     ) $$,
  '42501', null, 'owner cannot create a brand in another shop'
);
select throws_ok(
  $$ select public.update_unit('7e570000-0000-4000-8000-00000000d0a1', 'Renamed by intruder') $$,
  '42501', null, 'owner cannot rename another shop''s unit'
);
select throws_ok(
  $$ select public.delete_brand('7e570000-0000-4000-8000-00000000b0a3') $$,
  '42501', null, 'owner cannot delete another shop''s brand'
);

-- Every new shop starts with a pc unit.
reset role;
insert into public.shops (id, name) values ('7e570000-0000-4000-8000-00000000000c', 'Test Shop C');

select isnt_empty(
  $$ select id from public.units where shop_id = '7e570000-0000-4000-8000-00000000000c' and name = 'pc' $$,
  'a new shop gets a pc unit'
);

select * from finish();

rollback;
