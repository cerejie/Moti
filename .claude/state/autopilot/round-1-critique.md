# Critique: Moti, whole app (deep) — autopilot round 1, 2026-10-03

**Scope & assumptions:** the whole repo at `af1b5e3` (Development v1.21): `src/` (314 files), the 7 migrations,
the `send-push` Edge Function, `vite.config.ts`, `index.html`, `public/push-sw.js`. Depth `deep`,
`focus=mobile,ux`, every other lens at standard depth. Yardstick: `CLAUDE.md`, the roadmap (Decisions
log, "Who sees what", Open architecture findings) and `design-plan.md`. Findings already decided in
the roadmap are not re-raised unless still open and still harmful.

**Coverage:** lenses run — QA/failure, architecture/code, UX/UI/product, mobile + PWA, security,
performance, accessibility, database/API. Runtime: full visual sweep (168 captures: signed out, owner,
employee × 360 / 820 / 1440 × light / dark; 0 failed steps, 0 sideways scroll, route guards all land
correctly, 2 console errors that were DNS blips of the test machine) plus targeted probes with faked
writes (back gesture, offline reads, a 401 on a queued write, expired session, double tap on checkout,
320 px, input font sizes, text contrast, menu item heights). Opened by eye: 30 of the 168 shots — every
owner phone screen and sheet in light, the dark ones for dashboard, history, cart, bell, item form,
transaction detail and register, the employee phone screens, and tablet/desktop for dashboard, Sell,
Inventory, Stock history, Team, Account, the item form and sign-in. The remaining dark and tablet/desktop
variants were judged from the measured report only. From code only: migrations, RLS, RPCs, the Edge
Function, push. Not verified: a real phone (standalone launch, real safe areas, real keyboards, the
real Android back gesture, real push), the service worker (blocked in the test browser, so offline
cold start and precache were reasoned from config), the developer role (no test account), database
state (no DB access), host headers (no host config in the repo).

## Executive summary

The app is in good shape for a one-shop V1: layer law holds, RLS and the RPCs enforce every role
rule the UI implies, the phone UI is a real phone UI (tab bar, list rows, bottom sheets, 44 px
controls, no sideways scroll at 320–360 px), and the offline write queue is idempotent for sales.
What is left is concentrated in the failure paths and the last layer of phone polish. The offline
queue has one real hole: a queued sale that is replayed with an expired token is parked as "failed —
JWT expired" and is never sent again on its own. Offline, the lists keep showing the previous rows as
if they answered the new search. The system back gesture leaves the screen instead of closing the open
sheet. In light mode almost every piece of coloured text is below WCAG AA contrast. One security
problem remains serious and known: anyone who knows an email can file a password reset that an owner
approves with one tap. Do first: QA-01 (the stuck queued sale), then the contrast and touch quick wins.

## High-priority findings

### [SEC-01] A stranger can take over an account by filing a password reset the owner then approves
**Category:** Security · **Severity:** High · **Confidence:** High · **Basis:** FACT

**What I found** — `request_password_reset(p_email, p_password)` is granted to `anon` and stores the
caller's chosen password as `pending_password_hash` for any approved account. The owner sees "Reset
asked" under Team and approves; the stranger's password becomes the real one.
**Evidence** — `supabase/migrations/20261002000001_create_auth_users_roles.sql:351–373` (anon-callable,
no proof of identity), `:375–397` (`decide_password_reset` copies the pending hash), grant at `:464`.
Roadmap "Open architecture findings" item 1 already records it as not fixed.
**Why it matters** — the only control is the owner remembering to confirm in person; nothing in the UI
tells them to. The same call also reveals whether an email has an active account (`:369–371`).
**User impact** — an employee's account (sales recorded under their name) can be taken by anyone who
knows their email; an owner account by anyone the developer approves for.
**Technical impact** — account takeover through a designed flow; every later audit row is unattributable.
**Recommended direction** — smallest first: the Team approval dialog says in plain words "Only approve
if this person asked you in person", and the request no longer carries a password (the owner sets a
temporary one, which `admin_set_password` already does). That is a database and business-rule change.
**Verification** — signed out, call `rpc/request_password_reset` with the test employee's email and a
new password; approve under Team as owner; sign in as the employee with the new password — it works.

