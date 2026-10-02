# Moti V1 roadmap: one shop, inventory and low-stock monitoring

Re-scoped with the user on 2026-10-02: the multi-tenant plan of 2026-09-24 is replaced by a
simple single-shop V1. Multi-tenancy (shops, shop_id, superadmin, shop switcher) moves to the
SaaS build, which comes later.

## Progress

- [x] Phase 0: Foundation (shell, PWA, common layer)
- [x] V1 build (2026-10-02): auth and roles, inventory, stock movements, dashboard, alerts,
      team management, account, web push
- [x] Supabase setup (2026-10-02): project, migrations, JWT secret, developer account —
      developer sign-in confirmed working
- [x] V1.1 build (2026-10-02): brands + creatable category/brand fields, Masterfile,
      multi-item Transaction with checkout, owner history and void (migration 4)
- [x] V1.2 build (2026-10-02): item code replaces SKU (generated from category + brand + series),
      part number dropped, "Warning low stock quantity" label (migration 5)
- [ ] Next steps (below), in order
- [ ] V1.3: notifications, visual test and audit (phases below), one conversation per phase
- [ ] LATER: SaaS build (multi-shop), update prompt, analyzer, pgTAP tests

## Next steps

Work top to bottom; tick each one when done.

1. **Commit the V1 build**
   - [x] Committed as `572eb5b`
   - [x] `.serena/` stays tracked (only `project.yml`; its own `.gitignore` drops cache and local)
   - [ ] Delete the unused placeholder `src/pages/Home/HomeView.tsx` (user deletes; the tool was blocked)
2. **Apply migrations 4–5 and test the roles**
   - [x] Anonymous probe (2026-10-02): every table 401, RPCs 42501, sign-up pending, duplicate
         email refused, pending login refused, anon cannot create an owner
   - [x] `supabase db push` (migrations 4 and 5 applied, 2026-10-02)
   - [x] As the owner, approve "Test Employee" (`moti.test.employee@example.com`) under Team
   - [ ] Run the role probe: employee half passed 14/14 (2026-10-02); owner half (history,
         ledger, void) still needs an owner login — done in V1.3 Phase 4
   - [x] As the employee, confirm only Transaction and My account show (headless check, 2026-10-02)
   - [x] Add an item typing a new category and brand, see both in Masterfile
         (`BRA-BRE-000001`, Brake pads / Brembo, by the developer, 2026-10-02)

## V1.3: notifications, visual test and audit

One phase per conversation. Plan first and wait for approval before any code or migration.

### Phase 1: Finish push setup (setup guide Part 5, steps 12–16)
The user runs every command; Claude only hands them over. Skip any already done.
- [x] Generate VAPID keys; public key into `.env` as `VITE_VAPID_PUBLIC_KEY`
- [x] Deploy the `send-push` Edge Function with JWT verification off (unauthenticated GET → 405, 2026-10-02)
- [x] Add the 4 function secrets (`VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SECRET`)
- [x] Set `push_function_url` and `push_secret` in `app.settings` (user, 2026-10-02)

### Phase 2: Notifications, built to match TARTAR
- [x] Study TARTAR end to end (send-push, push hook, inbox migrations 28–30, InboxBell,
      NotificationCenter, InboxFeed, PhoneAlertsSheet, realtime refresh)
- [x] Ask the user: **stored inbox like TARTAR** (2026-10-02, see Decisions log)
- [x] Owner: push + inbox when an item reaches its warning low stock quantity (`push_stock_event`,
      now through `app.notify`, one per item, every owner including the actor)
- [x] Owner: push + inbox for every checkout by anyone but that owner (`push_transaction_event`)
- [x] Employee: push + inbox when a new inventory item is added (`push_item_event`)
- [x] Employees can turn notifications on in My account; the bell shows for every role
- [x] Migration 6 written (`20261002000006_create_notification_inbox.sql`); `yarn build` + `yarn lint` clean
- [x] User runs `supabase db push` (migration 6; confirmed live 2026-10-02)

### Phase 3: Push end to end
Run 2026-10-02 in two visible Edge profiles (real WNS push), events through the app's RPCs with
each user's own token; every push matched its inbox row and nothing reached the actor.
- [x] `yarn build`, serve on port 4180 (see Visual testing setup)
- [x] Owner turns on notifications; a checkout that takes an item to its warning quantity sends
      "Low stock"; the owner's own checkout to 0 sends "Out of stock" (same tag, replaces Low)
- [x] Employee checks out a transaction; the owner gets the transaction push
- [x] Owner adds an item; the employee gets the new-item push (owner gets none)
- [x] Sign-up sends the owner a pending "New sign-up waiting"; approving deletes it
- [x] In-app notifications match the pushes; bell count = unread updates + live stock alerts
- [x] If nothing arrives: not needed, every push arrived
- [ ] On a real phone (user): notifications arrive with the app closed; iPhone needs Share → Add
      to Home Screen first
