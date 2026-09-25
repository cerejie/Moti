# Moti V1 roadmap: multi-tenant, inventory only

Agreed with the user on 2026-09-24. Each phase runs in its **own fresh conversation**: read this
file first, do only the next unticked phase, then tick it here and hand over the commit message
plus the kickoff line for the next phase.

## Progress

- [x] Step 0: Save roadmap and convention additions
- [x] Phase 0: Foundation
- [x] Phase 1: Multi-tenant auth and roles
- [x] Phase 2: Inventory catalog
- [x] Phase 3: Stock transactions
- [x] Phase 4: Dashboard and alerts
- [x] Phase 5: Smart Analyzer
- [x] Phase 6: Shops, users and settings
- [x] Phase 7: PWA hardening
- [x] Phase 8: Tests and release

Kickoff line for a new conversation:

```
Start Phase <N> of the Moti roadmap (.claude/references/roadmap.md). Plan first, wait for my approval.
```

## Decisions log

- 2026-09-24: optional selling price on items is kept (display-only).
- 2026-09-24: brand colour is shadcn's neutral (black/white) palette; no custom accent.
- 2026-09-24: Phase 0 built before a Supabase project exists; the user creates one and fills
  `.env.local` before running the app (the env guard throws without it).
- 2026-09-24 (Phase 0): theme is its own persisted `store/common/theme.store.ts`, outside the
  sign-out reset. Placeholder "M" icons in `public/`; final icons in Phase 7.
- Carried to Phase 1: `SidebarUserMenu` (needs auth), user-scoping the sync queue, route guards,
  replacing the `pages/Home` placeholder.
- Carried to the first write (Phase 1/2): `hook/common/mutation.hook.ts` with the "saved offline"
  message. It needs a toast; shadcn's React Aria choice is `sonner` (`npx shadcn@latest add sonner`),
  a new dependency to confirm then.
- Carried to Phase 5: the `date` field type in `FormField` (aria `calendar`) for the custom range.
- 2026-09-24 (Phase 1): role and shop are looked up in `profiles` on every request (security-definer
  helpers), not carried in the JWT, so deactivation and suspension apply immediately.
- 2026-09-24 (Phase 1): the roadmap's `current_role()` helper is `app.current_user_role()`, because
  `current_role` is a reserved word in Postgres. Extra helper `app.profile_shop_id()` ignores the
  active flags so a locked-out user can still read why.
- 2026-09-24 (Phase 1): the seed adds a second shop with its own owner (`owner.b@moti.test`) for the
  tenant isolation check. All demo logins share the password `Moti-demo-123`.
- 2026-09-24 (Phase 1): Inventory, Dashboard and Shops are "Coming soon" placeholders
  (`pages/Placeholder/ComingSoonView.tsx`, note in the route `handle`); each phase swaps its page in.
- 2026-09-24 (Phase 1): the superadmin's picked shop lives in `store/data/shop/shop.store.ts`;
  screens read the working shop through `useActiveShop()` in `hook/data/shop/shop.list.hook.ts`.
- 2026-09-24 (Phase 2): quantities are whole numbers; SKU is required and unique per shop; a
  category with items can't be deleted; item detail is its own page (`/inventory/:itemId`);
  categories are managed in a modal on the Inventory screen.
- 2026-09-24 (Phase 2): Low = on-hand ≤ reorder level + ceil(reorder level × margin %).
- 2026-09-24 (Phase 2): every catalog write is a security definer RPC keyed by a client id; the
  tables have select policies only. `record_stock_movement` exists now (Phase 3 builds its UI) and
  accepts the device's time, clamped to now, for offline sales.
