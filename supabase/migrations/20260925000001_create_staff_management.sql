-- Phase 6: shops, users and settings. Accounts are created and passwords reset
-- by the manage-staff Edge Function (service role). This migration adds what the
-- Users screen reads, the one profile edit made from the client, and a guard on
-- the shop timezone that every shop-local date depends on.

-- ============================================================================
-- profiles.email: clients can't read auth.users, so the Users list reads a copy
-- taken when the profile is created. V1 has no email change, so it never drifts.
-- ============================================================================

alter table public.profiles add column email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function app.fill_profile_email() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select u.email into new.email from auth.users u where u.id = new.id;
  return new;
end;
$$;

create trigger profiles_fill_email
  before insert on public.profiles
  for each row execute function app.fill_profile_email();

-- ============================================================================
-- shop_settings.timezone must be a zone Postgres knows, or every analyzer
-- period and date filter for the shop fails.
-- ============================================================================

create or replace function app.check_shop_timezone() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Unknown timezone "%".', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger shop_settings_check_timezone
  before insert or update of timezone on public.shop_settings
  for each row execute function app.check_shop_timezone();

-- ============================================================================
-- update_staff_profile: rename, deactivate or reactivate a user. The superadmin
-- edits anyone; an owner edits only their own shop's employees; nobody edits
-- themselves here, so nobody can lock themselves out. Role and shop are fixed at
-- creation. A deactivated user fails every tenant policy on their next request.
-- ============================================================================

create or replace function public.update_staff_profile(
  p_id uuid,
  p_full_name text,
  p_is_active boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.profiles%rowtype;
  v_role app.user_role := app.current_user_role();
begin
  if p_id = auth.uid() then
    raise exception 'You can''t change your own account here.';
  end if;

  select * into v_target from public.profiles where id = p_id;
  if not found then
    raise exception 'This user no longer exists.';
  end if;

  if not (
    v_role = 'superadmin'
    or (
      v_role = 'owner'
      and v_target.role = 'employee'
      and v_target.shop_id = app.current_shop_id()
    )
  ) then
    raise exception 'You don''t have permission to change this user.' using errcode = '42501';
  end if;

  update public.profiles
  set full_name = btrim(p_full_name), is_active = p_is_active
  where id = p_id;

  return p_id;
end;
$$;

revoke all on function public.update_staff_profile(uuid, text, boolean) from public;
grant execute on function public.update_staff_profile(uuid, text, boolean) to authenticated;