### [QA-01] A queued sale replayed with an expired token is parked as "failed" and never sent again
**Category:** QA / offline · **Severity:** High · **Confidence:** High (reproduced) · **Basis:** FACT

**What I found** — when a queued write is answered with 401, `flush` treats it like any refused write:
it stores `failure: "JWT expired"` on the entry and moves on. The same 401 signs the user out. After
signing in again the queue is kept, but `flush` only sends entries without a `failure`, so the sale
stays on the device until someone opens the sync sheet and presses Retry. The reason shown is
database jargon.
**Evidence** — `src/store/common/sync.store.ts:62–82` (only `isNetworkError` stops the run; anything
else becomes `failure`), `:66` and `:82` (`find((entry) => !entry.failure)`),
`src/utils/supabase.utils.ts:33–40` (401 → session-expired handler),
`src/hook/common/network.hook.ts:24–33` (flush on foreground and on mount). Probe: employee, offline
checkout queued, replay answered 401 → landed on `/login`, queue `[{"Transaction of 1 item", failure:
"JWT expired"}]`; signed in again → `record_transaction` requests sent: 0, top bar "1 not synced".
**Why it matters** — tokens last 8 hours and timers do not run while a phone sleeps, so a phone that
wakes after the token lapsed flushes (on `visibilitychange`) before the expiry timer signs it out. That
is exactly the device that has offline sales waiting.
**User impact** — stock is not deducted and the owner gets no checkout notice until an employee
notices a red badge and works out what "JWT expired" means.
**Technical impact** — an authentication failure (recoverable by signing in) is stored as a permanent
refusal; the idempotent `client_id` design is not used to its advantage.
**Recommended direction** — in `flush`, treat an auth failure like a network failure: stop the run and
leave the entry clean, so the next flush after sign-in sends it. Clear `failure` on entries whose
failure was an auth error when the owner signs back in (`adoptOwner`, same owner).
**Verification** — repeat the probe: queue a sale offline, answer the replay with 401, sign in again;
expect one `record_transaction` request without touching the sync sheet and an empty queue.

## UX/UI findings

### Mobile

### [MOB-01] The back gesture leaves the screen instead of closing the open sheet
**Category:** Mobile · **Severity:** Medium · **Confidence:** High (reproduced) · **Basis:** UX PRINCIPLE (Android back closes the topmost surface; iOS edge-swipe in a standalone PWA is the same history pop)

**What I found** — sheets and dialogs live in the zustand modal store and never touch history. With the
cart sheet open on Sell, back navigates to the previous route; on the first screen of an installed app
it closes the app.
**Evidence** — no `popstate` / history handling anywhere in `src` (grep); `src/components/common/modal/AppModal.tsx`.
Probe: Home → Sell → Add → Review & checkout (1 dialog) → `history.back()` → path `/`, 0 dialogs.
**Why it matters** — back is the most used gesture on Android; the cart, the item form and the void
form are all sheets.
**User impact** — a seller reviewing the cart swipes back to "keep adding" and is thrown to Home (the
cart survives in memory, the half-typed note or item form does not).
**Technical impact** — none today; the fix belongs in one place (the modal hook / `AppModal`).
**Recommended direction** — an open dismissible sheet owns one history entry: pushed when it opens,
popped when it closes by its own controls, and a back pop closes the sheet. Do it through the router
(location state) rather than raw `pushState`, so React Router's own history index stays intact.
**Verification** — the probe above: after back, path stays `/transaction`, 0 dialogs, cart bar still
shown; a second back goes to Home. Closing with ✕ leaves no extra entry (one back still goes Home).

### [MOB-02] Account menu items are 31 px tall on touch
**Category:** Mobile · **Severity:** Medium · **Confidence:** High (measured) · **Basis:** UX PRINCIPLE (HIG 44 pt, WCAG 2.5.8)

