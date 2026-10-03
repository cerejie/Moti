# Check round: Moti — autopilot round 2, 2026-10-03

A check round, not a new audit. One question: did the Round 1 roadmap land as planned? Scope: the
15 planned findings against their Verification steps, and the screens and files Batches 1–4 touched,
for regressions. Read-only; writes faked; emulated viewport only.

## Evidence

- `yarn build` and `yarn lint` clean on `ba5a04d` (Development v1.27); the preview on port 4180 served
  the same entry chunk as `dist/index.html`.
- Full sweep: 168 captures, 92 with measured issues, 0 failed steps, 0 console errors, every route
  guard landed where it should.
- Sweep compared entry by entry with the round 1 sweep: 37 measured issues are gone (the account
  menu's 31 px rows and its 4 px clip, every size and theme); 1 is new only in the sense that it
  flipped between runs (employee, Sell, tablet, light: the known 40 px Add button, already measured
  for the other three variants in round 1).
- Every Verification step re-run with the batch probes; 14 shots of the touched screens opened by eye
  (Account both roles, bell, dashboard phone and tablet, Sell, cart phone and desktop, Stock history,
  transaction sheet, account menu; light and dark where both matter).

## Planned findings — all 15 hold

| ID | Verification result | Verdict |
|---|---|---|
| QA-01 | Sale queued offline, replay answered 401 → `/login`, entry kept with `failure: null`; signed in again → 1 `record_transaction` sent, queue empty, sync sheet not touched | holds |
| QA-02 | 360 px and 1440 px: offline search shows the notice and dimmed rows, no sideways scroll; back online the notice goes and the rows are the real result (1 of 1) | holds |
| QA-03 | Service workers blocked, offline, unvisited screen: "This page couldn't be loaded" + Reload, no developer text; Reload lands on `/movements`; phone and desktop | holds |
| A11Y-01 | Contrast probe, light: only the white label on the orange button is under 4.5:1 (A11Y-02, parked for the user); dark: nothing | holds |
| MOB-02 | Account menu rows 44 px, both roles; no `small` entry for `account-menu` in the sweep | holds |
| UI-04 | Menu 216 = 216; no `clipped` entry for `account-menu` | holds |
| UX-03 | Owner: "The name and email you sign in with."; employee keeps "Ask the owner…" | holds |
| UI-02 | Sheet "1 item · 1 pc"; desktop history table "1 item · 1 pc", "1 item · 3 pcs", "2 items · 4 pcs" | holds |
| MOB-04 | `reorder_level` and `opening_stock` report `inputmode=numeric` | holds |
| UX-01 | 360 px owner, 4 unread, no low stock: one quiet "All stocked up" line; the first two updates end at 596 and 701, above the Close bar at 721; light and dark; same line in the dashboard card | holds |
| UX-02 | Both roles, both themes: Sign out 280×44, Light and Dark 133×44; Dark → dark, Dark again → stays, Light → light; with one unsynced change Sign out asks first and stays on Account | holds |
| MOB-03 | Sell, Inventory and History show only the count; Stock history (17) shows the count, "Page 1 of 3" and both arrows with no touch-target issue; Next → 9–16 | holds |
| UI-01 | 820 and 1024 px: two columns, every label and hint on one line, nothing truncated; 1440 px: four across | holds |
| MOB-01 | Phone and desktop: cart open → back: `/transaction`, 0 dialogs, cart bar shown; back again: `/`. "Keep adding" or Escape: one back goes Home. Forward after closing, reload with a sheet open, item form, bell, a bell row that opens Inventory, checkout → receipt → back: all land where expected; history never grew beyond one entry per open sheet | holds |
| UX-04 | 360 px, item with 49 left: 12 → 12 and "12 pcs"; 99999 → 49; cleared → 1; + → 2; Enter keeps the sheet open and sends nothing; field 64×44, 16 px, `inputmode=numeric` | holds |

## Regressions on the touched screens and files

None. No new measured issue, no console error, no failed step, no sideways scroll on Account, the
bell, the dashboard, Sell, the cart sheet, Stock history, the transaction sheet or the account menu.
The remaining measured issues are the ones round 1 already knew and decided: 36 px inputs inside
44 px frames, the 40 px Add button and segmented filter on tablet, the sign-in hero clip on desktop.

## Out of scope — recorded as Backlog, `defer`

- **BL-01** The push prompt takes the top third of the bell until it is answered (noted by implement 1.3).
- **BL-02** On a phone the push prompt's sentence breaks inside "sign-ups" ("sign-" / "ups").
- **BL-03** On desktop the cart sheet's quantity field is 44 px beside 40 px − and + buttons (noted by
  implement 1.4; cosmetic, the field's height is what UX-04's Verification asks for).

## Not checkable here

The real Android back gesture, the iOS edge swipe, the real keyboards (digit pad) and daylight
readability need a phone.
