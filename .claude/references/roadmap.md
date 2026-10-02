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
- [ ] Next steps (below), in order
- [ ] LATER: SaaS build (multi-shop), update prompt, analyzer, pgTAP tests

## Next steps

Work top to bottom; tick each one when done.

1. **Commit the V1 build**
   - [ ] `git add -A -- . ":!.serena"` then commit with the V1 message
         (`Feature: Moti V1 Inventory With Roles And Low-Stock Push Alerts`)
   - [ ] Decide: add `.serena/` to `.gitignore`?
   - [ ] Decide: delete the unused placeholder `src/pages/Home/HomeView.tsx`?
2. **Test the roles** (setup guide Part 6, steps 19–21)
   - [ ] As the developer, create an owner under Team
   - [ ] As the owner, add a category and a few items with reorder levels
   - [ ] Register an employee from the sign-in page, then approve them as the owner
   - [ ] As the employee, confirm only Inventory and My account show, and only "Record sale" works
3. **Finish push setup** (setup guide Part 5, steps 12–16) — skip any already done
   - [ ] Generate VAPID keys; public key into `.env` as `VITE_VAPID_PUBLIC_KEY`
   - [ ] Deploy the `send-push` Edge Function with JWT verification off
   - [ ] Add the 4 function secrets (`VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SECRET`)
   - [ ] Set `push_function_url` and `push_secret` in `app.settings`
4. **Test push** (setup guide steps 22–25)
   - [ ] `yarn build`, then `yarn preview`, and open the printed address
   - [ ] As the owner: My account → Low-stock notifications → Turn on
   - [ ] Sell an item down to its reorder level; a "Low stock" notification appears
   - [ ] If nothing arrives: check send-push Logs and `net._http_response`
5. **Check on a phone**
   - [ ] Light mode and dark mode at phone width
   - [ ] Inventory cards, the Sell button, the stock dialog and the bottom tab bar
   - [ ] iPhone only: Share → Add to Home Screen before turning on push
   - [ ] Report anything that looks off
6. **Deploy** (when happy)
   - [ ] Host on Vercel (or similar) from the repo
   - [ ] Add the three `VITE_...` values from `.env` as environment variables, then redeploy
   - [ ] Never add the JWT secret, VAPID private key, `PUSH_SECRET` or service-role key there

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

## Who sees what

| Capability | Developer | Owner | Employee |
|---|:-:|:-:|:-:|
| Browse and search inventory | ✓ | ✓ | ✓ |
| Record a sale | ✓ | ✓ | ✓ |
| Add stock, deduct damaged/correction | ✓ | ✓ | ✗ |
| Create, edit, archive items; manage categories | ✓ | ✓ | ✗ |
| Dashboard, stock history, alerts bell, push | ✓ | ✓ | ✗ |
| Manage accounts | owners + employees | employees | ✗ |

## Data model

| Object | Purpose |
|---|---|
| `app.settings` | jwt_secret, push_function_url, push_secret (private schema) |
| `app.authorities` | the developer's Supabase Auth user |
| `public.users` | owners and employees: email, bcrypt hash, role, approval status, pending reset |
| `categories` | item grouping |
| `inventory_items` | sku, name, category, brand, part no., unit, on_hand, reorder_level, selling price, location, generated `stock_status`, archived_at |
| `stock_movements` | append-only ledger: type, reason, signed quantity, balance_after, client_id |
| `push_subscriptions` | one row per device endpoint |

RPCs: `login_email`, `register_email`, `request_password_reset`, `decide_password_reset`,
`change_own_password`, `admin_create_user_email`, `admin_set_password`, `my_authority_role`,
`create_item`, `record_movement`, `inventory_summary`, `save_push_subscription`,
`delete_push_subscription`.

## Go-live checklist (the user runs these)

1. `supabase db push` (three migrations under `supabase/migrations/2026100200000*`).
2. `update app.settings set jwt_secret = '<legacy JWT secret>';`
3. Create the developer in Supabase Auth, then insert it into `app.authorities`.
4. `npx web-push generate-vapid-keys`; put the public key in `VITE_VAPID_PUBLIC_KEY`.
5. `supabase secrets set VAPID_SUBJECT=mailto:… VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… PUSH_SECRET=…`
   and `supabase functions deploy send-push --no-verify-jwt`.
6. `update app.settings set push_function_url = 'https://<ref>.supabase.co/functions/v1/send-push', push_secret = '<PUSH_SECRET>';`
7. Sign in as the developer, create the owner under Team.

## LATER (out of V1 on purpose)

Multi-shop SaaS, suppliers and costs, analyzer and volume ranking, persisted notification feed,
update prompt, CSV import/export, barcode scanning, pgTAP tests, code-splitting the bundle.
