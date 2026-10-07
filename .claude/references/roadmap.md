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
- [ ] V1.3: notifications, visual test and audit (phases below), one conversation per phase;
      next up: Phase 6 (check on a phone), the user's own check on a real Android and iPhone
      (Phase 5 Batches 1–8 coded and checked, migration 7 applied; Phase 6 pre-check fixes coded)
- [x] V1.4: Autopilot loop (below): critique → decide → fix, round after round, until a round finds
      nothing left to fix (2026-10-03: converged after round 2; 4 questions wait in
      `.claude/state/autopilot/USER-DECISIONS.md`)
- [ ] LATER: SaaS build (multi-shop), analyzer, pgTAP tests
- [ ] TARTAR redesign (phases below), one conversation per phase

## TARTAR redesign

Moti adopts TARTAR's UI (`Ejie_Business/TARTAR`) on desktop and phone. Port TARTAR files rather
than invent; one phase per conversation, plan first.

Decisions (user, 2026-10-07):
1. Phone nav: keep a bottom tab bar, restyled as TARTAR's floating `AppTabBar` (not TARTAR's drawer).
2. Tables: port TARTAR's column model (`IDataTableColumn` + `DataTableList` mobile roles), drop TanStack `ColumnDef`.
3. Colour: keep Moti's orange palette; adopt only TARTAR's token names (brand*, radius, shadow, type
   scale) with Moti values. Plus Jakarta Sans (`@fontsource-variable/plus-jakarta-sans`) replaces Geist.

- [x] Phase 1 (2026-10-07): tokens, font, breakpoints — TARTAR token names in orange, `compact` /
      `wide` / `toolbar-searching` variants, radius/shadow/type scales, warm `bg-app` gradient,
      `useIsCompact` (keyboard inset already in upstream `useKeyboardInset`); Moti `text-sm/md/lg`, `shadow-card-*` and `pb-safe` kept for now
- [x] Phase 2 (2026-10-07): shell — `AppShell` returns `PhoneShell` (AppBar + scroll box + floating
      `TabBar`) on compact, `AppHeader` + sidebar panels on wide; `AppSheet` (+ swipe, close on
      navigate) with the compact account sheet; `pb-safe` = max(1rem, inset), `pb-safe-4` /
      `pb-tabbar` / `--spacing-tabbar` and `Topbar` removed; shell styles on `compact:` / `wide:`;
      Google Fonts runtime caching dropped. `AppBar` always shows the title (ContentView hides its h1)
- [x] Phase 3 (2026-10-07): `ContentView` ports TARTAR's head (large `h1` at every width, `back`
      above the title, `tabs` slot + divider; actions keep a full-width row on compact),
      `surface="card"` dropped; `ContextSwitch` + `ISegmentOption` ported but not yet used;
      `AppBar` fades the title in past 44 px; bento on `wide:`; `media.hook.ts` and
      `--spacing-topbar` deleted; skills say AppBar/AppHeader. `ViewTabs` / `SegmentTabs` stay
      until their screens move to ContextSwitch (phases 4 and 7)
- [ ] Phase 4: table / filter system
- [ ] Phase 5: form / modal / detail kit
- [ ] Phase 6: cards and states
- [ ] Phase 7: migrate screens (Inventory, Transaction, Movements, Users, Masterfile, Dashboard,
      Account, Auth); retire Moti `text-sm/md/lg` overrides and `shadow-card-*`

## V1.4: Autopilot loop

Run with `/autopilot`. State lives in `.claude/state/autopilot/` (`NEXT_PROMPT.md`, the round
reports and decisions, `USER-DECISIONS.md` for what only the user can decide, `LOG.md`).

### Round 1 (2026-10-03) — 25 findings: 15 fix now, 3 defer, 3 leave, 4 user decides
Report: .claude/state/autopilot/round-1-critique.md
- [x] Batch 1: sync and failure paths — QA-01, QA-03, QA-02 — `store/common/sync.store.ts`,
      `utils/error.utils.ts`, `routes/index.ts` + a root error element in `components/common/status/`,
      `components/common/table/DataTable.tsx` + the list hooks — Development v1.24