- Test data left: test owner `moti.test.owner@example.com`, approved employee
  `moti.push.muqtwncm@example.com`, archived "Push test item muqtwncm" (`BRA-UMA-000002`),
  transactions #2 and #3 voided. Not covered: the developer's device, the 08:00 digest,
  tapping a notification.

### Phase 4: Visual test (Claude drives the app)
Claude may create owner and employee test accounts (user's permission, 2026-10-02).
- [ ] Every screen, every role (owner, employee, developer if possible): sign-in, register, forgot
      password, dashboard, transaction (cart + checkout), inventory, masterfile, history + void,
      team approvals, my account, alerts
- [ ] Phone (390), tablet (820), desktop (1440), light and dark; a screenshot of each
- [ ] Employee sees the test item on Transaction
- [ ] API role probe, both roles (closes the open item in step 2)

### Phase 5: Audit
- [ ] UI and UX: on a phone it must feel like a native mobile app (PWA); on tablet and desktop, a
      web app. Layout, navigation, touch targets, safe areas, the four data states, typography,
      consistency
- [ ] Architecture as it stands now, with suggestions
- [ ] Report ranked by severity, with screenshots, as a page the user can open; no code changes
      without a plan and approval

### Phase 6: Check on a phone (user)
- [ ] Light mode and dark mode at phone width
- [ ] Transaction cards, the Add / − + stepper, the cart bar and cart sheet, the bottom tab bar
- [ ] Report anything that looks off

### Phase 7: Deploy (when happy)
- [ ] Host on Vercel (or similar) from the repo
- [ ] Add the three `VITE_...` values from `.env` as environment variables, then redeploy
- [ ] Never add the JWT secret, VAPID private key, `PUSH_SECRET` or service-role key there

## Visual testing setup

- Serve with `yarn build`, then `yarn preview --host --port 4180 --strictPort` in the background.
  **Never port 4173**: TARTAR's service worker is installed on `localhost:4173`, so a browser shows
  TARTAR there. The user keeps their own TARTAR preview running; never stop it.
- No Chrome or Playwright browsers on this machine. Install `playwright-core` in the session
  scratchpad (never the repo) and launch Edge:
  `executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`,
  `serviceWorkers: "block"`.
- Sign-in form: `getByLabel("Email")`; the password input is `#password` (`getByLabel("Password")`
  also matches the "Show password" button).
- Test employee: `moti.test.employee@example.com` (approved). Its password is not kept in this
  committed file; create fresh test accounts instead.
- Push tests: `launchPersistentContext` (one scratchpad profile per user), `headless: false`,
  service workers allowed, `grantPermissions(["notifications"])`; delivery is proven by
  `registration.getNotifications()` in the page. Edge subscribes through WNS.
- Stopping a background `yarn preview` on Windows can leave the vite process running; ask the user
  to stop it.

## Decisions log

- 2026-09-24: optional selling price on items is kept (display-only).
- 2026-10-02: **one shop**, no tenancy columns. SaaS (multi-shop) is a later, separate build.
- 2026-10-02: **auth copies TARTAR exactly**: `public.users` with bcrypt hashes, a `login_email`
  RPC that signs an HS256 JWT with the project's legacy JWT secret, and one Supabase Auth
  account for the developer listed in `app.authorities`. Employees self-register (pending) and
  the owner approves; password resets are requested by the user and approved by the owner.
- 2026-10-02: roles are **developer > owner > employee**. Employees browse inventory and record
  sales only.
- 2026-10-02: stock status is **Out (0) / Low (≤ reorder level) / In stock**; the separate
  "Reorder" band was dropped.
- 2026-10-02: brand is **racing orange** (`#EA580C` light, `#F97316` on carbon dark) on TARTAR's
  floating-panel layout; sign-in has a carbon hero with racing stripes.
- 2026-10-02: push uses TARTAR's `send-push` Edge Function and pg_net, but the service worker
  stays `generateSW` and pulls `public/push-sw.js` in through `workbox.importScripts`, so no new
  workbox packages and the runtime caching is unchanged.
- 2026-10-02: alerts are **computed from current stock** (bell + dashboard), not a persisted
  feed; push fires when an item **crosses into** Low or Out, plus an 08:00 Manila digest.
- 2026-10-02: the offline queue is scoped to the account that queued it (`sync.store`
  `ownerId`); sign-out with pending writes asks first and keeps them for that account.
- 2026-10-02 (V1.1): selling is a **multi-item Transaction** for every role (never "order").
  `record_transaction` deducts all lines or none; the one-item "Record sale" is gone and
  `record_movement` is owner-only adjustments. Employees see Transaction + My account only.
- 2026-10-02 (V1.1): peso total is **display only** (selling price snapshot per line); owners
  see History and can **void** (stock returned via `void` ledger rows, transaction kept).
- 2026-10-02 (V1.1): **brand is a table** like categories (free text migrated, duplicates merged,
  old column dropped). Category and brand on the item form are **creatable** (TARTAR supplier
  pattern): an existing name is picked, a new one is created on save.
- 2026-10-02 (V1.1): **Masterfile** (Categories + Brands tabs) is a sub-page of Inventory,
  not a tab: seven tabs do not fit a 360 px tab bar. Transaction's phone tab reads "Sell".
- 2026-10-02: commit messages follow TARTAR: `Development vX.YY` + one `Type: Title` line per change.
- 2026-10-02 (V1.2, migration 5): **no "SKU" anywhere** — it is the **item code**, generated by
  `create_item` as category(3) + brand(3) + a 6-digit series per prefix (`BRA-BRE-000001`), never
  edited after. Category and brand are required. Part number is dropped. `reorder_level` keeps its
  column name but is shown as **Warning low stock quantity**; shelf location stays optional.
- 2026-10-02 (V1.3 Phase 2, migration 6): **stored notification inbox, TARTAR's model** — replaces
  "alerts computed only". `public.notifications` + `app.notify` (inbox row, then push); the bell
  (every role) opens a center with Needs your action (pending sign-ups and resets, deleted once
  decided), Stock alerts (owners, still computed live) and Updates (read/unread, Mark all read).
  Live through Supabase Realtime (`setCustomToken` also sets the realtime token). The actor is
  never notified, except Low/Out stock, which goes to every owner. Low stock stays one push per
  item (user's choice). The 08:00 digest stays push-only; read rows are deleted after 30 days.
- 2026-10-02 (V1.3 Phase 1): the app's Supabase project is **`kuesqdurgmlncugdurxq`**; the CLI
  was relinked to it (the old link to `fskokirvjcxuxiclkpie` was stale). `send-push` has no
  `config.toml`, so every redeploy needs `--no-verify-jwt`.

## Who sees what

| Capability | Developer | Owner | Employee |
|---|:-:|:-:|:-:|
| Transaction: search, filter, cart, checkout | ✓ | ✓ | ✓ |
| Transaction history, void | ✓ | ✓ | ✗ |
| Inventory page | ✓ | ✓ | ✗ |
| Add stock, deduct damaged/correction | ✓ | ✓ | ✗ |
| Create, edit, archive items; Masterfile (categories, brands) | ✓ | ✓ | ✗ |
| Dashboard, stock history, alerts bell, push | ✓ | ✓ | ✗ |
| Manage accounts | owners + employees | employees | ✗ |

## Data model

| Object | Purpose |
|---|---|
| `app.settings` | jwt_secret, push_function_url, push_secret (private schema) |
| `app.authorities` | the developer's Supabase Auth user |
| `public.users` | owners and employees: email, bcrypt hash, role, approval status, pending reset |
| `categories` | item grouping |
| `brands` | item brand, owner-managed, unique by lower(name) |
| `inventory_items` | item_code, name, category_id, brand_id, unit, on_hand, reorder_level, selling price, location, generated `stock_status`, archived_at |
| `transactions` | number, status completed/voided, line_count, total_quantity, total_amount (display), note, void info, client_id |
| `stock_movements` | append-only ledger: type, reason (+ `void`), signed quantity, balance_after, transaction_id, unit_price, client_id |
| `push_subscriptions` | one row per device endpoint |
| `notifications` | inbox: one row per recipient per event; title, body, url, tag, pending, read_at |

RPCs: `login_email`, `register_email`, `request_password_reset`, `decide_password_reset`,
`change_own_password`, `admin_create_user_email`, `admin_set_password`, `my_authority_role`,
`create_item`, `record_movement`, `record_transaction`, `void_transaction`, `inventory_summary`,
`save_push_subscription`, `delete_push_subscription`, `mark_notifications_read`.

## Go-live checklist (the user runs these)

1. `supabase db push` (four migrations under `supabase/migrations/2026100200000*`).
2. `update app.settings set jwt_secret = '<legacy JWT secret>';`
3. Create the developer in Supabase Auth, then insert it into `app.authorities`.
4. `npx web-push generate-vapid-keys`; put the public key in `VITE_VAPID_PUBLIC_KEY`.
5. `supabase secrets set VAPID_SUBJECT=mailto:… VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… PUSH_SECRET=…`
   and `supabase functions deploy send-push --no-verify-jwt`.
6. `update app.settings set push_function_url = 'https://<ref>.supabase.co/functions/v1/send-push', push_secret = '<PUSH_SECRET>';`
7. Sign in as the developer, create the owner under Team.

## Open architecture findings (2026-10-02 review, not yet fixed)

1. Password reset approval can be abused: anyone who knows an email can file a reset with
   their own password; the owner must confirm in person before approving.
2. `login_email` has no attempt lockout; `register_email` has no throttle (sign-up push spam).
3. `request_password_reset` reveals whether an email has an active account.
4. Offline item edits are last-write-wins; a queued transaction can fail on flush if stock ran out.
5. One push per item that crosses into Low/Out, so a multi-item checkout can send several.
6. Sign-in depends on Supabase's legacy HS256 JWT secret.
7. RLS helpers run per row (`app.is_staff()` not wrapped in `select`), fine at one-shop scale.

## LATER (out of V1 on purpose)

Multi-shop SaaS, suppliers and costs, analyzer and volume ranking,
update prompt, CSV import/export, barcode scanning, pgTAP tests, code-splitting the bundle.
