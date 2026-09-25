-- Demo data for local development. `supabase db reset` runs this automatically;
-- on a hosted project, paste it into the SQL editor once. Safe to re-run.
-- Users and profiles are not seeded: create them in Supabase Auth and link each
-- to a shop in public.profiles yourself.

insert into public.shops (id, name) values
  ('11111111-1111-4111-8111-111111111111', 'Demo Motor Parts'),
  ('22222222-2222-4222-8222-222222222222', 'Other Moto Shop')
on conflict (id) do nothing;

-- Phase 2 + 9: demo catalog. Demo Motor Parts gets a mix of every stock status
-- (default reorder level 5, 20% low margin); Other Moto Shop gets two items for
-- the tenant isolation check. Codes follow CATEGORY-BRAND-NNN, numbered per
-- category, so next_number is one past each category's last item.
insert into public.categories (id, shop_id, name, code, next_number) values
  ('c0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Engine', 'ENG', 2),
  ('c0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Brakes', 'BRK', 3),
  ('c0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Electrical', 'ELC', 4),
  ('c0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Tires & Wheels', 'TIR', 2),
  ('c0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'Oils & Fluids', 'OIL', 4),
  ('c0000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'Drivetrain', 'DRV', 3),
  ('c0000000-0000-4000-8000-000000000007', '22222222-2222-4222-8222-222222222222', 'Engine', 'ENG', 3)
on conflict (id) do nothing;

insert into public.brands (id, shop_id, name, code) values
  ('b0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Motul', 'MTL'),
  ('b0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'NGK', 'NGK'),
  ('b0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Bendix', 'BDX'),
  ('b0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'DID', 'DID'),
  ('b0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'IRC', 'IRC'),
  ('b0000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'Motolite', 'MTE'),
  ('b0000000-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'Yamaha Genuine', 'YMG'),
  ('b0000000-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', 'Bando', 'BND'),
  ('b0000000-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 'Osram', 'OSR'),
  ('b0000000-0000-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', 'Prestone', 'PRS'),
  ('b0000000-0000-4000-8000-000000000011', '11111111-1111-4111-8111-111111111111', 'Yamalube', 'YML'),
  ('b0000000-0000-4000-8000-000000000012', '11111111-1111-4111-8111-111111111111', 'Honda Genuine', 'HNG'),
  ('b0000000-0000-4000-8000-000000000013', '11111111-1111-4111-8111-111111111111', 'Generic', 'GEN'),
  ('b0000000-0000-4000-8000-000000000014', '22222222-2222-4222-8222-222222222222', 'Shell Advance', 'SHL'),
  ('b0000000-0000-4000-8000-000000000015', '22222222-2222-4222-8222-222222222222', 'NGK', 'NGK')
on conflict (id) do nothing;

-- Which brands each category sells: the ones its demo items use, plus Generic brakes.
insert into public.category_brands (category_id, brand_id, shop_id)
select category_id::uuid, brand_id::uuid, shop_id::uuid
from (values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000012', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000013', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000011', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111'),
  ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000014', '22222222-2222-4222-8222-222222222222'),
  ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000015', '22222222-2222-4222-8222-222222222222')
) as pairs (category_id, brand_id, shop_id)
on conflict do nothing;

-- Each shop already has "pc" from the shop trigger.
insert into public.units (shop_id, name) values
  ('11111111-1111-4111-8111-111111111111', 'bottle'),
  ('11111111-1111-4111-8111-111111111111', 'set'),
  ('22222222-2222-4222-8222-222222222222', 'bottle')
on conflict do nothing;

insert into public.storage_locations (shop_id, name)
select '11111111-1111-4111-8111-111111111111'::uuid, name
from (values
  ('Shelf A1'), ('Shelf A2'), ('Shelf A3'), ('Shelf E1'), ('Drawer B1'), ('Drawer B2'),
  ('Drawer C1'), ('Drawer C2'), ('Rack D'), ('Tire rack'), ('Back room')
) as locations (name)
on conflict do nothing;

-- One statement, like the users above. on_hand is written directly here only
-- because the seed has no signed-in user; the app changes it through movements.
-- Brand, unit and location are matched by name. Item 13 is an older item that
-- keeps its pre-Phase 9 code and has no brand.
with demo_items (id, shop_id, category_id, item_code, name, brand, part_number, fitment, unit, on_hand, reorder_level, selling_price, location, archived) as (
  values
    ('a0000000-0000-4000-8000-000000000001'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'c0000000-0000-4000-8000-000000000005'::uuid, 'OIL-MTL-001', 'Engine oil 10W-40 1L', 'Motul', '3000 4T', 'All 4-stroke motorcycles', 'bottle', 24, 6, 420.00::numeric, 'Shelf A1', false),
    ('a0000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000003', 'ELC-NGK-001', 'Spark plug CPR8EA-9', 'NGK', 'CPR8EA-9', 'Honda Click 125i, Beat', 'pc', 7, 6, 180.00, 'Drawer B2', false),
    ('a0000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000002', 'BRK-BDX-001', 'Front brake pad set', 'Bendix', 'MD27', 'Honda Click 125i / 150i', 'set', 4, 5, 350.00, 'Drawer C1', false),
    ('a0000000-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000006', 'DRV-DID-001', 'Drive chain 428H 120L', 'DID', '428H-120', 'Most 125-155cc underbones', 'pc', 0, 3, 890.00, 'Rack D', false),
    ('a0000000-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000004', 'TIR-IRC-001', 'Tire 80/90-14 tubeless', 'IRC', 'NR73', 'Click, Beat, Mio (front)', 'pc', 10, 4, 1250.00, 'Tire rack', false),
    ('a0000000-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000003', 'ELC-MTE-002', 'Battery YTZ5S', 'Motolite', 'YTZ5S', 'Mio, Beat, Click', 'pc', 4, 3, 1100.00, 'Shelf E1', false),
    ('a0000000-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000001', 'ENG-YMG-001', 'Air filter element', 'Yamaha Genuine', '2PH-E4450-00', 'Yamaha Mio i 125', 'pc', 12, 5, 260.00, 'Shelf A3', false),
    ('a0000000-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000006', 'DRV-BND-002', 'CVT drive belt', 'Bando', '23100-K35-V01', 'Honda Click 125i / 150i', 'pc', 2, 3, 780.00, 'Rack D', false),
    ('a0000000-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000003', 'ELC-OSR-003', 'Headlight bulb H4 12V 35/35W', 'Osram', '64193', 'Universal H4 socket', 'pc', 30, 10, 150.00, 'Drawer B1', false),
    ('a0000000-0000-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000005', 'OIL-PRS-002', 'Brake fluid DOT 4 250ml', 'Prestone', null, 'Universal', 'bottle', 0, 4, 190.00, 'Shelf A2', false),
    ('a0000000-0000-4000-8000-000000000011', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000005', 'OIL-YML-003', 'Scooter gear oil 120ml', 'Yamalube', null, 'Automatic scooters', 'bottle', 15, 6, 95.00, 'Shelf A2', false),
    ('a0000000-0000-4000-8000-000000000012', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000002', 'BRK-HNG-002', 'Rear brake shoe set', 'Honda Genuine', '06430-GFM-900', 'Beat, Click (rear drum)', 'set', 6, 5, 320.00, 'Drawer C2', false),
    ('a0000000-0000-4000-8000-000000000013', '11111111-1111-4111-8111-111111111111', 'c0000000-0000-4000-8000-000000000006', 'SPR-OLD-14T', 'Front sprocket 14T (old stock)', null, null, 'Discontinued models', 'pc', 3, 0, null, 'Back room', true),
    ('a0000000-0000-4000-8000-000000000014', '22222222-2222-4222-8222-222222222222', 'c0000000-0000-4000-8000-000000000007', 'ENG-SHL-001', 'Engine oil 20W-50 1L', 'Shell Advance', 'AX5', 'All 4-stroke motorcycles', 'bottle', 10, 5, 300.00, null, false),
    ('a0000000-0000-4000-8000-000000000015', '22222222-2222-4222-8222-222222222222', 'c0000000-0000-4000-8000-000000000007', 'ENG-NGK-002', 'Spark plug C7HSA', 'NGK', 'C7HSA', 'Honda XRM, Wave', 'pc', 3, 5, 120.00, null, false)
),
new_items as (
  insert into public.inventory_items (
    id, shop_id, category_id, brand_id, item_code, name, part_number, fitment, unit_id,
    on_hand, reorder_level, selling_price, location_id, archived_at
  )
  select
    d.id, d.shop_id, d.category_id, b.id, d.item_code, d.name, d.part_number, d.fitment, u.id,
    d.on_hand, d.reorder_level, d.selling_price, l.id,
    case when d.archived then now() end
  from demo_items d
  join public.units u on u.shop_id = d.shop_id and u.name = d.unit
  left join public.brands b on b.shop_id = d.shop_id and b.name = d.brand
  left join public.storage_locations l on l.shop_id = d.shop_id and l.name = d.location
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

-- Phase 5: a sales scenario for the Smart Analyzer, recorded through the same
-- function the app uses so on_hand and balance_after stay consistent. Every item
-- nets to zero, so the Phase 2 stock statuses and the dashboard do not change.
-- Restocks are 35 days back (outside this month and the 30-day window), sales are
-- on last week's Monday and today. On a fresh `supabase db reset`, Demo Motor Parts
-- shows (metric Sold):
--
--   This week: 31 units, 7 items sold, top Engine oil 10W-40 1L (7), 3 stocked unsold
--     1 Engine oil 10W-40 1L 7 (2 sales) · 2 Headlight bulb 6 · 3 Scooter gear oil 5 ·
--     4 Front brake pad set 4 · 4 Spark plug 4 · 6 CVT drive belt 3 · 7 Battery 2
--   Last week: 20 units, 6 items sold, top Engine oil 10W-40 1L (5), 6 stocked unsold
--     1 Engine oil 5 · 2 Brake fluid 4 · 2 Headlight bulb 4 · 4 Drive chain 3 ·
--     5 Spark plug 2 · 5 Tire 2
--   This month: this week, plus last week when its Monday falls in this month.
--   Needs reorder (sold in 30 days): Brake fluid 4, Drive chain 3 (Out) ·
--     Front brake pad set 4, CVT drive belt 3 (Reorder) ·
--     Spark plug 6, Battery 2, Rear brake shoe set 0 (Low)
do $$
declare
  v_timezone constant text := 'Asia/Manila';
  v_restock timestamptz := now() - interval '35 days';
  v_last_week timestamptz :=
    (date_trunc('week', now() at time zone v_timezone) - interval '7 days' + interval '10 hours')
      at time zone v_timezone;
  v_row record;
begin
  for v_row in
    select *
    from (values
      (1, 'a0000000-0000-4000-8000-000000000001'::uuid, 'stock_in', 'restock', 12, 'restock'),
      (2, 'a0000000-0000-4000-8000-000000000002', 'stock_in', 'restock', 6, 'restock'),
      (3, 'a0000000-0000-4000-8000-000000000003', 'stock_in', 'restock', 4, 'restock'),
      (4, 'a0000000-0000-4000-8000-000000000004', 'stock_in', 'restock', 3, 'restock'),
      (5, 'a0000000-0000-4000-8000-000000000005', 'stock_in', 'restock', 2, 'restock'),
      (6, 'a0000000-0000-4000-8000-000000000006', 'stock_in', 'restock', 2, 'restock'),
      (7, 'a0000000-0000-4000-8000-000000000008', 'stock_in', 'restock', 3, 'restock'),
      (8, 'a0000000-0000-4000-8000-000000000009', 'stock_in', 'restock', 10, 'restock'),
      (9, 'a0000000-0000-4000-8000-000000000010', 'stock_in', 'restock', 4, 'restock'),
      (10, 'a0000000-0000-4000-8000-000000000011', 'stock_in', 'restock', 5, 'restock'),
      (11, 'a0000000-0000-4000-8000-000000000001', 'stock_out', 'sale', 5, 'last_week'),
      (12, 'a0000000-0000-4000-8000-000000000002', 'stock_out', 'sale', 2, 'last_week'),
      (13, 'a0000000-0000-4000-8000-000000000004', 'stock_out', 'sale', 3, 'last_week'),
      (14, 'a0000000-0000-4000-8000-000000000005', 'stock_out', 'sale', 2, 'last_week'),
      (15, 'a0000000-0000-4000-8000-000000000009', 'stock_out', 'sale', 4, 'last_week'),
      (16, 'a0000000-0000-4000-8000-000000000010', 'stock_out', 'sale', 4, 'last_week'),
      (17, 'a0000000-0000-4000-8000-000000000001', 'stock_out', 'sale', 3, 'today'),
      (18, 'a0000000-0000-4000-8000-000000000001', 'stock_out', 'sale', 4, 'today'),
      (19, 'a0000000-0000-4000-8000-000000000002', 'stock_out', 'sale', 4, 'today'),
      (20, 'a0000000-0000-4000-8000-000000000003', 'stock_out', 'sale', 4, 'today'),
      (21, 'a0000000-0000-4000-8000-000000000006', 'stock_out', 'sale', 2, 'today'),
      (22, 'a0000000-0000-4000-8000-000000000008', 'stock_out', 'sale', 3, 'today'),
      (23, 'a0000000-0000-4000-8000-000000000009', 'stock_out', 'sale', 6, 'today'),
      (24, 'a0000000-0000-4000-8000-000000000011', 'stock_out', 'sale', 5, 'today')
    ) as scenario (seq, item_id, movement_type, reason, quantity, occurred)
    order by seq
  loop
    -- A fixed client_id per row, so a re-run replays instead of applying twice.
    perform app.apply_stock_movement(
      v_row.item_id,
      v_row.movement_type::app.movement_type,
      v_row.reason::app.movement_reason,
      v_row.quantity,
      null,
      case v_row.occurred
        when 'restock' then v_restock
        when 'last_week' then v_last_week
        else now()
      end,
      ('b5000000-0000-4000-8000-' || lpad(v_row.seq::text, 12, '0'))::uuid
    );
  end loop;
end;
$$;