- [x] Batch 2: contrast and touch quick wins — A11Y-01, MOB-02, UI-04, UX-03, UI-02, MOB-04 —
      `styles/common/theme.css`, `styles/layout/auth.styles.ts`, `styles/view/tabs.styles.ts`,
      `AccountMenu.tsx` + its styles, `AccountProfileCard.tsx`, `TransactionDetailModal.tsx`,
      `TransactionHistoryTable.tsx`, `components/common/form/FormField.tsx` — Development v1.25
- [x] Batch 3: phone shell and lists — UX-01, UX-02, MOB-03, UI-01 — `StockAlertsList.tsx`,
      `NotificationCenterModal.tsx`, `AttentionPanel.tsx`, `pages/Account/AccountView.tsx` + a new
      account card, `TablePagination.tsx`, `styles/table/pagination.styles.ts`,
      `styles/dashboard/dashboard.styles.ts` — Development v1.26
- [x] Batch 4: sheet back gesture and cart quantity — MOB-01, UX-04 — `hook/common/sheet.hook.ts` +
      `store/common/sheet.store.ts` (new), `components/common/modal/AppModal.tsx`, `ConfirmationModal.tsx`,
      `App.tsx`, `CartModal.tsx` + a new `CartQuantityInput.tsx`, `styles/transaction/transaction.styles.ts`
      — Development v1.27

### Round 2 (2026-10-03) — check round: 15 of 15 Round 1 findings hold, 0 regressions; 0 fix now, 3 defer, 0 leave, 0 user decides
Report: .claude/state/autopilot/round-2-critique.md
No batches: nothing in scope. The loop converged after round 2 (`.claude/state/autopilot/STOP`).
Still open for the user: the 4 questions in `USER-DECISIONS.md`, and a check on a real phone (back
gesture, digit pad, daylight contrast).

### Backlog (`defer`: new and unrelated to a round's plan, never a reason for another round)
- BL-01: the push prompt takes the top third of the bell until it is answered.
- BL-02: on a phone the push prompt's sentence breaks inside "sign-ups".
- BL-03: on desktop the cart sheet's quantity field is 44 px beside 40 px − and + buttons.
- From round 1, deferred: PROD-01 (search Stock history), QA-04 (re-check the session on a
  permission error), OPS-01 (build + lint on push).

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
   - [x] Run the role probe: both roles, 24 checks (V1.3 Phase 4, 2026-10-02)
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
- [x] Every screen, every role (signed out, owner, employee, developer — the user signed in the
      developer in a visible window): sign-in, register, forgot password, dashboard, transaction
      (cart + checkout), inventory, masterfile, history + void, team approvals, my account, bell
- [x] Phone (390), tablet (820), desktop (1440), light and dark: 203 full-page screenshots in
      `C:/Users/CCLISO~1/AppData/Local/Temp/claude/c--Users-cclisondato-Documents-MyProgramming-Ejie-Business-Moti/f093b466-7ff7-4fdd-a7b1-ecb19fdd9a0b/scratchpad/shots/<role>/<screen>-<size>-<theme>.png`
      (`report.txt` and the scripts `visual.mjs`, `probe.mjs` sit next to them)
- [x] Employee sees the test item on Transaction (`BRA-UMA-000001` "Front"; the Brembo item of
      step 2 is now this Uma Racing item)
- [x] API role probe, both roles: 24 checks, all as designed (2 noted below)
- Works: sign-up → pending refused → owner approves in Team → sign-in; UI checkout #4 (stock
  27 → 26) and void from History (back to 27); employee nav is Sell + Account only and typed
  URLs land on Transaction; zero console errors, failed requests or sideways page scroll.
