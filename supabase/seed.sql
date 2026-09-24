-- Demo data for local development. `supabase db reset` runs this automatically;
-- on a hosted project, paste it into the SQL editor once. Safe to re-run.
--
-- Every demo login uses the password: Moti-demo-123
--   superadmin@moti.test   superadmin (no shop) — change to your own email
--   owner@moti.test        owner of Demo Motor Parts
--   employee@moti.test     employee of Demo Motor Parts
--   owner.b@moti.test      owner of Other Moto Shop (for the tenant isolation check)

insert into public.shops (id, name) values
  ('11111111-1111-4111-8111-111111111111', 'Demo Motor Parts'),
  ('22222222-2222-4222-8222-222222222222', 'Other Moto Shop')
on conflict (id) do nothing;

-- One statement: the Supabase SQL editor does not keep a temp table between
-- statements. Foreign keys are checked at the end of the statement, so profiles
-- may reference the users inserted above them.
with demo_users (id, email, full_name, role, shop_id) as (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'superadmin@moti.test', 'Moti Superadmin', 'superadmin'::app.user_role, null::uuid),
    ('00000000-0000-4000-8000-000000000002', 'owner@moti.test', 'Demo Owner', 'owner', '11111111-1111-4111-8111-111111111111'),
    ('00000000-0000-4000-8000-000000000003', 'employee@moti.test', 'Demo Employee', 'employee', '11111111-1111-4111-8111-111111111111'),
    ('00000000-0000-4000-8000-000000000004', 'owner.b@moti.test', 'Other Owner', 'owner', '22222222-2222-4222-8222-222222222222')
),
-- The empty-string token columns are required: GoTrue fails on NULL there.
new_users as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  select
    '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
    extensions.crypt('Moti-demo-123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', ''
  from demo_users u
  on conflict (id) do nothing
),
new_identities as (
  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
  )
  select
    gen_random_uuid(), u.id, u.id::text, 'email',
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
    now(), now(), now()
  from demo_users u
  on conflict do nothing
)
insert into public.profiles (id, shop_id, role, full_name)
select u.id, u.shop_id, u.role, u.full_name
from demo_users u
on conflict (id) do nothing;

