-- ============================================================================
-- Moti V1 — accounts, roles and the custom-token login (copied from TARTAR)
--
--   Roles: developer > owner > employee.
--     * developer — the one Supabase Auth account, listed in app.authorities.
--     * owner / employee — rows in public.users. They sign in through
--       public.login_email, which mints an HS256 JWT signed with the project's
--       legacy JWT secret, so PostgREST and RLS treat them as `authenticated`.
--   A user's role is read LIVE from public.users (approved rows only), so
--   disabling or deleting a user takes effect on their next request.
--   Employees self-register as pending; an owner approves them. Password
--   resets are requested by the user and approved by someone above them.
--
--   After running this migration, set the JWT secret once:
--     update app.settings set jwt_secret = '<Project Settings → JWT Keys → Legacy JWT secret>';
--   and register the developer (create the Supabase Auth user first):
--     insert into app.authorities (user_id, role)
--     select id, 'developer' from auth.users where lower(email) = '<your email>';
-- ============================================================================

create schema if not exists app;
create extension if not exists pgcrypto with schema extensions;

-- RLS policies call app.* helpers as the requesting role.
grant usage on schema app to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 0. Private settings and the developer authority
-- ----------------------------------------------------------------------------
create table if not exists app.settings (
  id         boolean primary key default true check (id),
  jwt_secret text not null default ''
);
insert into app.settings (id) values (true) on conflict (id) do nothing;
revoke all on app.settings from public, anon, authenticated;

create table if not exists app.authorities (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null unique check (role = 'developer'),
  created_at timestamptz not null default now()
);
alter table app.authorities enable row level security;
revoke all on app.authorities from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 1. Types and the users table
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where n.nspname = 'app' and t.typname = 'user_role') then
    create type app.user_role as enum ('owner', 'employee');
  end if;
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where n.nspname = 'app' and t.typname = 'approval_status') then
    create type app.approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end;
$$;

create table if not exists public.users (
  id                          uuid primary key default gen_random_uuid(),
  email                       text not null check (email = lower(trim(email))),
  password_hash               text not null,
  full_name                   text not null check (length(trim(full_name)) > 0),
  role                        app.user_role       not null default 'employee',
  approval_status             app.approval_status not null default 'pending',
  pending_password_hash       text,
  password_reset_requested_at timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create unique index if not exists users_email_key on public.users (email);
create index if not exists users_role_status_idx on public.users (role, approval_status);

create or replace function app.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists users_touch on public.users;
create trigger users_touch before update on public.users
  for each row execute function app.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 2. JWT signing (HS256) — only callable by the security-definer login
-- ----------------------------------------------------------------------------
create or replace function app.url_encode(data bytea) returns text
language sql immutable strict set search_path = '' as $$
  select translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;

create or replace function app.sign_jwt(payload jsonb) returns text
language plpgsql volatile set search_path = '' as $$
declare
  v_secret text;
  v_data   text;
begin
  select s.jwt_secret into v_secret from app.settings s where s.id;
  if coalesce(v_secret, '') = '' then
    raise exception 'Sign-in is not configured yet: app.settings.jwt_secret is empty';
  end if;

  v_data := app.url_encode(convert_to('{"alg":"HS256","typ":"JWT"}', 'utf8'))
         || '.' || app.url_encode(convert_to(payload::text, 'utf8'));
  return v_data || '.' || app.url_encode(extensions.hmac(v_data, v_secret, 'sha256'));
end;
$$;

revoke execute on function app.sign_jwt(jsonb) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Identity helpers used by RLS and the RPCs
-- ----------------------------------------------------------------------------
create or replace function app.jwt() returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function app.user_id() returns uuid
language sql stable set search_path = '' as $$
  select nullif(app.jwt() ->> 'sub', '')::uuid;
$$;

create or replace function app.is_custom_user() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((app.jwt() ->> 'is_custom_user')::boolean, false);
$$;

create or replace function app.authority_role() returns text
language sql stable security definer set search_path = '' as $$
  select a.role
  from app.authorities a
  where auth.role() = 'authenticated'
    and not app.is_custom_user()
    and a.user_id = auth.uid();
$$;

create or replace function app.user_role() returns text
language sql stable security definer set search_path = '' as $$
  select coalesce(
    app.authority_role(),
    (select u.role::text
     from public.users u
     where app.is_custom_user()
       and u.id = app.user_id()
       and u.approval_status = 'approved')
  );
$$;

create or replace function app.is_developer() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(app.user_role() = 'developer', false);
$$;

-- Developer or owner: full control of the shop.
create or replace function app.is_owner() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(app.user_role() in ('developer', 'owner'), false);
$$;

-- Any signed-in, approved account.
create or replace function app.is_staff() returns boolean
language sql stable set search_path = '' as $$
  select app.user_role() is not null;
$$;

create or replace function app.can_manage_role(p_role text) returns boolean
language sql stable set search_path = '' as $$
  select coalesce(
    case app.user_role()
      when 'developer' then p_role in ('owner', 'employee')
      when 'owner'     then p_role = 'employee'
    end,
    false
  );
$$;

-- Name stamped on ledger rows; the developer has no users row.
create or replace function app.actor_name() returns text
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select u.full_name from public.users u
     where app.is_custom_user() and u.id = app.user_id()),
    case when app.is_developer() then 'Developer' end,
    'Unknown'
  );