- Found (for Phase 5, nothing fixed):
  1. Phone History cards overlap and scramble: `TransactionHistoryCard` is an `AppButton`, whose
     fixed height and centred no-wrap layout squash the two rows. Also "1 items" (no plural).
  2. Tables inside `ViewTabs` clip their last column: Transaction "Add" at 1440, History Total +
     Status at 820, Masterfile row menu on phone. Likely the underline panel's `p-6` plus a
     `flex-1` panel without `min-w-0`; tab panels also sit indented from the page header.
  3. Tablet (820) keeps the full sidebar, so Inventory's table clips Status and the header
     actions stack awkwardly; Masterfile on phone renders a table, not cards.
  4. Touch targets under 40 px on phone/tablet: Show password, segment filters (All/Low/Out…),
     tabs, row menus, Rows per page, auth links.
  5. "Brake pad set" still has its pre-V1.2 code `BPS-1` (regenerated by migration 7).
  6. API, by design today: employees can read archived items (`inventory_items_select` is
     `app.is_staff()`) and call `inventory_summary` (no role check). A repeat void is a no-op
     by design (offline replay), confirmed: no second stock return.
  7. The stock-alerts header shows "Restock" even when the list is "All stocked up".
- Test data left: approved employee `moti.visual.muqu8jcr@example.com`, transaction #4 voided.

### Phase 5: Audit
Run 2026-10-03: 141 screenshots (signed out, owner, employee at 360 / 820 / 1440, light and dark,
plus forced loading / error / empty), measured for sub-44 px targets, clipping and console errors.
- [x] UI and UX: on a phone it must feel like a native mobile app (PWA); on tablet and desktop, a
      web app. Layout, navigation, touch targets, safe areas, the four data states, typography,
      consistency
- [x] Architecture as it stands now, with suggestions (0 layer-law violations; RLS sound)
- [x] Report ranked by severity, with screenshots: https://claude.ai/artifact/TkmJx2sUyrQnoiokLPzUe7
      (6 High, 9 Medium, 8 Low; Phase 4 findings 1–7 folded in). Nothing fixed yet.
- [x] User decided (2026-10-03, all option A; see Decisions log)