**What I found** — the avatar menu's My account, Dark mode and Sign out rows measure 216 × 31 px on
phone and tablet; the destructive Sign out sits directly under the theme toggle. The menu label is also
clipped by 4 px (`[UI-04]`).
**Evidence** — sweep: `owner|employee phone|tablet account-menu: small My account 216×31 | Dark mode
216×31 | Sign out 216×31`; `[data-slot="dropdown-menu-item"]` is missing from the coarse-pointer rule
in `src/styles/common/theme.css:297–316`. The same rule covers every ⋮ row menu (Team, Categories, Brands).
**Why it matters / User impact** — mis-taps between "Dark mode" and "Sign out".
**Technical impact** — one selector.
**Recommended direction** — add `dropdown-menu-item` to the existing 44 px coarse rule.
**Verification** — re-sweep `account-menu`: no `small` entries.

### [MOB-03] Phone lists carry a desktop pager even when everything fits on one page
**Category:** Mobile · **Severity:** Medium · **Confidence:** High · **Basis:** JUDGMENT (mobile lens B: pagination controls are a desktop pattern)

**What I found** — every phone list ends with "Showing 1–2 of 2", a "Rows 8" picker and "‹ Page 1 of 1 ›".
On a 2-row list the pager is as tall as the list.
**Evidence** — `owner/transaction-phone-*.jpg`, `inventory-phone-*.jpg`, `transaction-tab-history-phone-*.jpg`;
`src/components/common/table/TablePagination.tsx:59–131` renders all three parts at every width.
**Why it matters** — it is the one remaining "desktop table" artefact on the phone screens.
**User impact** — noise under every list; a rows-per-page select nobody needs on a phone.
**Technical impact** — small, one component and its styles.
**Recommended direction** — below `md`: no rows picker; when there is a single page show only the count
line (or nothing); keep ‹ › only when there is more than one page. "Load more" would be the fully
native pattern but changes the pagination store; not needed at this shop's size.
**Verification** — 360 px: Sell with 2 items shows no picker and no arrows; Stock history (17 rows)
shows the count and the two arrows, each ≥ 44 px.

### [UX-04] Cart quantity can only be changed one tap at a time
**Category:** UX · **Severity:** Medium · **Confidence:** High · **Basis:** JUDGMENT

**What I found** — the row stepper and the cart sheet offer − and + only; the number between them is
plain text. Selling 24 spark plugs is 23 taps.
**Evidence** — `src/components/transaction/menus/CartQuantityControl.tsx:37–60`,
`src/components/transaction/modal/CartModal.tsx:97–117`; the store already clamps any number
(`transaction.store.ts:23–24`, `setQuantity`).
**Why it matters** — a parts counter sells small parts in bulk; Sell is the screen every role uses most.
**User impact** — slow, error-prone counting by tapping.
**Technical impact** — none; `setQuantity` already exists and clamps to stock.
**Recommended direction** — in the cart sheet only, make the quantity a small numeric field
(`inputMode="numeric"`, select on focus, clamped on blur to 1…on hand). The list row keeps the stepper.
**Verification** — cart sheet at 360 px: type 12 on an item with 49 left → 12, total updates; type 99 →
49; clear the field and blur → 1; the field is ≥ 44 px and 16 px text (no iOS zoom).

### [MOB-04] Whole-number fields open the wrong keyboard and no field names its Enter key
**Category:** Mobile · **Severity:** Low · **Basis:** FACT — `type="number"` without `inputmode` on
`reorder_level` and `opening_stock` (probe: `inputmode=-`), `FormField.tsx:150–153`; iOS then shows the
full punctuation keyboard. Direction: `inputMode="numeric"` for the `number` field type.

### Tablet

### [UI-01] At 820 px the four dashboard stat cards are squeezed until labels wrap and hints truncate
**Category:** UI · **Severity:** Medium · **Confidence:** High · **Basis:** FACT

