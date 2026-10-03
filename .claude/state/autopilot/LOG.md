# Autopilot log

## critique 1 — Development v1.22 (2026-10-03)
Sweep: 168 captures, 100 with measured issues (all "small"/"clipped" notes: 36 px inputs inside 44 px frames, 31 px menu items, tablet segments, the sign-in hero), 2 console errors (DNS blips of the test machine), 0 failed steps
Plan / findings: 25 — QA-01 SEC-01 (High); MOB-01..04, UX-01..04, A11Y-01..02, QA-02..04, UI-01 UI-02 UI-04 UI-05, SEC-02, PWA-01, PROD-01, TEST-01, OPS-01, PERF-01
Decisions: 25 (see round-1-decisions.md) — 15 fix now in 4 batches, 3 defer, 3 leave, 4 user decides
Verified: build clean before the sweep; critique is read-only (no source changed); probes with faked writes; emulated viewport only; 30 of 168 shots opened by eye, the rest judged from the measured report
Note: the branch is `moti-development`, not `development` (reflog: checked out at 10:25, same commit af1b5e3). Worked on the current branch as the skill says; did not switch.
Push: ok

## settle leftovers — Development v1.23 (2026-10-03)
The conductor's edit to `.claude/skills/autopilot/SKILL.md` (bounded loop, check rounds) committed on its own after build + lint clean. Push: ok

