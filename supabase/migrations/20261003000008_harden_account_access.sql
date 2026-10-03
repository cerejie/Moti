-- ============================================================================
-- Moti V1.4 — password resets carry no password; sign-in and sign-up are limited
--
--   * A reset request only raises a flag. The owner answers it by setting a
--     temporary password (admin_set_password) or dismissing it. The request
--     gives the same answer whether or not the email has an account.
--   * Five wrong passwords lock an email for five minutes.
--   * At most five sign-ups may wait for approval per hour.
--
--   Breaks the old client: request_password_reset(text, text) and
--   decide_password_reset(uuid, boolean) are dropped. Deploy the matching
--   front end right after running this.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Password reset requests
-- ----------------------------------------------------------------------------
-- A password chosen by whoever filed the request must never become the real one.
update public.users set pending_password_hash = null where pending_password_hash is not null;

drop function if exists public.request_password_reset(text, text);
drop function if exists public.decide_password_reset(uuid, boolean);

-- A request already waiting is left alone, so repeats cannot flood the owner.
create or replace function public.request_password_reset(p_email text) returns void
language sql security definer set search_path = '' as $$
  update public.users u
     set password_reset_requested_at = now()
   where u.email = lower(trim(p_email))
     and u.approval_status = 'approved'
     and u.password_reset_requested_at is null;
$$;

create or replace function public.dismiss_password_reset(p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select u.role::text into v_role from public.users u where u.id = p_user_id;
  if not found or not app.can_manage_role(v_role) then
    raise exception 'You are not allowed to decide this password reset' using errcode = '42501';
  end if;

  update public.users u
     set pending_password_hash       = null,
         password_reset_requested_at = null
   where u.id = p_user_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Sign-in attempts
-- ----------------------------------------------------------------------------
create table if not exists app.login_attempts (
  email          text primary key,
  failed_count   int not null default 0 check (failed_count >= 0),
  last_failed_at timestamptz not null default now(),
  locked_until   timestamptz
);

create index if not exists login_attempts_last_failed_idx
  on app.login_attempts (last_failed_at);

alter table app.login_attempts enable row level security;
revoke all on app.login_attempts from public, anon, authenticated;

-- A refused sign-in is returned with an error status instead of raised: raising
-- would roll the attempt counter back with the rest of the transaction.
create or replace function public.login_email(
  p_email    text,
  p_password text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_email    text := lower(trim(p_email));
  v_user     public.users;
  v_now      int := extract(epoch from now())::int;
  v_claims   jsonb;
  v_attempts constant int := 5;
  v_window   constant interval := interval '15 minutes';
  v_lock     constant interval := interval '5 minutes';
begin
  if exists (
    select 1 from app.login_attempts a
    where a.email = v_email and a.locked_until > now()
  ) then
    perform set_config('response.status', '429', true);
    return jsonb_build_object(
      'code',    'P0001',
      'message', 'Too many wrong passwords. Try again in a few minutes.'
    );
  end if;

  select * into v_user from public.users u where u.email = v_email;

  if not found
     or v_user.password_hash <> extensions.crypt(p_password, v_user.password_hash) then
    -- The developer signs in through Supabase Auth after this refusal, so that
    -- email is never counted. Every other email is, whether or not it exists.
    if not exists (
      select 1
      from app.authorities a
      join auth.users au on au.id = a.user_id
      where lower(au.email) = v_email
    ) then
      delete from app.login_attempts a where a.last_failed_at < now() - interval '1 day';

      insert into app.login_attempts as a (email, failed_count, last_failed_at)
      values (v_email, 1, now())
      on conflict (email) do update
        set failed_count   = case when a.last_failed_at < now() - v_window then 1
                                  else a.failed_count + 1 end,
            last_failed_at = now(),
            locked_until   = case when a.last_failed_at >= now() - v_window
                                       and a.failed_count + 1 >= v_attempts
                                  then now() + v_lock end;
    end if;

    perform set_config('response.status', '400', true);
    return jsonb_build_object('code', '28P01', 'message', 'invalid email or password');
  end if;

  if v_user.approval_status <> 'approved' then
    raise exception 'account is %', v_user.approval_status using errcode = '28000';
  end if;

  delete from app.login_attempts a where a.email = v_email;

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

-- ----------------------------------------------------------------------------
-- 3. Sign-up cap
-- ----------------------------------------------------------------------------
create or replace function public.register_email(
  p_email     text,
  p_full_name text,
  p_password  text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_email      text := lower(trim(p_email));
  v_max_hourly constant int := 5;
begin
  perform app.assert_new_account(v_email, p_full_name, p_password);

  if (
    select count(*) from public.users u
    where u.approval_status = 'pending' and u.created_at > now() - interval '1 hour'
  ) >= v_max_hourly then
    raise exception 'Too many sign-ups are waiting for approval. Try again in an hour, or ask the owner to add you.';
  end if;

  insert into public.users (email, password_hash, full_name, role, approval_status)
  values (v_email,
          extensions.crypt(p_password, extensions.gen_salt('bf')),
          trim(p_full_name),
          'employee',
          'pending');
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Grants
-- ----------------------------------------------------------------------------
revoke execute on function public.request_password_reset(text) from public;
revoke execute on function public.dismiss_password_reset(uuid) from public, anon;

grant execute on function public.request_password_reset(text) to anon, authenticated;
grant execute on function public.dismiss_password_reset(uuid) to authenticated;
