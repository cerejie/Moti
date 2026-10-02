-- ============================================================================
-- Moti V1.3 — notification inbox (copied from TARTAR migrations 28 and 29)
--
--   1. public.notifications keeps one row per recipient per event, whether or
--      not that person turned push on. Each user reads only their own rows and
--      marks them read through mark_notifications_read (null = all).
--   2. app.notify saves the inbox rows and then pushes through app.send_push.
--      It skips whoever caused the event, except for stock alerts, which go to
--      every owner because they are about the shelf, not the person.
--   3. Pending rows ("Needs your action") are deleted by app.resolve_notifications
--      once the request is decided: sign-ups and password resets.
--   4. Events and recipients:
--        an item crosses into Low or Out     -> owners + developer (actor included)
--        an employee signs up                -> owners + developer, pending
--        a password reset is requested       -> owners (owner resets: developer), pending
--        a transaction is checked out        -> owners + developer, not the actor
--        an inventory item is added          -> approved employees, not the actor
--      The 08:00 low-stock digest stays push-only: the alerts list is live in the app.
--   5. public.notifications joins supabase_realtime so the bell updates live;
--      row-level security filters the rows.
--   6. A nightly cron deletes read notifications older than 30 days.
--   Nothing is dropped or renamed.
-- ============================================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  title      text not null,
  body       text not null default '',
  url        text not null default '/',
  tag        text,
  pending    boolean not null default false,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_read_idx
  on public.notifications (read_at) where read_at is not null;
create index if not exists notifications_pending_tag_idx
  on public.notifications (tag) where pending;

alter table public.notifications enable row level security;
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;

drop policy if exists notifications_own_select on public.notifications;
create policy notifications_own_select on public.notifications
  for select to authenticated using (user_id = app.user_id());

create or replace function public.mark_notifications_read(p_ids uuid[] default null) returns void
language sql security definer set search_path = '' as $$
  update public.notifications n
     set read_at = now()
   where n.user_id = app.user_id()
     and n.read_at is null
     and (p_ids is null or n.id = any (p_ids));
$$;

revoke execute on function public.mark_notifications_read(uuid[]) from public, anon;
grant execute on function public.mark_notifications_read(uuid[]) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. Helpers
-- ----------------------------------------------------------------------------
create or replace function app.push_employees() returns uuid[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(u.id), '{}'::uuid[])
  from public.users u
  where u.role = 'employee' and u.approval_status = 'approved';
$$;

create or replace function app.peso(p_amount numeric) returns text
language sql immutable set search_path = '' as $$
  select '₱' || to_char(p_amount, 'FM999,999,999,990.00');
$$;

create or replace function app.notify(
  p_user_ids   uuid[],
  p_title      text,
  p_body       text,
  p_url        text,
  p_tag        text,
  p_pending    boolean default false,
  p_skip_actor boolean default true
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_recipients uuid[];
begin
  select coalesce(array_agg(distinct r.recipient), '{}'::uuid[]) into v_recipients
  from unnest(p_user_ids) as r(recipient)
  where r.recipient is not null
    and (not p_skip_actor or r.recipient is distinct from app.user_id());
  if cardinality(v_recipients) = 0 then
    return;
  end if;

  insert into public.notifications (user_id, title, body, url, tag, pending)
  select r.recipient, p_title, coalesce(p_body, ''), coalesce(p_url, '/'), p_tag,
         coalesce(p_pending, false)
  from unnest(v_recipients) as r(recipient);

  perform app.send_push(v_recipients, p_title, p_body, p_url, p_tag);
end;
$$;

create or replace function app.resolve_notifications(p_tag text) returns void
language sql security definer set search_path = '' as $$
  delete from public.notifications n where n.tag = p_tag and n.pending;
$$;

revoke execute on function app.push_employees() from public, anon, authenticated;
revoke execute on function app.notify(uuid[], text, text, text, text, boolean, boolean)
  from public, anon, authenticated;
revoke execute on function app.resolve_notifications(text) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. Existing events, now through app.notify
-- ----------------------------------------------------------------------------
create or replace function app.push_stock_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.archived_at is not null
     or new.stock_status = 'in_stock'
     or old.stock_status is not distinct from new.stock_status then
    return null;
  end if;

  perform app.notify(
    app.push_owners(),
    case new.stock_status when 'out' then 'Out of stock' else 'Low stock' end,
    concat_ws(' · ',
      new.name,
      new.item_code,
      new.on_hand || ' ' || new.unit || ' left',
      'warning at ' || new.reorder_level),
    '/inventory',
    'stock-' || new.id,
    p_skip_actor := false
  );
  return null;
end;
$$;

create or replace function app.push_signup_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.approval_status <> 'pending' then
    return null;
  end if;

  perform app.notify(
    app.push_owners(),
    'New sign-up waiting',
    new.full_name || ' (' || new.email || ') wants to join as an employee',
    '/users',
    'signup-' || new.id,
    p_pending := true
  );
  return null;
end;
$$;

create or replace function app.push_reset_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.password_reset_requested_at is null
     or old.password_reset_requested_at is not distinct from new.password_reset_requested_at then
    return null;
  end if;

  -- A repeated request replaces the one still waiting.
  perform app.resolve_notifications('reset-' || new.id);
  perform app.notify(
    case when new.role = 'owner' then app.push_developers() else app.push_owners() end,
    'Password reset requested',
    new.full_name || ' (' || new.email || ') asked for a new password',
    '/users',
    'reset-' || new.id,
    p_pending := true
  );
  return null;
end;
$$;

create or replace function app.resolve_user_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    perform app.resolve_notifications('signup-' || old.id);
    perform app.resolve_notifications('reset-' || old.id);
    return null;
  end if;

  if old.approval_status = 'pending' and new.approval_status <> 'pending' then
    perform app.resolve_notifications('signup-' || new.id);
  end if;
  if old.password_reset_requested_at is not null and new.password_reset_requested_at is null then
    perform app.resolve_notifications('reset-' || new.id);
  end if;
  return null;
end;
$$;

drop trigger if exists users_resolve_notifications on public.users;
create trigger users_resolve_notifications
  after update of approval_status, password_reset_requested_at or delete on public.users
  for each row execute function app.resolve_user_event();

-- ----------------------------------------------------------------------------
-- 3. New events
-- ----------------------------------------------------------------------------
create or replace function app.push_transaction_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform app.notify(
    app.push_owners(),
    'New transaction',
    concat_ws(' · ',
      '#' || new.number,
      new.line_count || case when new.line_count = 1 then ' item' else ' items' end,
      app.peso(new.total_amount),
      'by ' || new.created_by_name),
    '/transaction',
    'transaction-' || new.id
  );
  return null;
end;
$$;

drop trigger if exists transactions_push on public.transactions;
create trigger transactions_push
  after insert on public.transactions
  for each row execute function app.push_transaction_event();

create or replace function app.push_item_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform app.notify(
    app.push_employees(),
    'New item',
    concat_ws(' · ',
      new.name,
      new.item_code,
      (select b.name from public.brands b where b.id = new.brand_id)),
    '/transaction',
    'item-' || new.id
  );
  return null;
end;
$$;

drop trigger if exists inventory_items_new_push on public.inventory_items;
create trigger inventory_items_new_push
  after insert on public.inventory_items
  for each row execute function app.push_item_event();

-- ----------------------------------------------------------------------------
-- 4. Retention (00:30 Asia/Manila)
-- ----------------------------------------------------------------------------
select cron.schedule(
  'moti-notification-cleanup',
  '30 16 * * *',
  $$delete from public.notifications where read_at < now() - interval '30 days'$$
);
