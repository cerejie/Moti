-- Phase 1: tenants (shops), per-shop settings, user profiles, role helpers and tenant RLS.
-- Every later table carries shop_id and a policy of the form
--   app.is_superadmin() or (shop_id = app.current_shop_id() and <role rule>)

create schema if not exists app;
grant usage on schema app to authenticated;

create type app.user_role as enum ('superadmin', 'owner', 'employee');

create or replace function app.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- Tables
-- ============================================================================

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  -- false suspends the shop: its owner and employees lose access.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shops_name_idx on public.shops (name);

create trigger shops_touch_updated_at
  before update on public.shops
  for each row execute function app.touch_updated_at();

-- One row per shop, keyed by the shop itself; created by the trigger below.
create table public.shop_settings (
  shop_id uuid primary key references public.shops (id) on delete cascade,
  default_reorder_level integer not null default 5 check (default_reorder_level >= 0),
  low_stock_margin_pct numeric(5, 2) not null default 20
    check (low_stock_margin_pct between 0 and 100),
  timezone text not null default 'Asia/Manila',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger shop_settings_touch_updated_at
  before update on public.shop_settings
  for each row execute function app.touch_updated_at();

-- Security definer: clients have no insert policy on shop_settings.
create or replace function app.create_shop_settings() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.shop_settings (shop_id) values (new.id)
  on conflict (shop_id) do nothing;
  return new;
end;
$$;

create trigger shops_create_settings
  after insert on public.shops
  for each row execute function app.create_shop_settings();

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  shop_id uuid references public.shops (id) on delete restrict,
  role app.user_role not null,
  full_name text not null check (length(btrim(full_name)) between 1 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The superadmin belongs to no shop; everyone else belongs to exactly one.
  constraint profiles_shop_matches_role check ((role = 'superadmin') = (shop_id is null))
);

create index profiles_shop_role_idx on public.profiles (shop_id, role);

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function app.touch_updated_at();

-- ============================================================================
-- Helpers. Security definer so policies on profiles can call them without
-- recursing into their own RLS. Each returns null for an inactive user or a
-- user whose shop is suspended, which denies every tenant policy.
-- ============================================================================

create or replace function app.current_user_role() returns app.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  left join public.shops s on s.id = p.shop_id
  where p.id = auth.uid()
    and p.is_active
    and (p.role = 'superadmin' or s.is_active);
$$;

create or replace function app.is_superadmin() returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(app.current_user_role() = 'superadmin', false);
$$;

create or replace function app.current_shop_id() returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.shop_id
  from public.profiles p
  join public.shops s on s.id = p.shop_id
  where p.id = auth.uid()
    and p.is_active
    and s.is_active;
$$;

-- Ignores the active flags on purpose: a locked-out user may still read their
-- own shop's name and status, so the app can say why they are locked out.
create or replace function app.profile_shop_id() returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.shop_id from public.profiles p where p.id = auth.uid();
$$;

revoke all on function
  app.current_user_role(),
  app.is_superadmin(),
  app.current_shop_id(),
  app.profile_shop_id()
from public;

grant execute on function
  app.current_user_role(),
  app.is_superadmin(),
  app.current_shop_id(),
  app.profile_shop_id()
to authenticated;

-- ============================================================================
-- RLS. Helpers are wrapped in (select ...) so Postgres evaluates them once per
-- statement instead of once per row.
-- ============================================================================

alter table public.shops enable row level security;
alter table public.shop_settings enable row level security;
alter table public.profiles enable row level security;

-- shops: superadmin manages every shop; members read their own.
create policy shops_select on public.shops
  for select to authenticated
  using ((select app.is_superadmin()) or id = (select app.profile_shop_id()));

create policy shops_insert on public.shops
  for insert to authenticated
  with check ((select app.is_superadmin()));

create policy shops_update on public.shops
  for update to authenticated
  using ((select app.is_superadmin()))
  with check ((select app.is_superadmin()));

create policy shops_delete on public.shops
  for delete to authenticated
  using ((select app.is_superadmin()));

-- shop_settings: members read; the owner or superadmin updates. Rows are only
-- ever created by the shops trigger and removed with their shop.
create policy shop_settings_select on public.shop_settings
  for select to authenticated
  using ((select app.is_superadmin()) or shop_id = (select app.current_shop_id()));

create policy shop_settings_update on public.shop_settings
  for update to authenticated
  using (
    (select app.is_superadmin())
    or (shop_id = (select app.current_shop_id()) and (select app.current_user_role()) = 'owner')
  )
  with check (
    (select app.is_superadmin())
    or (shop_id = (select app.current_shop_id()) and (select app.current_user_role()) = 'owner')
  );

-- profiles: everyone reads their own row (even when locked out); an owner reads
-- their shop's staff; only superadmin writes here. Staff accounts are created by
-- an Edge Function in Phase 6.
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    (select app.is_superadmin())
    or id = (select auth.uid())
    or (shop_id = (select app.current_shop_id()) and (select app.current_user_role()) = 'owner')
  );

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check ((select app.is_superadmin()));

create policy profiles_update on public.profiles
  for update to authenticated
  using ((select app.is_superadmin()))
  with check ((select app.is_superadmin()));

create policy profiles_delete on public.profiles
  for delete to authenticated
  using ((select app.is_superadmin()));
