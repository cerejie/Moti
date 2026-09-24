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