**What I found** — from `md` the summary grid goes straight to four columns, in a content panel that is
about 680 px wide with the icon rail. "Items tracked" and "Out of stock" wrap to two lines and the
hints read "At or below its…", "Nothing left on th…".
**Evidence** — `owner/dashboard-tablet-light.jpg`; `src/styles/dashboard/dashboard.styles.ts:11`
(`grid-cols-2 … md:grid-cols-4`).
**Why it matters / User impact** — the dashboard's headline numbers are the least readable thing on a
counter tablet.
**Technical impact** — one class.
**Recommended direction** — keep two columns until `xl` (where Batch 6 already found the panel becomes
wide enough for full tables), four from there.
**Verification** — 820 and 1024 px: no wrapped label, no truncated hint; 1440 px: four across.

### Native feel and clarity

### [UX-01] In the bell, an empty "All stocked up" box pushes the unread updates below the fold
**Category:** UX · **Severity:** Medium · **Confidence:** High · **Basis:** UX PRINCIPLE (glance → understand → act; `design-plan.md`)

**What I found** — the badge says 4 unread, but the sheet opens on the push prompt and then a 240 px
dashed empty state for stock alerts; the Updates heading is the last thing visible and the updates
themselves need a scroll. The same large empty box sits inside the "Needs attention" card on the
dashboard (a dashed box inside a card).
**Evidence** — `owner/bell-phone-light.jpg`, `bell-phone-dark.jpg`, `dashboard-phone-light.jpg`;
`src/components/inbox/modal/NotificationCenterModal.tsx:45–63`, `StockAlertsList`.
**Why it matters** — the thing the badge counted is not what the sheet shows.
**User impact** — an owner opens the bell and sees "nothing".
**Technical impact** — small; the empty state needs a compact form.
**Recommended direction** — when there are no stock alerts, the bell shows one quiet line ("All stocked
up") instead of the boxed empty state; the dashboard card uses the same compact form.
**Verification** — 360 px, owner with unread updates and no low stock: at least the first two updates
are visible without scrolling, light and dark.

### [UX-02] Sign out and the theme switch are not on the Account screen
**Category:** UX · **Severity:** Medium · **Confidence:** High · **Basis:** UX PRINCIPLE (settings and sign-out live on the account destination; top-corner controls are outside the thumb zone)

**What I found** — the Account tab shows profile, team, password, notifications and install, but not
Sign out or light/dark. Both exist only in the avatar menu in the top-right corner, whose first item
("My account") duplicates the tab.
**Evidence** — `src/pages/Account/AccountView.tsx:10–29`; `owner/account-phone-light.jpg`,
`account-menu-phone-light.jpg`.
**Why it matters** — a user looking for Sign out goes to Account and does not find it.
**User impact** — hunting; a 31 px target in the hardest corner to reach (see MOB-02).
**Technical impact** — small; `useAccountLogoutHook` and the theme store already exist.
**Recommended direction** — one more card on Account: Appearance (light / dark) and Sign out, reusing
the existing hooks. The avatar menu stays for desktop.
**Verification** — 360 px, both roles: Account shows the theme control and Sign out, each ≥ 44 px;
Sign out with queued writes still asks first.

### [A11Y-01] In light mode most coloured text is below WCAG AA contrast
**Category:** Accessibility · **Severity:** Medium · **Confidence:** High (measured) · **Basis:** UX PRINCIPLE (WCAG 1.4.3, 4.5:1 for text under 24 px)

**What I found** — brand-orange, amber and green text is used at 12–14 px on white and tinted
surfaces. Measured ratios: push prompt body 2.91, "Low stock" label 2.68, "Items tracked" 2.97,
"Create an account" 3.16, "+1" 3.30, "Full history" and the active tab label 3.56, "Out of stock" 3.97,
muted text 4.28–4.40. Dark mode passes everywhere.
**Evidence** — contrast probe over sign-in, dashboard, Sell, Inventory, Stock history and Account at
360 px (computed colours, blended backgrounds); tokens in `src/styles/common/theme.css` and
`src/styles/common/tone.styles.ts`.
**Why it matters** — the design brief is a shop counter and a phone in daylight; low-contrast orange
on pale orange is the first thing to disappear.
**User impact** — the push prompt, stat labels and signed quantities are hard to read outdoors and for
anyone with reduced vision.
**Technical impact** — token-level; no component needs to change if text tones get their own tokens.
**Recommended direction** — add text-only tone tokens for light mode (a darker orange, amber, green
and red that reach 4.5:1 on white and on the tinted surfaces) and point text utilities at them; nudge
`--muted-foreground` past 4.5:1 on `bg-app`. The brand fill colour does not change (see A11Y-02).
**Verification** — rerun the contrast probe in light mode: no text under 4.5:1 except the white label
on the primary button (A11Y-02); dark mode still clean.

### [A11Y-02] White text on the brand-orange button is 3.56:1
**Category:** Accessibility · **Severity:** Medium · **Confidence:** High (measured) · **Basis:** UX PRINCIPLE (WCAG 1.4.3)

**What I found** — every primary button (Sign in, Add, Complete transaction) is white 14 px text on
`#EA580C`: 3.56:1, under the 4.5:1 minimum for text this size.
**Evidence** — contrast probe; `--primary` in `theme.css`; Decisions log 2026-10-02 fixes the brand as
racing orange `#EA580C`.
**Why it matters / User impact** — the main action on every screen is the least legible label in sunlight.
**Technical impact** — one token, but it is the brand colour.
**Recommended direction** — a brand decision: darken the light-mode fill (about `#C2410C`, 5.2:1), or
keep the orange and accept AA-large only.
**Verification** — contrast probe on Sign in.

### [UX-03] Low · FACT — the owner's own Profile card says "Ask the owner to change your name or email." (`AccountProfileCard.tsx:24`; `owner/account-phone-light.jpg`). Make the line role-aware.
### [UI-02] Low · FACT — "1 · 1 pcs" in the transaction sheet and the desktop history table (`TransactionDetailModal.tsx:42`, `TransactionHistoryTable.tsx:51`); `formatCount` already exists.
### [UI-04] Low · FACT — the account menu's label is clipped by 4 px (`clipped div "Account" 220>216`, every size and theme).
### [UI-05] Low · JUDGMENT — secondary text and button labels are 13.6 px (`text-sm` = 0.85rem); list titles and inputs are 16 px. Readable, and inputs do not trigger iOS zoom (probe: every input 16 px).

## QA findings

### [QA-02] Offline, a new search, filter or page shows the previous rows as if they were the answer
**Category:** QA / failure experience · **Severity:** Medium · **Confidence:** High (reproduced) · **Basis:** FACT

**What I found** — list queries use `keepPreviousData`. Offline, the new query is paused, so the list
keeps the old rows with no notice. Searching "brake" offline shows "Brake pad set" and "Front".
**Evidence** — `probe-offline-search.jpg` (search field "brake", both items listed, "Showing 1–2 of 2");
`src/hook/data/transaction/transaction.list.hook.ts:46` (`placeholderData: keepPreviousData`), same in
the other list hooks; `DataTable` receives only `isLoading` / `isError`.
**Why it matters** — the seller trusts the list; a filtered list that is not filtered is worse than an
error.
**User impact** — wrong item picked, or "we don't have it" when the search simply never ran.
**Technical impact** — the four data states do not cover "stale while paused".
**Recommended direction** — pass the query's placeholder/paused state to the table; while the rows on
screen belong to an earlier query that cannot be refreshed, dim them and say so in one line ("Offline —
showing the last list, not this search").
**Verification** — the probe: offline search shows the notice and dimmed rows; back online the notice
goes and the rows are the real result.

### [QA-03] A page chunk that fails to load shows React Router's developer error screen
**Category:** QA / failure experience · **Severity:** Medium · **Confidence:** High (reproduced, without the service worker) · **Basis:** FACT

**What I found** — routes are lazy and no route has an error element. When a chunk request fails the
user sees "Unexpected Application Error! Failed to fetch dynamically imported module … 💿 Hey developer 👋".
**Evidence** — `src/routes/index.ts:10–22` (no `ErrorBoundary` / `errorElement`); probe: offline tap on
Stock → that text. The app's own `ErrorBoundary` in `AppLayout` only wraps rendering, not route loading.
**Why it matters** — the service worker precaches chunks, so an installed app is mostly safe; a first
visit before the worker is active, a blocked worker, or a deploy that removed old chunks is not.
**User impact** — a dead screen with developer text and no way back.
**Technical impact** — one root-level error element.
**Recommended direction** — a root `ErrorBoundary` route element that reuses the app's error panel
("This page couldn't be loaded" + Reload), shown for any route error.
**Verification** — service workers blocked, offline, open a screen not yet visited: the app's own error
panel with a working Reload, no developer text.

### [QA-04] Low · RISK — a disabled or demoted account keeps its cached role until the token lapses (up to 8 h): RLS answers with empty lists and "You don't have permission", not a sign-out (`account.store.ts` persists `user.role`; `app.user_role()` reads live). Direction: treat `42501` on a read as a cue to re-check the session.

## Security findings

SEC-01 is listed under High.

### [SEC-02] Sign-in has no attempt limit, sign-up has no throttle, and reset requests reveal which emails exist
**Category:** Security · **Severity:** Medium · **Confidence:** High · **Basis:** FACT

**What I found** — `login_email` verifies bcrypt for as many guesses as arrive, with a 6-character
minimum password; `register_email` inserts a pending row and notifies the owner for every call;
`request_password_reset` answers "No active account uses this email".
**Evidence** — migration 1 `:306–349`, `:258–275`, `:369–371`; roadmap Open architecture findings 2–3.
**Why it matters** — online guessing against short passwords; sign-up spam into the owner's inbox and
push; account enumeration.
**User impact** — a guessed employee password; a flooded bell.
**Technical impact** — needs a small attempts table or counters; database work.
**Recommended direction** — a per-email failed-attempt counter with a short lockout, a per-hour cap on
pending sign-ups, and a neutral reset answer.
**Verification** — 20 wrong passwords in a row: later attempts are refused for a few minutes.

Checked and sound: RLS on every table, password columns never selectable, role read live from
`public.users`, `can_manage_role` blocks owner-to-owner and self-escalation, every `security definer`
function pins `search_path`, RPCs revoke `public`/`anon`, `send-push` checks its shared secret, no
service-role key or secret in `src/`, the offline queue is scoped to the account that queued it.

## PWA findings

### [PWA-01] After a cold start offline nothing can be read, so "keeps selling offline" only holds while the app stays open
**Category:** PWA · **Severity:** Medium · **Confidence:** Medium (from code; the service worker is blocked in the test browser) · **Basis:** FACT

**What I found** — writes queue offline, but reads live only in React Query's memory. Reopen the app
with no connection and the Sell list has nothing to show, so there is nothing to add to a cart. Within
one session a visited list survives only its 5-minute cache time once unmounted.
**Evidence** — `src/utils/query.utils.ts` (no persister, default `gcTime`); `vite.config.ts` (Supabase
deliberately never cached by Workbox); sign-in hero copy "Keeps selling offline, syncs when you return".
**Why it matters** — the promise on the sign-in screen is narrower than it reads.
**User impact** — a shop whose connection is down at opening time cannot sell from the app.
**Technical impact** — persisting the query cache needs `@tanstack/react-query-persist-client` (a new
dependency) or a hand-rolled copy, which CLAUDE.md's "never cache server rows in a store" rules out.
**Recommended direction** — persist the item list for the signed-in account through the official
persister, cleared on sign-out; or narrow the copy to what is true.
**Verification** — installed app, load Sell, close it, airplane mode, reopen: the item list is there
and a sale queues.

Sound: manifest (id, scope, maskable icon), update prompt held while the queue flushes, no API or
auth caching, push asked only after a tap, subscription released on sign-out, iOS install hint.

## Product, testing and operations

### [PROD-01] Stock history cannot be searched by item or date
**Category:** Product · **Severity:** Medium · **Confidence:** High · **Basis:** JUDGMENT

**What I found** — the ledger filters only by Stock in / Stock out. With a real catalogue, "what
happened to this part last week" means paging through every movement.
**Evidence** — `owner/movements-phone-light.jpg`; `MovementTable.tsx` toolbar.
**Why it matters / User impact** — the ledger exists to answer exactly that question.
**Technical impact** — an item search on an embedded relation (`!inner` join) and a date range.
**Recommended direction** — add item search first; open the ledger pre-filtered from the item sheet.
**Verification** — search an item name on Stock history; only its rows remain.

### [TEST-01] There are no automated tests
**Category:** Testing · **Severity:** Medium · **Confidence:** High · **Basis:** FACT

**What I found** — no test runner, no `supabase/tests`, no CI. The stock and role rules live in SQL
RPCs that are checked only by ad-hoc probes.
**Evidence** — `package.json` scripts (dev, build, lint, preview); no `.github/`; roadmap "LATER: pgTAP tests".
**Why it matters** — `record_transaction`, `void_transaction` and the RLS rules are the parts that
must never regress.
**User impact** — none today. **Technical impact** — every change to a migration is verified by hand.
**Recommended direction** — pgTAP for the ledger and role rules when the roadmap reaches it.
**Verification** — n/a.

### [OPS-01] Observation — nothing runs `yarn build` + `yarn lint` on push; the gate is each developer's discipline.
### [PERF-01] Observation — the Google Fonts stylesheet is render-blocking and the shared vendor chunk is 515 kB (392 kB entry beside it); Batch 4 already measured and accepted this.

## Positive findings

- **The server is the boundary.** Every role rule in "Who sees what" is enforced in RLS or an RPC, not
  only hidden in the UI; the employee's typed owner URLs all land on `/transaction` (sweep, 10 guard checks).
- **Sales are idempotent.** `record_transaction` and `create_item` take a client id fixed at the call,
  lock items in id order and deduct all lines or none; a real double tap on Complete transaction sent
  one request (probe).
- **Phone layout is honest.** No sideways scroll at 320 or 360 px on any screen, every input is 16 px
  (no iOS focus zoom), list rows are single surfaces with dividers, forms are bottom sheets with the
  action pinned.
- **Session expiry is clean.** A lapsed token gives one toast and the sign-in screen (probe), and the
  queue stays with its account.
- **Layer law holds.** Supabase is imported only under `services/data` and `utils`; styles are in
  `*.styles.ts`; no `useState` outside the generated layer.

## Recommended action plan

### Immediate — fix now
QA-01, then QA-03 and QA-02 (failure paths); A11Y-01, MOB-02, UI-04, UX-03, UI-02, MOB-04 (quick wins).
### Short term — next
UX-01, UX-02, MOB-03, UI-01 (phone shell and lists); MOB-01, UX-04 (sheet back gesture, cart quantity).
### Medium term — after the user decides
SEC-01, SEC-02 (database), A11Y-02 (brand), PWA-01 (dependency).
### Long term
PROD-01, QA-04, OPS-01, TEST-01.

## Hypotheses to verify

- On the 820 px captures plain inputs are 36 px tall while input groups are 44 px (the Selling price
  field is taller than its neighbours in `owner/item-form-tablet-light.jpg`). Likely the test browser
  reports a fine pointer at tablet size, so the coarse rule did not apply evenly; check on a real iPad.
- `endSession` awaits the push-subscription release before clearing the session; on a slow connection
  the shell may render and flush for a moment with a dead token. QA-01's fix makes this harmless.
- Android may show the manifest's orange `theme_color` during launch while the app's light status bar
  is white (noted in Phase 6); only a phone shows it.