### Phase 5 fixes, one batch per conversation
Each batch gets its own plan and approval, except Batch 1, which is already approved.
- [x] **Batch 1: phone fixes** (H1 H2 H3 M7 L1 L2 L4). Coded 2026-10-03, `yarn build` + `yarn lint`
      clean. UI only, no migration.
  1. `styles/common/theme.css`: inside `@layer base`, a `@media (pointer: coarse)` block giving
     `min-height: 2.75rem` to `[data-slot]` button, input, input-group, select-trigger,
     tabs-list, toggle-group-item, combobox-trigger, dialog-close, sheet-close; plus
     `min-width: 2.75rem` for `[data-slot="button"][data-size^="icon"]`, combobox-trigger,
     dialog-close, sheet-close. The user approved this one global size rule (option A over
     per-wrapper classes) because the dialog close buttons live in generated `components/ui`.
     `DialogClose` overrides `data-slot` to `dialog-close`, so it needs its own selector.
  2. New `components/common/card/PressableCard.tsx`: a `react-aria-components` `Button` with no
     button styling (common may import react-aria directly, as `RouteRoot` does). Style
     `pressableCard` goes in `styles/cards/card.styles.ts`: column flex, card border and padding,
     `data-[pressed]` and `data-[focus-visible]` states.
  3. `components/transaction/cards/TransactionHistoryCard.tsx`: use `PressableCard`, not
     `AppButton`, whose `h-9` + nowrap caused the overlap.
  4. `styles/view/tabs.styles.ts`: underline `viewTabsContent` `p-6` becomes a top gap only.
  5. New `components/masterfile/cards/MasterfileCard.tsx` + `styles/masterfile/masterfile.styles.ts`
     (name, item count, date added, ⋮ menu; copy `UserCard` in `UserTable.tsx`). Pass it as
     `renderCard` in `CategoryTable.tsx` and `BrandTable.tsx`.
  6. `NotificationCenterModal.tsx`: show "Restock" only when `useStockAlerts` has rows.
  7. `utils/format.utils.ts`: `formatCount(count, singular, plural = singular + "s")`; use it in
     `TransactionHistoryCard` ("1 item"), `CartBar.tsx` and `CartModal.tsx` ("1 pc").
  8. `CartModal.tsx`: when nothing has a price, the total reads "No prices set" instead of "—".
  - Validate: `yarn build` + `yarn lint`, then retake History, Masterfile, sign-in, cart and
    bell at 360 px, light and dark (preview on `127.0.0.1` only).
  - [x] Signed out (sign-in, register, forgot password) at 360 px with a touch pointer, light and
        dark: every button and link ≥ 44 px, zero console errors. The text input inside an input
        group stays 36 px tall in its 44 px frame (tapping the frame's edge does not focus it).
  - [x] History, Masterfile, cart and bell at 360 px, light and dark (2026-10-03): History cards
        clean ("1 item · 1 pc"), Masterfile cards, cart "No prices set", Restock hidden when all
        stocked. Left: the checkout receipt still says "1 pcs" (Batch 6)
- [x] **Batch 2: reliability** (H5 M1 M2 H6). Coded 2026-10-03, `yarn build` + `yarn lint` clean.
  1. `utils/error.utils.ts`: `NetworkError`, `isFetchFailure` (supabase-js reports a failed fetch
     as `{ message: "TypeError: …", code: "" }`) and `isNetworkError`; `toError` returns a
     `NetworkError`. React Query no longer retries network errors (supabase-js already retries
     GETs 3× with 1/2/4 s backoff), so the offline message shows after ~7 s, not 16 s.
  2. `sync.store.ts`: flush sets a refused write aside (`failure` on the entry) and sends the
     rest; a network error stops the run. Entries are removed by id (a write enqueued mid-flush
     was lost before). Any sent write invalidates all queries. `runWrite` also queues on a
     network error and flushes after a successful send; `useNetwork` flushes on foreground.
  3. The sync badge opens `SyncQueueModal` (label, queued time, reason, Discard with confirm,
     Retry). Replays of category/brand add or delete after a lost response show there as
     failures (duplicate / changed nothing) to discard.
  4. `hook/common/update.hook.ts` (`useAppUpdate`, in App): `useRegisterSW`, hourly update check,
     toast "New version ready · Reload", hidden while the queue flushes. `registerSW.js` is no
     longer injected.
  - [x] Checked 2026-10-03. Update toast: pass (changed `sw.js` → toast → Reload activates it).
        Connected without internet: pass (queued in 0.3 s, "1 waiting", sheet, Retry sends).
        **Device offline: fail** — the sale spins and never queues; it goes through when the
        connection returns (Batch 6, item 1). Test sales #5 and #6 voided, stock back to 27
- [x] **Batch 3: native feel on phones** (M4 M5 M6 L3 L5 L6). Coded 2026-10-03, `yarn build` +
      `yarn lint` clean. UI only, no migration.
  1. Tabs: `IRoute.tabParent` keeps a route in the sidebar but off the phone tab bar and lights
     its parent tab; `useTabMenu` feeds `TabBar`. Team has `tabParent: "account"`; Stock history's
     tab reads "Stock". `TeamLinkCard` (own `BentoCell`, `manageUsers` only) sits on Account at
     every width (user's choice).
  2. Title once: on phones `ContentView`'s heading is `sr-only` (the topbar shows the title); a
     title-only header leaves the layout entirely.
  3. List on the background: `TablePanel` on phones renders toolbar, cards and pager in a plain
     stack (no `SectionCard`; it drops title/actions there, unused today). The pager loses its
     rule and padding below `md`.
  4. Filter sheet: `FilterSelect` (one select, shared) and `FilterSheet` (Filters button with a
     count badge → `AppModal` with the selects, Clear + Done; key `filter-sheet:<filterKey>`).
     `FilterToolbar` on phones: search + Filters in one row, the domain's controls below.
     `IFilterControl` moved to `models/common/filter.model.ts`. Segment controls (`sm`) stretch
     to equal columns on phones.
  5. Dates: `formatDateTime` reads "Oct 2, 18:52" (year added when not this year, `h23`).
  6. Status bar: `--status-bar` token (light `--primary`, kept orange by choice; dark `--panel`),
     written into `<meta name="theme-color">` by `useApplyTheme`. The manifest has one
     `background_color`, so the launch screen stays white in dark mode.
  7. Stat cards: on phones they stack (icon, value `text-2xl` drawn first, label); hint hidden.
  - [x] 360 px check, owner, light and dark (2026-10-03): five tabs, Team lights Account, filter
        sheet + "1 on" badge on Inventory and Sell, single title, stacked stat cards, status bar
        `#ea580c` / `#18181b`; no sideways scroll, 0 console errors. Left for Batch 6: in light
        mode `dataTableTray` (`bg-background`, white) paints a panel behind the card lists on
        the grey `bg-app`; the filter sheet's close X sits lower than its title.
- [x] **Batch 4: tablet and desktop** (H4 M3 M8). Coded 2026-10-03, `yarn build` + `yarn lint`
      clean. UI only, no migration.
  1. Root size: `theme.css` drops the `0.7vw` desktop scale, the `--root-floor` steps and the
     `svg.lucide[width]` rem rules; every width uses the browser's 16 px, so zoom works.
  2. Icon rail from `md` to `lg`: `sidebar.styles.ts` `md:max-lg:` variants (`w-18`, group
     labels and item text `sr-only`, icon centred). `AppSidebar` wraps items in `AppTooltip`
     (new `isDisabled` prop), on only in that band via `useMediaQuery` (new
     `hook/common/media.hook.ts`, `useSyncExternalStore`).
  3. Code-splitting: every page (public and protected) uses React Router's `lazy: { Component }`
     instead of `React.lazy`, so the chunk loads alongside the permission loader with no
     Suspense. The root route has an empty `HydrateFallback`. First load went from one 1.36 MB
     chunk to about 0.98 MB (entry 390 kB + shared vendor chunk 515 kB, which Rolldown names
     `format.utils-*.js` + small stores); 124 + 148 kB gzip. The 500 kB warning stays on the
     vendor chunk (supabase, react-aria, react-query, all used by the shell). Workbox still
     precaches every chunk, so offline navigation is unchanged.
  - [x] Checked 2026-10-03 at 820, 1024, 1280, 1440 and 1440 zoomed 125 / 150 %, light and dark:
        root 16 px at every width, rail at 820 and 960, full sidebar from 1024, no page scroll,
        0 console errors. Rail tooltips show on keyboard focus; hover could not be proven
        headless (a known button tooltip fails the same way) — check with a real mouse.
        **Tables still clip** (Batch 6, item 2): Inventory, Sell, Stock history and Team scroll
        sideways inside their card at 820 and 1024 (Actions / Add / By out of view); Sell's Add
        is cut at 1280 and 1440 too. The toolbar search shrinks to an icon-wide box at 820–1024.
- [x] **Batch 5: database and housekeeping** (M9 L7 L8). Coded 2026-10-03, `yarn build` +
      `yarn lint` clean.
  1. Migration 7 (`20261003000007_restrict_archived_items_to_owners.sql`): `inventory_items_select`
     is `app.is_owner() or (app.is_staff() and archived_at is null)`; `inventory_summary` raises
     `42501` for non-owners; every code not shaped `XXX-XXX-000000` (only `BPS-1` known) gets the
     next number of its category + brand series, through `app.item_code_series`. An item without
     a usable category or brand keeps its code and is listed by `raise notice`.
  2. `src/hook/account/` moved to `src/hook/data/account/` (folder law; user's choice A).
  3. `useFilters` sets the table back to page 1 with the filter change (filter key = table key);
     the four `useEffect` page resets in the list hooks are gone, so the old page is not fetched
     first, and opening a page no longer resets its page number.
  - [x] User applied migration 7 in the SQL editor (2026-10-03); "Brake pad set" is `BRA-UMA-000003`
  - [ ] User: delete `src/pages/Home/HomeView.tsx`
  - [x] API probe (2026-10-03), 5/5: employee sees 2 items, owner 3 (1 archived); employee
        `inventory_summary` → 403 `42501`, owner gets its summary; every code has the new shape
- [x] **Batch 6: fixes from the checks** (approved and coded 2026-10-03, `yarn build` + `yarn lint`
      clean). UI only, no migration.
  1. Offline sale never queues: TanStack Query's default `networkMode: "online"` pauses every
     mutation while `navigator.onLine` is false, so `runWrite` never runs; `useAppMutation` also
     awaits `invalidateQueries`, whose refetches pause offline. Fix: mutations
     `networkMode: "always"` in the QueryClient defaults (reads stay paused), and invalidation
     is fired, not awaited. Writes outside `runWrite` (sign-in, push) now fail offline with the
     network error instead of spinning.
  2. Tables clip at 820–1440. Cause, measured: `tableCellActions` put `w-px` on the div inside
     the cell, so the column sized to 1 px and its buttons spilled past the table (all of the
     1280 / 1440 clipping). `w-px` dropped. Below `xl` the panel is ~630 px (the full sidebar at
     1024 leaves no more room than the rail at 820), so a column option `meta.hideBelow`
     (`"lg" | "xl"`, `ColumnMeta` augmented in `dataTable.config.ts`, applied by `DataTable` to
     head, skeleton and cells) hides Category + Warn at (Inventory), Category (Sell) and Left
     (Stock history) below `xl`; Stock history's By cell wraps its note (`itemMeta`'s `truncate`
     had kept it on one line). Toolbar search `md:min-w-56`, so the controls wrap instead.
  3. Phone light lists: the card list's tray is transparent on phones; the filter sheet's
     title shares the close X's line (as the dialog header does).
  4. Checkout receipt "1 pcs": `formatCount(receipt.totalQuantity, "pc")` in `CheckoutSuccessModal`.
  - [x] Re-checked 2026-10-03, all pass, 0 console errors. Device offline: checkout shows
        "Saved offline · 1 item · 1 pc" in under 2.5 s, "Offline · 1" badge, back online it
        sends (#7 Completed), voided, stock back to 27. Tables: 0 overflow on all 6 table
        screens at 820 / 1024 / 1280 / 1440, light and dark; search ≥ 224 px. 360 px: every list
        sits on the `bg-app` grey (dark `#0e0e10`); filter sheet title and ✕ share one centre line.
- [x] **Batch 7: native list rows on phones** (`design-plan.md` §2, §10, §11; plan + approval first)
  Every phone list is still a stack of bordered, shadowed cards (7 lists), which the design
  plan rules out: rows sit in one list surface, hairline dividers, 1–2 lines, the value or
  status trailing, a chevron when the row opens something.
  1. New `components/common/list/ListGroup.tsx` (one surface, dividers) and `ListRow.tsx`
     (title, subtitle, trailing slot, chevron, ≥ 56 px, pressable through react-aria `Button`);
     `DataTable`'s phone branch renders `renderCard` rows inside a `ListGroup`.
  2. Pilot on Inventory only; the user checks screenshots before the pattern spreads.
  3. Then Sell picker (trailing Add / stepper stays on the row), History, Stock history, Team,
     Categories and Brands. A row opens its existing detail sheet; ⋮ menus move into the
     sheet where one exists.
  4. Remove `PressableCard`, the six `*Card` row components and their card styles.
  - [x] Pilot coded 2026-10-03, `yarn build` + `yarn lint` clean. User's choices: "Add stock"
        only in the item sheet; price only in the sheet. `ListRow` (title, subtitle, trailing,
        `onPress` → react-aria `Button` + chevron) and `ListGroup` (`<ul>`, one `bg-card` surface,
        `divide-y`), styles in `styles/list/list.styles.ts`. `DataTable` takes `renderRow`
        (phones: rows in a `ListGroup`, skeleton rows; empty/error outside it), kept beside
        `renderCard` until every list moves. `InventoryItemRow`: name / `code · brand`, on-hand +
        unit over the status as text (only Low / Out coloured). The sheet footer gives owners
        Archive / Restore + Edit item (each closes the sheet first). `InventoryItemCard` deleted.
        shadcn `item` was not used: it renders a div or link, not a pressable button.
  - [x] 360 px check, owner, light and dark: rows 62 px, no sideways scroll, Edit hands off to
        the form, 0 console errors.
  - [x] User approved the pilot 2026-10-03.
  - [x] Steps 3 + 4 coded 2026-10-03, `yarn build` + `yarn lint` clean. `ListRow` gained an
        `action` slot (Add / stepper / ⋮, outside the row button; ⋮-wide even when empty so
        trailing values line up) and `text-base` (lists inside tabs had inherited `text-sm`).
        Rows: Sell `₱price · N pc left` + Add / stepper; History `#n` / `date · by`, total over
        the status (user's choice: Voided red, its total struck through); Stock history
        `reason · date · by`, signed qty over `N pc left`; Team `role · email`, status (Pending
        amber, "Reset asked") + ⋮; Categories / Brands `Added date`, item count + ⋮ (no sheet
        exists for users, categories or brands, so their ⋮ stays on the row). `DataTable` lost
        `renderCard`; `PressableCard`, the five `*Card` rows, `UserCard`, `masterfile.styles.ts`
        and the card styles are gone.
  - [x] 360 px check, owner, light and dark, all 7 lists: rows 62–63 px, no sideways scroll,
        Add does not open anything, History row opens its sheet, ⋮ opens its menu, 0 console
        errors.
  - Found during the check, for later: the transaction sheet reads "1 · 1 pcs" (should be
    "1 pc"); the Team ⋮ menu wraps "Set password" onto two lines.
  - Found during the check, for Batch 8: `pb-safe` overrides the sheet footer's `p-4` bottom, so
    on phones without a home indicator every sheet's last button touches the screen edge
    (use `max(1rem, env(safe-area-inset-bottom))`); the pager reads "No records" while a list
    loads.
- [x] **Batch 8: native shell polish** (`design-plan.md` §8, §22, §23). Coded 2026-10-03,
      `yarn build` + `yarn lint` clean. UI only, no migration.
  1. Sign-in, register, forgot password: below `sm` the form sits flat on `bg-app` (no card
     border, shadow, radius or zoom-in), 24 px gutters; the card stays from `sm` up.
  2. `theme.css`: tap highlight transparent; on touch screens no selection or callout on
     `button`, `[role="button"]`, `a`; `overscroll-behavior: none` only in
     `display-mode: standalone` (a browser tab keeps pull-to-refresh). Top bar and tab bar
     `select-none touch-callout-none` (new utility).
  3. iOS launch images: user's choice C instead, a launch splash. Markup in `index.html`
     (Tailwind classes, so it paints with the stylesheet before the bundle runs): brand tile +
     italic wordmark popping in, three skewed racing stripes with an orange sweep
     (`--animate-splash-sweep` in `@theme`), static under reduced motion. An inline script
     applies the saved theme (`moti.theme`) and the dark status bar before first paint.
     `useDismissSplash` (`hook/common/splash.hook.ts`), called by `RouteRoot` (it mounts once
     the first loader and chunk are ready), fades it out (400 ms) and removes it. iOS still
     shows its own blank frame before the HTML parses.
  4. Sheet footer `pb-safe-4` (`max(1rem, env(safe-area-inset-bottom))`): 16 px under the last
     button, more above a home indicator.
  5. `TablePagination` `isLoading`: "Loading…" and both arrows disabled while the first page
     loads (4 tables).
  - [x] 360 px check, owner, light and dark: splash shows (bundle held) and sweeps, removed after
        load, dark applied before paint; flat sign-in / register / forgot password (register now
        fits one screen); sheet footer 16 px; pager "Loading…"; 0 console errors.

### Phase 6: Check on a phone (user)
- [ ] Install it: Android Chrome → Install app; iPhone Safari → Share → Add to Home Screen
- [ ] Opens standalone (no browser bar), status bar and home indicator clear the app bar and tab bar
- [ ] Light mode and dark mode at phone width
- [ ] Sell list rows, the Add / − + stepper, the cart bar and cart sheet, the bottom tab bar
- [ ] The keyboard does not hide the field or the Save button inside a form sheet
- [ ] Report anything that looks off
- [x] **Pre-check by Claude** (2026-10-03, before the user's phone report): 360 × 780, owner and
      employee, light and dark, standalone insets simulated (47 / 34 px). Screenshots:
      https://claude.ai/artifact/8yfYU7LJntHS4Ma3G4YdDr. Passed: app bar and tab bar clear the
      insets, sheet footers clear the home indicator, Sell rows 62 px, stepper 44 px, the sticky
      cart bar holds 11 px above the tab bar on a long list, no sideways scroll, 0 console errors.
      Fixed (user chose a white light status bar; fix both Android and iPhone keyboards):
  1. `index.html`: viewport `interactive-widget=resizes-content` (Android shrinks the app above
     the keyboard); starting `theme-color` `#ffffff`.
  2. New `hook/common/keyboard.hook.ts` `useKeyboardInset` (mounted in `App.tsx`): while an
     overlaid keyboard is open (iOS; gap ≥ 120 px, not pinch zoom) it writes `--keyboard-inset`
     and `--visible-height` on `<html>` and scrolls the focused dialog field into view.
     `drawerContent` rides the sheet on the keyboard (`data-[side=bottom]:bottom-(--keyboard-inset)`)
     and caps it at `min(92dvh, --visible-height − 2rem)`. Defaults live in `theme.css` `:root`.
  3. `theme.css`: light `--status-bar` is `var(--panel)` (was `--primary`, an orange strip over
     the white app bar on Android); `[data-slot="tabs-trigger"]` joins the coarse 44 px rule.
  4. Cart total caption wraps (`cartSummaryMeta`), "No prices set" / the amount never break;
     account avatar trigger `min-w-11`.
  - Verified: simulated iOS keyboard (300 px, visual viewport only), light and dark: sheet bottom
    on the keyboard, Save 33 px above it, focused field visible (cart note, Add item first and
    last), sheet back down on close. Rerun of the 360 px pass: no sub-44 px controls, cart total
    unclipped, 0 console errors. Not checkable on desktop: real standalone launch, real insets,
    real keyboards. The manifest `theme_color` stays orange (Android may show it during launch).

### Phase 7: Deploy (when happy)
- [ ] Host on Vercel (or similar) from the repo
- [ ] Add the three `VITE_...` values from `.env` as environment variables, then redeploy
- [ ] Never add the JWT secret, VAPID private key, `PUSH_SECRET` or service-role key there

## Visual testing setup

- Serve with `yarn build`, then `yarn preview --host 127.0.0.1 --port 4180 --strictPort` in the
  background (bare `--host` exposes it on the LAN).
  **Never port 4173**: TARTAR's service worker is installed on `localhost:4173`, so a browser shows
  TARTAR there. The user keeps their own TARTAR preview running; never stop it.
- No Chrome or Playwright browsers on this machine. Install `playwright-core` in the session
  scratchpad (never the repo) and launch Edge:
  `executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"`,
  `serviceWorkers: "block"`.
- Sign-in form: `getByLabel("Email")`; the password input is `#password` (`getByLabel("Password")`
  also matches the "Show password" button).
- Test accounts: owner `moti.test.owner@example.com` and employee `moti.test.employee@example.com`
  (approved). Their password is in Claude's local memory (`test-accounts`), never in this
  committed file; pass it to scratchpad scripts as `MOTI_PW`. Claude signs in and tests itself.
- Push tests: `launchPersistentContext` (one scratchpad profile per user), `headless: false`,
  service workers allowed, `grantPermissions(["notifications"])`; delivery is proven by
  `registration.getNotifications()` in the page. Edge subscribes through WNS.
- Stopping a background `yarn preview` on Windows can leave the vite process running; ask the user
  to stop it.
- Simulating installed-app insets: override the safe-area utilities with fixed values in an
  injected stylesheet, including variant classes (`.max-md\:pb-tabbar`). Build the CSS with
  `String.raw`, or JavaScript eats the `\:` and the rule is silently dropped (it made the cart bar
  look hidden under the tab bar). Edge cannot emulate `display-mode: standalone`.
- iOS keyboard stand-in: an init script replaces `window.visualViewport` with an `EventTarget`
  whose `height` shrinks while the layout viewport stays put, then dispatches `resize`.

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
- 2026-10-03 (V1.3 Phase 5 audit): **desktop uses the browser's root size** (16 px, zoom works;
  the width-based scale in `theme.css` goes). **Phone tabs are five**: Home, Sell, Inventory,
  Stock, Account; Team opens from Account. **Archived items and `inventory_summary` are
  owner-only** (migration 7). **Updates ask first**: "New version ready · Reload", held back while
  the offline queue flushes.
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

1. `supabase db push` (migrations 1–7 under `supabase/migrations/`).
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
CSV import/export, barcode scanning, pgTAP tests. (The update prompt and code-splitting moved to
Phase 5 fixes, Batches 2 and 4.)