- 2026-09-24 (Phase 2): `sonner` added via shadcn (brings `next-themes`, unused: `AppToaster`
  passes the theme store's value). `useAppMutation` is the shared mutation hook.
- Carried to Phase 3: clearing an item's category from the form (the select has no "none" option yet);
  movement history on the item detail page. (Both done in Phase 3.)
- Carried to Phase 7: sign-out confirmation while writes are queued.
- 2026-09-24 (Phase 3): history reads the `stock_movement_history` view (security_invoker: ledger
  + item name/SKU/unit + recorder's name). No table or RPC changed.
- 2026-09-24 (Phase 3): the stock form's `client_id` is fixed when the form opens, so a retried
  submit is recorded once. An RPC write that fails on the network is queued, not shown as an error.
- 2026-09-24 (Phase 3): Sell is on the item page (row → Sell → Record sale), not on each list row;
  managers also get Sell / Add stock / Deduct in the row menu.
- 2026-09-24 (Phase 3): a write the server refuses during a flush is marked `failedId` and holds
  the queue; the topbar cloud button opens the Sync issues sheet to retry or discard it.
- Carried to Phase 5: a date-range filter on the Stock movements page (needs the `date` field).
- Carried (bug, pre-existing): `TablePagination` and `useDebouncedSearch` ignore the `pageSize`
  default given to `usePagination`, so the inventory pager counts in 8s while the query pages by 10.
  Movement tables use the store default (8) to avoid it.
- 2026-09-24 (Phase 4): dashboard counts and alerts read two security_invoker views
  (`inventory_stock_summary`, `inventory_attention_items`) built on `inventory_item_status` with
  the Inventory list's "not archived" rule, so counts equal the Inventory tabs. No table or RPC changed.
- 2026-09-24 (Phase 4): an alert is any Low, Reorder or Out item; the bell and badge are red when
  anything is out, amber otherwise. Only the Dashboard nav entry carries the badge; staff see none.
- 2026-09-24 (Phase 4): summary and alerts re-check every 60 s while online (refetch-on-focus is
  off app-wide), and every item or stock write invalidates them. A status tile opens Inventory on
  that tab with search and category cleared.
- 2026-09-24 (Phase 5): the analyzer is three security-invoker SQL functions (`analyzer_volume_ranking`,
  `analyzer_period_summary`, `analyzer_reorder_items`) over the ledger; RLS on `stock_movements` keeps
  staff out. Dates are resolved in `shop_settings.timezone` by `app.shop_period_bounds`. No table changed.
- 2026-09-24 (Phase 5): only items that moved in the period are ranked (ties share a rank); archived
  items are left out; the summary cards cover the whole shop and ignore the table filters; the
  "Stocked, not sold" card is hidden under Added.
- 2026-09-24 (Phase 5): the client computes Monday–Sunday weeks and calendar months with
  `@internationalized/date` (now a direct dependency) in the shop's timezone (`useShopTimezone`).
- 2026-09-24 (Phase 5): date ranges use `DateRangeFilter` (aria `RangeCalendar` in a Popover); the
  `FormField` date type is still unbuilt because no form needs a date. The Stock movements page
  now has the carried date-range filter.
- 2026-09-24 (Phase 5): formulas open from a tap-to-open `InfoHint` (tooltips never open on touch):
  one per summary card, one per table listing its columns. aria table headers can't hold a button.
- 2026-09-24 (Phase 5): the shadcn aria-vega `calendar` imports `cn` from a package named `cn`; the
  package was removed and that one import points at `@/utils/cn.utils`. Re-check after re-adding it.
- Carried to Phase 7: with Analyzer, the superadmin's phone tab bar has six tabs.
- 2026-09-25 (Phase 6): the `manage-staff` Edge Function (service role) creates accounts and resets
  passwords, checking the caller's profile first: the superadmin adds owners or employees to any shop,
  an owner adds employees to their own shop only. The server generates the temporary password and shows
  it once. If the profile insert fails, the auth user is deleted.
- 2026-09-25 (Phase 6): `profiles.email` is copied from `auth.users` by a before-insert trigger (and
  filled in for existing rows), because clients can't read `auth.users`. A user's role, shop and email are
  fixed at creation; `update_staff_profile` changes only the name and the active flag, and never your own row.
- 2026-09-25 (Phase 6): a temporary password is marked by `user_metadata.must_change_password`. Home
  shows a reminder until the user changes it in Settings. It is a nudge, not a block.
- 2026-09-25 (Phase 6): a deactivated user or suspended shop is refused by RLS on the next request.
  `useMe` re-checks every 60 s while online, so the locked-out screen follows. The guard keeps the
  loaded profile when a background re-check fails.
- 2026-09-25 (Phase 6): the Users screen is one list for owners (their shop) and the superadmin
  (all shops, with shop and role filters). Settings (`/settings`) is off the tab bar and opens from
  the account menu. `shop_settings.timezone` is checked against `pg_timezone_names` by a trigger.
- 2026-09-25 (Phase 6): `useAppMutation` takes an optional result type for online-only calls that
  answer with data. `IFieldConfig.searchable` passes type-to-filter through to the select.
  `pages/Placeholder/ComingSoonView.tsx` is no longer routed but is kept.
- Carried to Phase 7: the superadmin's phone tab bar now has seven tabs (Users added).
- 2026-09-25 (Phase 7): final app mark from `src/assets/moti reference.png`: white M with a red motion
  slash on the #171717 tile, drawn as `public/favicon.svg`. Every icon in `public/` is generated from it
  with `yarn generate-pwa-assets` (`pwa-assets.config.ts`, dev dependency `@vite-pwa/assets-generator`).
  The red lives only in the icon art; the UI keeps the neutral palette.
- 2026-09-25 (Phase 7): install is offered by a dismissible banner in the shell (dismissal persisted
  per device) and always by the Install app card in Settings; iOS gets Share → Add to Home Screen steps.
- 2026-09-25 (Phase 7): signing out offline clears the session on this device only (`scope: "local"`).
  With queued writes, sign-out asks first; the writes stay queued for that user's next sign-in.
- 2026-09-25 (Phase 7): the update prompt waits while the queue is flushing; the service worker checks
  for a new version hourly while online. `meta[name=theme-color]` follows the theme (the topbar surface).
- 2026-09-25 (Phase 7): the phone tab bar holds at most five entries. With more, it shows the first four
  in route order plus "More", a bottom sheet with the rest (`useTabBarMenu`, `TabBarMoreModal`). Owners and
  the superadmin get Home, Inventory, Movements, Dashboard + More; employees are unchanged. This closes
  the six/seven-tab items carried from Phases 5 and 6.
- 2026-09-25 (Phase 8): pgTAP tests live in `supabase/tests/*.test.sql` (tenant isolation, role access,
  stock ledger). Each file builds its own shops and users with `7e570000-…` ids, acts as a user through
  `tests.act_as(uuid)` and rolls back. They run locally with `supabase test db`, never against production.
- 2026-09-25 (Phase 8): hosting is Vercel (`vercel.json`: SPA rewrite, uncached `sw.js`/`index.html`/manifest,
  immutable `/assets/`, nosniff/referrer/no-framing headers). The production steps are in
  `.claude/references/release.md`; public sign-ups are turned off in the Supabase dashboard.
- 2026-09-25 (Phase 8): the Inventory list now uses the shared page size (8), which closes the pager bug
  carried from Phase 3. Topbar icon buttons, pager steps and the Rows picker are 44 px on phones.
- 2026-09-25 (Phase 8 security pass, `20260925000002_harden_grants_and_ledger.sql`): anon has no table
  access; authenticated has no TRUNCATE/TRIGGER/REFERENCES and no direct writes on categories, items,
  movements or profiles (only shops and shop_settings keep direct writes). A device time is clamped to
  the last 7 days. A replayed client id must match its item, and a replayed item or category id must be
  in the caller's shop. Measured at 20k items / 300k movements per shop: every query under 300 ms, no
  index change needed. Carried: route-level code splitting (one 1.44 MB bundle, 420 KB gzip).

## What changed from the discovery plan

| Area | Before | Now |
|---|---|---|
| Tenancy | One shop | **Multi-tenant from day one**: a `shops` table, and `shop_id` on every table and every RLS policy |
| Scope | Suppliers, cost, stock value | **Inventory only**: add stock, deduct stock. No suppliers, cost price, stock value or revenue. |
| Employee | Browse + sell + own history | **Browse inventory + record a sale.** Nothing else. |
| Owner | Everything in the shop | Everything in **their own shop** |
| Superadmin | Everything | **Everything in every shop**, plus shop and user management |
| Analyzer | Many insights | **Volume ranking** by week, month or custom range, plus the reorder list. Fast/slow classes and trends move to LATER. |

**Selling price (decided 2026-09-24: keep):** each item has one optional **selling price** so the counter can quote customers. It is display-only: no revenue math.

## Who sees what

| Capability | Superadmin | Owner | Employee |
|---|:-:|:-:|:-:|
| Browse and search inventory, on-hand, status, price | all shops | own shop | own shop |
| Record a sale (deduct) | ✓ | ✓ | ✓ |
| Add stock, deduct as damaged or correction | ✓ | ✓ | ✗ |
| Create, edit and archive items and categories; set reorder level | ✓ | ✓ | ✗ |
| Movement history, dashboard, alerts, analyzer, reorder list | all shops | own shop | ✗ |
| Manage employees | all shops | own shop | ✗ |
| Manage shops and owners | ✓ | ✗ | ✗ |
| Shop settings | all shops | own shop | ✗ |

**How the superadmin (you) sees everything:**
- `profiles.shop_id` is empty for superadmin.
- Every RLS policy has the form `app.is_superadmin() or (shop_id = app.current_shop_id() and <role rule>)`.
- In the UI, a **shop switcher** in the top bar is visible only to superadmin. Choosing a shop opens every owner screen for that shop. The Shops and All-users screens work across shops.

**Tenant safety:**
- `shop_id` is always set on the server, never taken from the client.
- Composite foreign keys (`item_id, shop_id`) make it impossible to link a record to another shop's item.
- A suspended shop (`shops.is_active = false`) locks out its owner and employees.

## Data model (V1)

| Table | Purpose |
|---|---|
| `shops` | Tenant: name, is_active. Only superadmin writes it. |
| `shop_settings` | 1 row per shop: default reorder level, low-stock margin %, timezone |
| `profiles` | User: shop_id (empty for superadmin), role, full_name, is_active |
| `categories` | Per-shop grouping |
| `inventory_items` | Per shop: sku, name, category, brand, part number, fitment, unit, on_hand, reorder_level, selling price (optional), location, archived_at |
| `stock_movements` | Append-only ledger: type `stock_in` / `stock_out`, reason, signed quantity, balance_after, occurred_at, created_by, client_id (idempotency key) |

**Reasons and permissions:**
- `stock_in` reasons: `restock`, `opening_balance`, `correction`.
- `stock_out` reasons: `sale`, `damaged`, `correction`.
- Employees can only record `stock_out / sale`.

**Stock status** (unchanged from the discovery plan):

| Status | Rule |
|---|---|
| Out of stock | on_hand = 0 |
| Reorder | on_hand ≤ reorder_level |
| Low | within the low-stock margin above the reorder level |
| In stock | otherwise |

## Smart Analyzer V1

- **Periods:**
  - **Week** is the calendar week, Monday to Sunday.
  - **Month** is the calendar month.
  - Both have ← → buttons to step back to earlier periods.
  - **Custom** takes the owner's own date range.
  - All dates use the shop's timezone.
- **Metric:**
  - **Quantity sold** (default) is the sum of `stock_out / sale` in the period.
  - A toggle switches to **Quantity added** (the sum of `stock_in`).
- **Table columns:** rank, item, category, quantity, number of transactions, current on-hand, status.
- **Sorting and filters:** highest → lowest by default, with a reverse toggle; filters for category and status.
- **Summary cards:** total units sold, items sold, top item, and stocked items with zero sales in the period.
- **Needs reorder tab:** items at or below their threshold, ordered Out → Reorder → Low, then by quantity sold in the last 30 days.
- Every number is a SQL aggregate over the ledger, and each has a tooltip with its formula.

## Roadmap

Each phase ends with `yarn build` + `yarn lint` clean and the commit message below. Commit messages are drafts: adjust the bullets to what was actually built. Claude suggests commits and never runs them. Every migration is written by Claude and **run by the user**.

### Step 0: Save roadmap and convention updates
Saves this roadmap in the repo and adds the missing conventions: `supabase/functions/`, `supabase/tests/`, manifest `orientation: "any"`, and the rule that the offline queue is idempotent and scoped to one user.
```
Update: Moti V1 Roadmap And Convention Additions

- Added V1 roadmap with phases, scope and role matrix
- Added Edge Function and SQL test folders to the folder law
- Added idempotent, user-scoped rule for the offline write queue
```

### Phase 0: Foundation
**Delivers:**
- Vite + React 19 + TS with yarn; `.gitignore`, `.env.example`.
- Tailwind v4 theme (light and dark, safe areas); shadcn aria-vega init.
- ESLint rules copied from crm-customer2.
- Utils (env, supabase, cn, format).
- Common stores and hooks (modal, confirm, pagination, filter, network, sync queue).
- The common components V1 needs.
- Responsive shell (sidebar, bottom tabs, top bar), routing, QueryClient.
- Installable PWA manifest and service worker.

**Done when:** the empty shell renders at 360 px and on desktop, in light and dark, and the app installs from `yarn preview`.
```
Feature: Moti App Foundation And PWA Shell

- Added Vite React TypeScript setup with Tailwind v4 and shadcn aria-vega
- Added Supabase client, env guard and error mapping
- Added common stores for modals, confirm, pagination, network and offline queue
- Added responsive app shell with sidebar, bottom tab bar and top bar
- Added installable PWA manifest and service worker precache
```

### Phase 1: Multi-tenant auth and roles
**Delivers:**
- Migration: `shops`, `shop_settings`, `profiles`, role enum, helpers (`is_superadmin`, `current_shop_id`, `current_role`), tenant RLS.
- Seed SQL for a superadmin, a demo shop, an owner and an employee.
- Login page, session store, permission model, route guards, role-filtered nav.
- Superadmin shop switcher.

**Done when:** each role sees only its nav; direct URLs are blocked; an owner of shop A gets zero rows from shop B (checked in SQL).
```
Feature: Multi-Tenant Auth And Role-Based Access

- Added shops, shop settings and profiles with tenant-scoped RLS
- Added email and password sign-in with session store
- Added role permissions, route guards and role-filtered navigation
- Added superadmin shop switcher with access to every shop
```

### Phase 2: Inventory catalog
**Delivers:**
- Migration: `categories`, `inventory_items`, `stock_movements`, status view.
- RPCs: create item (with its opening-stock movement), update item, record movement. The movement RPC locks the row, rejects negative stock, ignores repeats and applies the role rules.
- Inventory list: search by name, SKU, brand or fitment; status tabs; category filter; sort; paging; card rows on mobile.
- Item detail; item form; archive; categories management.

**Done when:** owners manage items, employees only browse, and nothing crosses shops. This slice gets recorded as the reference module in `project-map.md`.
```
Feature: Inventory Catalog With Stock Status

- Added categories, inventory items and stock ledger tables with RLS
- Added item create and update functions with opening stock
- Added inventory list with search, status tabs, filters and paging
- Added item detail, item form and category management
```

### Phase 3: Stock transactions
**Delivers:**
- **Record sale** (employee and owner), 3 taps on a phone.
- **Add stock** and **Deduct damaged/correction** (owner).
- Before→after stock preview.
- Offline queueing with a Sync issues sheet.
- Movement history per item and a global Stock movements page (owner).

**Done when:** on-hand always equals the ledger total, and an offline sale syncs exactly once.
```
Feature: Stock In And Sale Transactions With History

- Added record sale for employees and add or deduct stock for owners
- Added idempotent offline queueing for stock transactions
- Added per-item and shop-wide movement history
```

### Phase 4: Dashboard and alerts
**Delivers:**
- Owner dashboard: item count, units on hand, low / reorder / out counts, attention list, recent movements.
- Alerts bell and nav badges, computed from current stock and clearing themselves when restocked.

**Done when:** dashboard counts match the inventory filters exactly.
```
Feature: Owner Dashboard And Low Stock Alerts

- Added dashboard summary with stock status counts and recent movements
- Added alerts bell and badges for low, reorder and out-of-stock items
```

### Phase 5: Smart Analyzer
**Delivers:** analyzer SQL functions; Analyzer page with Week / Month / Custom, the Sold/Added toggle, sort direction and filters; summary cards; the Needs reorder tab.

**Done when:** results match a hand-calculated seed scenario.
```
Feature: Smart Inventory Analyzer With Volume Ranking

- Added movement volume ranking by week, month and custom date range
- Added highest-to-lowest sorting with category and status filters
- Added needs-reorder list ordered by severity and recent sales
```

### Phase 6: Shops, users and settings
**Delivers:**
- Edge Function that creates staff accounts with a temporary password (and resets passwords).
- Owner manages employees; superadmin manages shops, owners and all users, and can suspend a shop.
- Shop settings: default reorder level, low margin, timezone. Account settings: change password.

**Done when:** an owner can't create owners or reach another shop, and a deactivated user loses access immediately.
```
Feature: Shop, User And Settings Management

- Added staff account creation with temporary passwords via Edge Function
- Added employee management for owners and shop management for superadmin
- Added shop settings for reorder defaults, low-stock margin and timezone
```

### Phase 7: PWA hardening
**Delivers:** update prompt, install prompt and iOS hint, offline banner with pending count, sign-out guard while writes are queued, final icons, Lighthouse pass.
```
Feature: Offline Sync, Install And Update Prompts

- Added update and install prompts with iOS home-screen hint
- Added offline banner with pending sync count and sign-out guard
- Added final app icons and manifest polish
```

### Phase 8: Tests and release
**Delivers:** pgTAP tests for tenant isolation, per-role RLS and the movement function; accessibility and 360 px pass; production Supabase and hosting setup.
```
Update: Tenant Isolation Tests And Release Hardening

- Added SQL tests for tenant isolation, role access and stock ledger rules
- Fixed accessibility and mobile layout issues found in the release pass
```

**LATER (out of V1 on purpose):** suppliers, cost/value/revenue, purchase orders, fast/slow classes, days of cover, suggested quantities, trends, a persisted notification feed with read/unread, CSV import/export, barcode scanning, SaaS billing and subscriptions, push notifications.