-- Phase 2: demo catalog. Demo Motor Parts gets a mix of every stock status
-- (default reorder level 5, 20% low margin); Other Moto Shop gets two items for
-- the tenant isolation check.
insert into public.categories (id, shop_id, name) values
  ('c0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Engine'),
  ('c0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Brakes'),
  ('c0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Electrical'),
  ('c0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Tires & Wheels'),
  ('c0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'Oils & Fluids'),
  ('c0000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'Drivetrain'),
  ('c0000000-0000-4000-8000-000000000007', '22222222-2222-4222-8222-222222222222', 'Engine')
on conflict (id) do nothing;

-- One statement, like the users above. on_hand is written directly here only
-- because the seed has no signed-in user; the app changes it through movements.
with demo_items (id, shop_id, category_id, sku, name, brand, part_number, fitment, unit, on_hand, reorder_level, selling_price, location, archived) as (
  values
    ('a0000000-0000-4000-8000-000000000001'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'c0000000-0000-4000-8000-000000000005'::uuid, 'OIL-10W40-1L', 'Engine oil 10W-40 1L', 'Motul', '3000 4T', 'All 4-stroke motorcycles', 'bottle', 24, 6, 420.00::numeric, 'Shelf A1', false),
    ('a0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000003', 'SPK-CPR8EA9', 'Spark plug CPR8EA-9', 'NGK', 'CPR8EA-9', 'Honda Click 125i, Beat', 'pc', 7, 6, 180.00, 'Drawer B2', false),
    ('a0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000002', 'BRK-PAD-CLK', 'Front brake pad set', 'Bendix', 'MD27', 'Honda Click 125i / 150i', 'set', 4, 5, 350.00, 'Drawer C1', false),
    ('a0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000006', 'CHN-428H-120', 'Drive chain 428H 120L', 'DID', '428H-120', 'Most 125-155cc underbones', 'pc', 0, 3, 890.00, 'Rack D', false),
    ('a0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000004', 'TIR-80-90-14', 'Tire 80/90-14 tubeless', 'IRC', 'NR73', 'Click, Beat, Mio (front)', 'pc', 10, 4, 1250.00, 'Tire rack', false),
    ('a0000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000003', 'BAT-YTZ5S', 'Battery YTZ5S', 'Motolite', 'YTZ5S', 'Mio, Beat, Click', 'pc', 4, 3, 1100.00, 'Shelf E1', false),
    ('a0000000-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000001', 'AIR-FLT-MIO', 'Air filter element', 'Yamaha Genuine', '2PH-E4450-00', 'Yamaha Mio i 125', 'pc', 12, 5, 260.00, 'Shelf A3', false),
    ('a0000000-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000006', 'CVT-BELT-CLK', 'CVT drive belt', 'Bando', '23100-K35-V01', 'Honda Click 125i / 150i', 'pc', 2, 3, 780.00, 'Rack D', false),
    ('a0000000-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000003', 'BLB-H4-12V', 'Headlight bulb H4 12V 35/35W', 'Osram', '64193', 'Universal H4 socket', 'pc', 30, 10, 150.00, 'Drawer B1', false),
    ('a0000000-0000-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000005', 'BRK-FLD-DOT4', 'Brake fluid DOT 4 250ml', 'Prestone', null, 'Universal', 'bottle', 0, 4, 190.00, 'Shelf A2', false),
    ('a0000000-0000-4000-8000-000000000011', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000005', 'GR-OIL-120', 'Scooter gear oil 120ml', 'Yamalube', null, 'Automatic scooters', 'bottle', 15, 6, 95.00, 'Shelf A2', false),
    ('a0000000-0000-4000-8000-000000000012', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000002', 'BRK-SHOE-RR', 'Rear brake shoe set', 'Honda Genuine', '06430-GFM-900', 'Beat, Click (rear drum)', 'set', 6, 5, 320.00, 'Drawer C2', false),
    ('a0000000-0000-4000-8000-000000000013', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000006', 'SPR-OLD-14T', 'Front sprocket 14T (old stock)', null, null, 'Discontinued models', 'pc', 3, 0, null, 'Back room', true),
    ('a0000000-0000-4000-8000-000000000014', '22222222-2222-4222-8222-222222222222', 'c0000000-0000-4000-8000-000000000007', 'OIL-20W50-1L', 'Engine oil 20W-50 1L', 'Shell Advance', 'AX5', 'All 4-stroke motorcycles', 'bottle', 10, 5, 300.00, null, false),
    ('a0000000-0000-4000-8000-000000000015', '22222222-2222-4222-8222-222222222222', 'c0000000-0000-4000-8000-000000000007', 'SPK-C7HSA', 'Spark plug C7HSA', 'NGK', 'C7HSA', 'Honda XRM, Wave', 'pc', 3, 5, 120.00, null, false)
),
new_items as (
  insert into public.inventory_items (
    id, shop_id, category_id, sku, name, brand, part_number, fitment, unit,
    on_hand, reorder_level, selling_price, location, archived_at
  )
  select
    d.id, d.shop_id, d.category_id, d.sku, d.name, d.brand, d.part_number, d.fitment, d.unit,
    d.on_hand, d.reorder_level, d.selling_price, d.location,
    case when d.archived then now() end
  from demo_items d
  on conflict (id) do nothing
  returning id
)
-- The opening balance keeps on_hand equal to the ledger total. Its client_id is
-- the item id, the same key create_item uses.
insert into public.stock_movements (
  shop_id, item_id, movement_type, reason, quantity, balance_after, client_id
)
select d.shop_id, d.id, 'stock_in', 'opening_balance', d.on_hand, d.on_hand, d.id
from demo_items d
join new_items n on n.id = d.id
where d.on_hand > 0
on conflict (client_id) do nothing;