$$;

create or replace function public.my_authority_role() returns text
language sql stable set search_path = '' as $$
  select app.authority_role();
$$;

-- ----------------------------------------------------------------------------
-- 4. RLS on users — password columns are never selectable
-- ----------------------------------------------------------------------------
alter table public.users enable row level security;

revoke all on public.users from anon, authenticated;
grant select (id, email, full_name, role, approval_status,
              password_reset_requested_at, created_at, updated_at)
  on public.users to authenticated;
grant update (full_name, role, approval_status) on public.users to authenticated;
grant delete on public.users to authenticated;

drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select to authenticated
  using (id = app.user_id() or app.can_manage_role(role::text));

drop policy if exists users_update on public.users;
create policy users_update on public.users
  for update to authenticated
  using (app.can_manage_role(role::text))
  with check (app.can_manage_role(role::text));

drop policy if exists users_delete on public.users;
create policy users_delete on public.users
  for delete to authenticated
  using (app.can_manage_role(role::text) and id <> app.user_id());

-- ----------------------------------------------------------------------------
-- 5. Account RPCs
-- ----------------------------------------------------------------------------
create or replace function app.assert_new_account(
  p_email     text,
  p_full_name text,
  p_password  text
) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if coalesce(p_email, '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address';
  end if;
  if nullif(trim(p_full_name), '') is null then
    raise exception 'Enter the full name';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;
  if exists (select 1 from public.users u where u.email = p_email)
     or exists (
       select 1
       from app.authorities a
       join auth.users au on au.id = a.user_id
       where lower(au.email) = p_email
     ) then
    raise exception 'An account with this email already exists';
  end if;
end;
$$;

-- Self sign-up: always a pending employee.
create or replace function public.register_email(
  p_email     text,
  p_full_name text,
  p_password  text
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_email text := lower(trim(p_email));
begin
  perform app.assert_new_account(v_email, p_full_name, p_password);

  insert into public.users (email, password_hash, full_name, role, approval_status)
  values (v_email,
          extensions.crypt(p_password, extensions.gen_salt('bf')),
          trim(p_full_name),
          'employee',
          'pending');
end;
$$;

create or replace function public.admin_create_user_email(
  p_email     text,
  p_password  text,
  p_full_name text,
  p_role      text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(p_email));
  v_id    uuid;
begin
  if not app.can_manage_role(p_role) then
    raise exception 'You are not allowed to create a user with role %', p_role
      using errcode = '42501';
  end if;
  perform app.assert_new_account(v_email, p_full_name, p_password);

  insert into public.users (email, password_hash, full_name, role, approval_status)
  values (v_email,
          extensions.crypt(p_password, extensions.gen_salt('bf')),
          trim(p_full_name),
          p_role::app.user_role,
          'approved')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.login_email(
  p_email    text,
  p_password text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user   public.users;
  v_now    int := extract(epoch from now())::int;
  v_claims jsonb;
begin
  select * into v_user from public.users u where u.email = lower(trim(p_email));

  if not found
     or v_user.password_hash <> extensions.crypt(p_password, v_user.password_hash) then
    raise exception 'invalid email or password' using errcode = '28P01';
  end if;

  if v_user.approval_status <> 'approved' then
    raise exception 'account is %', v_user.approval_status using errcode = '28000';
  end if;

  v_claims := jsonb_build_object(
    'role',           'authenticated',
    'aud',            'authenticated',
    'sub',            v_user.id::text,
    'iat',            v_now,
    'exp',            v_now + 60 * 60 * 8,
    'is_custom_user', true,
    'email',          v_user.email,
    'user_role',      v_user.role
  );

  return jsonb_build_object(
    'token', app.sign_jwt(v_claims),
    'expires_at', v_now + 60 * 60 * 8,
    'user', jsonb_build_object(
      'id',        v_user.id,
      'email',     v_user.email,
      'full_name', v_user.full_name,
      'role',      v_user.role
    )
  );
end;
$$;

create or replace function public.request_password_reset(
  p_email    text,
  p_password text
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  update public.users u
     set pending_password_hash       = extensions.crypt(p_password, extensions.gen_salt('bf')),
         password_reset_requested_at = now()
   where u.email = lower(trim(p_email))
     and u.approval_status = 'approved'
  returning u.id into v_id;

  if v_id is null then
    raise exception 'No active account uses this email';
  end if;
end;
$$;

create or replace function public.decide_password_reset(
  p_user_id uuid,
  p_approve boolean
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user public.users;
begin
  select * into v_user from public.users u where u.id = p_user_id for update;
  if not found or not app.can_manage_role(v_user.role::text) then
    raise exception 'You are not allowed to decide this password reset' using errcode = '42501';
  end if;
  if v_user.pending_password_hash is null then
    raise exception 'This user has no pending password reset';
  end if;

  update public.users u
     set password_hash               = case when p_approve then u.pending_password_hash
                                            else u.password_hash end,
         pending_password_hash       = null,
         password_reset_requested_at = null
   where u.id = p_user_id;
end;
$$;

create or replace function public.change_own_password(
  p_current_password text,
  p_new_password     text
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_user public.users;
begin
  select * into v_user
  from public.users u
  where app.is_custom_user() and u.id = app.user_id()
  for update;

  if not found
     or v_user.password_hash <> extensions.crypt(p_current_password, v_user.password_hash) then
    raise exception 'Current password is incorrect' using errcode = '28P01';
  end if;
  if length(coalesce(p_new_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  update public.users u
     set password_hash               = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
         pending_password_hash       = null,
         password_reset_requested_at = null
   where u.id = v_user.id;
end;
$$;

create or replace function public.admin_set_password(
  p_user_id  uuid,
  p_password text
) returns void
language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select u.role::text into v_role from public.users u where u.id = p_user_id;
  if not found or not app.can_manage_role(v_role) then
    raise exception 'You are not allowed to reset this user''s password' using errcode = '42501';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  update public.users u
     set password_hash               = extensions.crypt(p_password, extensions.gen_salt('bf')),
         pending_password_hash       = null,
         password_reset_requested_at = null
   where u.id = p_user_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. Grants
-- ----------------------------------------------------------------------------
revoke execute on function public.register_email(text, text, text)          from public;
revoke execute on function public.login_email(text, text)                    from public;
revoke execute on function public.request_password_reset(text, text)        from public;
revoke execute on function public.admin_create_user_email(text, text, text, text) from public;
revoke execute on function public.decide_password_reset(uuid, boolean)      from public;
revoke execute on function public.change_own_password(text, text)           from public;
revoke execute on function public.admin_set_password(uuid, text)            from public;
revoke execute on function public.my_authority_role()                       from public;

grant execute on function public.register_email(text, text, text)          to anon, authenticated;
grant execute on function public.login_email(text, text)                    to anon, authenticated;
grant execute on function public.request_password_reset(text, text)        to anon, authenticated;
grant execute on function public.admin_create_user_email(text, text, text, text) to authenticated;
grant execute on function public.decide_password_reset(uuid, boolean)      to authenticated;
grant execute on function public.change_own_password(text, text)           to authenticated;
grant execute on function public.admin_set_password(uuid, text)            to authenticated;
grant execute on function public.my_authority_role()                       to authenticated;
