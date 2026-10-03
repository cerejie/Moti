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