## implement 1.1 — Development v1.24 (2026-10-03)
Sweep: 30 captures (owner + employee × transaction, history tab, inventory, movements × 3 sizes × 2 themes), 16 with measured issues (all the known "small" notes: 36 px search input, 40 px Add on tablet), 0 console errors, 0 failed steps
Plan / findings: QA-01, QA-03, QA-02. File plan: ~ `utils/error.utils.ts` (SessionExpiredError), ~ `utils/write.utils.ts` (401 → that error), ~ `store/common/sync.store.ts` (stop the run on it), + `components/common/status/RouteErrorState.tsx`, ~ `routes/index.ts` (root ErrorBoundary), ~ `styles/layout/appShell.styles.ts`, ~ `utils/query.utils.ts` (isShowingPausedRows), ~ `components/common/table/DataTable.tsx` (isStale: notice + dim), ~ `styles/table/table.styles.ts`, ~ the four paged tables (pass isStale)
Decisions: 7 (see round-1-decisions.md)
Fixed: QA-01 a queued write answered with 401 stops the flush and stays clean, so it is sent after signing in again (`error.utils.ts`, `write.utils.ts`, `sync.store.ts`)
Fixed: QA-03 a failed route load shows the app's own panel with Reload (`RouteErrorState.tsx`, `routes/index.ts`, `appShell.styles.ts`)
Fixed: QA-02 offline, rows kept from an earlier search, filter or page are dimmed under a one-line notice (`DataTable.tsx`, `table.styles.ts`, `query.utils.ts`, InventoryTable, MovementTable, TransactionHistoryTable, TransactionItemTable)
Verified: build + lint clean; re-sweep transaction, inventory, movements ok; verification steps ok — QA-01: replay refused with 401 → on /login, entry kept with no failure; signed in again → 1 `record_transaction` sent, queue empty, no sync sheet touched. QA-02: offline search "brake" → notice + dimmed rows (phone and desktop, light and dark); back online → notice gone, 1 real result. QA-03: service workers blocked, offline, first visit to Stock history → "This page couldn't be loaded" + Reload, no developer text; Reload online opens the screen (phone and desktop). Emulated viewport only; writes faked
Note: the first probe run could not sign in (the test machine's network blip seen in round 1); the rerun passed unchanged.
Push: ok

## implement 1.2 — Development v1.25 (2026-10-03)
Sweep: 168 captures (full: the colour tokens reach every screen), 92 with measured issues (all known: 36 px inputs, 40 px Add on tablet, the sign-in hero), 0 console errors, 0 failed steps
Plan / findings: A11Y-01, MOB-02, UI-04, UX-03, UI-02, MOB-04. File plan: ~ `styles/common/theme.css` (text tone tokens, muted text, menu rows in the 44 px rule), ~ `styles/layout/auth.styles.ts` (hero accent), ~ `styles/view/tabs.styles.ts` (tab label), ~ `styles/layout/accountMenu.styles.ts` + `components/common/layout/AccountMenu.tsx` (separator), ~ `AccountProfileCard.tsx`, ~ `TransactionDetailModal.tsx`, ~ `TransactionHistoryTable.tsx`, ~ `components/common/form/FormField.tsx`
Decisions: 8 (see round-1-decisions.md)
Fixed: A11Y-01 coloured and muted text in light mode is darker; fills, borders and dark mode are unchanged (`theme.css`, `auth.styles.ts`, `tabs.styles.ts`)
Fixed: MOB-02 menu rows are 44 px on touch — account menu and every row menu (`theme.css`)
Fixed: UI-04 the account menu no longer overflows its box by 4 px (`AccountMenu.tsx`, `accountMenu.styles.ts`)
Fixed: UX-03 the owner's Profile card no longer says "Ask the owner" (`AccountProfileCard.tsx`)
Fixed: UI-02 "1 item · 1 pc" in the transaction sheet and the history table (`TransactionDetailModal.tsx`, `TransactionHistoryTable.tsx`)
Fixed: MOB-04 whole-number fields ask for the digit pad (`FormField.tsx`)
Verified: build + lint clean; full re-sweep ok; verification steps ok — A11Y-01: contrast probe (sign-in, dashboard, Sell, Inventory, Stock history, Account at 360 px) light mode: only the white label on the orange button is under 4.5:1 (A11Y-02, parked), dark clean. MOB-02 / UI-04: account-menu captures have no `small` or `clipped` entry; rows 44 px, menu 216 = 216. UX-03: owner "The name and email you sign in with.", employee keeps the old line. UI-02: sheet and desktop table read "1 item · 1 pc", "2 items · 4 pcs". MOB-04: `reorder_level` and `opening_stock` report `inputmode=numeric`. Emulated viewport only; writes faked
Note: the tab label (4.49:1) was not listed in the report but failed its Verification probe, so it was fixed here. Stock movement's Quantity field was not opened in the probe; it goes through the same `number` branch.
Push: ok

## implement 1.3 — Development v1.26 (2026-10-03)
Sweep: 60 captures (owner + employee × dashboard, transaction + history tab, inventory, movements, account, bell × 3 sizes × 2 themes), 28 with measured issues (all known: 36 px inputs, 40 px Add on tablet, 40 px segmented filter on tablet), 0 console errors, 0 failed steps
Plan / findings: UX-01, UX-02, MOB-03, UI-01. File plan: ~ `components/common/status/StateBox.tsx` + `styles/state/state.styles.ts` (compact line), ~ `StockAlertsList.tsx`, ~ `AttentionPanel.tsx`, + `components/account/cards/AccountDeviceCard.tsx`, ~ `pages/Account/AccountView.tsx`, ~ `styles/account/account.styles.ts`, ~ `components/common/table/TablePagination.tsx` + `styles/table/pagination.styles.ts`, ~ `styles/dashboard/dashboard.styles.ts`
Decisions: 8 (see round-1-decisions.md)
Fixed: UX-01 no stock alerts is one quiet line, in the bell and in the dashboard's "Needs attention" card (`StateBox.tsx`, `state.styles.ts`, `StockAlertsList.tsx`, `AttentionPanel.tsx`)
Fixed: UX-02 Account ends with a Light / Dark switch and Sign out (`AccountDeviceCard.tsx`, `AccountView.tsx`, `account.styles.ts`)
Fixed: MOB-03 on a phone the rows picker is gone and a single-page list shows only its count (`TablePagination.tsx`, `pagination.styles.ts`)
Fixed: UI-01 the dashboard stat cards stay two across until `xl` (`dashboard.styles.ts`)
Verified: build + lint clean; re-sweep dashboard, transaction, inventory, movements, account, bell ok; verification steps ok — UX-01: 360 px owner, 4 unread, no low stock: the first two updates sit above the Close bar without scrolling (second row ends at 701, bar starts at 721), light and dark. UX-02: both roles, Sign out 280×44, Light and Dark 133×44 each; Dark → dark, Dark again → stays, Light → light; with one unsynced change Sign out opens "Sign out with unsynced changes?" and stays on Account. MOB-03: Sell (2), Inventory (2) and History (7) show only "Showing …"; Stock history (17) shows the count, "Page 1 of 3" and both arrows, no touch-target issue measured, Next goes to 9–16. UI-01: 820 and 1024 px two columns, every label and hint on one line, nothing truncated; 1440 px four across. Emulated viewport only; writes faked
Note: NotificationCenterModal needed no change (it renders StockAlertsList). The push prompt still takes the top third of the bell until it is answered; not part of this batch.
Push: ok
