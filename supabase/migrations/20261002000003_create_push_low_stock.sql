-- ============================================================================
-- Moti V1 — push notifications (copied from TARTAR's send-push model)
--
--   1. public.push_subscriptions: one row per device endpoint, written only
--      through save_push_subscription, which hands an endpoint to whoever signs
--      in on that device so a shared phone never notifies the previous user.
--   2. app.settings gains push_function_url and push_secret. Set them once
--      after deploying the send-push Edge Function:
--        update app.settings
--        set push_function_url = 'https://<ref>.supabase.co/functions/v1/send-push',
--            push_secret       = '<same value as the PUSH_SECRET function secret>';
--      Until both are set, every push is a no-op.
--   3. Events (recipients: approved owners and the developer):
--        an item crosses into Low or Out of stock
--        an employee signs up and waits for approval
--        a user requests a password reset (owner resets go to the developer)
--   4. app.send_low_stock_digest runs daily at 08:00 Asia/Manila (00:00 UTC)
--      with the count of low and out-of-stock items. Nothing is sent for zero.
-- ============================================================================

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

alter table app.settings
  add column if not exists push_function_url text not null default '',
  add column if not exists push_secret       text not null default '';

-- ----------------------------------------------------------------------------
-- 1. Subscriptions
-- ----------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;

drop policy if exists push_own_select on public.push_subscriptions;
create policy push_own_select on public.push_subscriptions
  for select to authenticated using (user_id = app.user_id());

drop policy if exists push_own_delete on public.push_subscriptions;
create policy push_own_delete on public.push_subscriptions
  for delete to authenticated using (user_id = app.user_id());

create or replace function public.save_push_subscription(
  p_endpoint   text,
  p_p256dh     text,
  p_auth       text,
  p_user_agent text default null
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if app.user_id() is null or app.user_role() is null then
    raise exception 'Sign in to turn on notifications';
  end if;
  if coalesce(p_endpoint, '') = '' or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    raise exception 'This device returned an incomplete push subscription';
  end if;

  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (app.user_id(), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update
    set user_id    = excluded.user_id,
        p256dh     = excluded.p256dh,
        auth       = excluded.auth,
        user_agent = excluded.user_agent;
end;
$$;

create or replace function public.delete_push_subscription(p_endpoint text) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_subscriptions s
  where s.endpoint = p_endpoint
    and s.user_id = app.user_id();
$$;

revoke execute on function public.save_push_subscription(text, text, text, text) from public, anon;
revoke execute on function public.delete_push_subscription(text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text, text) to authenticated;
grant execute on function public.delete_push_subscription(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Recipients and delivery
-- ----------------------------------------------------------------------------
create or replace function app.push_owners() returns uuid[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(distinct r.user_id), '{}'::uuid[])
  from (
    select u.id as user_id
    from public.users u
    where u.role = 'owner' and u.approval_status = 'approved'
    union
    select a.user_id from app.authorities a
  ) r;
$$;

create or replace function app.push_developers() returns uuid[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(a.user_id), '{}'::uuid[]) from app.authorities a;
$$;

create or replace function app.send_push(
  p_user_ids uuid[],
  p_title    text,
  p_body     text,
  p_url      text,
  p_tag      text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_settings   app.settings;
  v_recipients uuid[];
begin
  select * into v_settings from app.settings s where s.id;
  if coalesce(v_settings.push_function_url, '') = '' or coalesce(v_settings.push_secret, '') = '' then
    return;
  end if;

  select coalesce(array_agg(distinct s.user_id), '{}'::uuid[]) into v_recipients
  from public.push_subscriptions s
  where s.user_id = any (p_user_ids);
  if cardinality(v_recipients) = 0 then
    return;
  end if;

  perform net.http_post(
    url     := v_settings.push_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', v_settings.push_secret
    ),
    body    := jsonb_build_object(
      'user_ids', to_jsonb(v_recipients),
      'title', p_title,
      'body', p_body,
      'url', p_url,
      'tag', p_tag
    )
  );
end;
$$;

revoke execute on function app.push_owners() from public, anon, authenticated;
revoke execute on function app.push_developers() from public, anon, authenticated;
revoke execute on function app.send_push(uuid[], text, text, text, text) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Event pushes
-- ----------------------------------------------------------------------------
create or replace function app.push_stock_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.archived_at is not null
     or new.stock_status = 'in_stock'
     or old.stock_status is not distinct from new.stock_status then
    return null;
  end if;

  perform app.send_push(
    app.push_owners(),
    case new.stock_status when 'out' then 'Out of stock' else 'Low stock' end,
    concat_ws(' · ',
      new.name,
      new.sku,
      new.on_hand || ' ' || new.unit || ' left',
      'reorder at ' || new.reorder_level),
    '/inventory',
    'stock-' || new.id
  );
  return null;
end;
$$;

drop trigger if exists inventory_items_push on public.inventory_items;
create trigger inventory_items_push
  after update of on_hand, reorder_level on public.inventory_items
  for each row execute function app.push_stock_event();

create or replace function app.push_signup_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.approval_status <> 'pending' then
    return null;
  end if;

  perform app.send_push(
    app.push_owners(),
    'New sign-up waiting',
    new.full_name || ' (' || new.email || ') wants to join as an employee',
    '/users',
    'signup-' || new.id
  );
  return null;
end;
$$;

drop trigger if exists users_signup_push on public.users;
create trigger users_signup_push
  after insert on public.users
  for each row execute function app.push_signup_event();

create or replace function app.push_reset_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.password_reset_requested_at is null
     or old.password_reset_requested_at is not distinct from new.password_reset_requested_at then
    return null;
  end if;

  perform app.send_push(
    case when new.role = 'owner' then app.push_developers() else app.push_owners() end,
    'Password reset requested',
    new.full_name || ' (' || new.email || ') asked for a new password',
    '/users',
    'reset-' || new.id
  );
  return null;
end;
$$;

drop trigger if exists users_reset_push on public.users;
create trigger users_reset_push
  after update of password_reset_requested_at on public.users
  for each row execute function app.push_reset_event();

-- ----------------------------------------------------------------------------
-- 4. Daily low-stock digest
-- ----------------------------------------------------------------------------
create or replace function app.send_low_stock_digest() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_low bigint;
  v_out bigint;
begin
  select count(*) filter (where i.stock_status = 'low'),
         count(*) filter (where i.stock_status = 'out')
    into v_low, v_out
  from public.inventory_items i
  where i.archived_at is null;

  if v_low + v_out = 0 then
    return;
  end if;

  perform app.send_push(
    app.push_owners(),
    'Stock check',
    concat_ws(', ',
      case when v_out > 0 then v_out || ' out of stock' end,
      case when v_low > 0 then v_low || ' running low' end),
    '/inventory',
    'low-stock-digest'
  );
end;
$$;

revoke execute on function app.send_low_stock_digest() from public, anon, authenticated;

select cron.schedule(
  'moti-low-stock-digest',
  '0 0 * * *',
  'select app.send_low_stock_digest()'
);
