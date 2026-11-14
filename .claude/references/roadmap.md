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
- [x] TARTAR redesign (phases below), one conversation per phase (2026-10-07: all 7 phases done)
- [x] V1.5: Pushed detail pages for every list (below), one conversation per phase —
      Phase 1 done 2026-10-28 (v1.45), Phase 2 done 2026-10-28 (v1.46), Phase 3 done 2026-10-28
      (v1.47), Phase 4 done 2026-10-28 (v1.48); V1.5 complete
- [ ] V1.6: Branches, TARTAR style (below), one conversation per phase; Phases 1–4 coded
      2026-11-14 (v1.57–v1.60, migration 13 applied); next up: Phase 5 (Team)
- [ ] V1.7: Stock analyzer, order list, receive stock, motion (below), one conversation per
      phase; flow redesign folded in 2026-11-13 (six phases); Phase 1 done 2026-11-13 (v1.51);
      Phase 2 done 2026-11-13 (v1.52, migration 9 applied); Phase 3 coded 2026-11-14 (v1.53,
      migration 10 waits to be applied); next up: Phase 4 (Order list)

## V1.7: Stock analyzer, order list, receive stock, motion

Decided with the user on 2026-11-13 and refolded the same day from the flow audit (below). Built
**before** V1.6 branches, on today's single stock; the analyzer and order list gain a branch filter
when V1.6 lands. One phase per conversation; each ends with `yarn build` + `yarn lint` + a
`visual-test` pass.

Decisions (the user's answers):
- **Analyzer first**, then branches.
- **The Stock tab is the place to act**: three actions on top (**Receive delivery**, **Count
  stock**, **Damaged or lost**), under them a `ContextSwitch` with **Reorder** (first) and
  **History**. Home gets an "Order next" card linking there. No sixth tab.
- **Stock history hides sales by default**: it opens on deliveries, counts and damage; a "Sales"
  chip includes them and a sale row opens its sale page. The ledger itself does not change; the item
  page keeps the full story, sales included.
- **Stock count replaces "Correction ±"**: the owner types what is on the shelf, the app shows and
  records the difference.
- **Damaged or lost is one reason** with an optional note (no database change).
- **Order list + Receive delivery**: suggestions go into a saved order list that can be adjusted
  and shared as text; a delivery is received in one multi-item save, like the sell cart.
- **Quantities only**: no cost price, no suppliers (both stay in LATER). **Selling price is hidden
  everywhere, the item form included**; the column and its values stay. An item with no price sells.
- **Employees see their own sales** (all dates, no void) and get **account notices only**.
- **Unit is picked from a short list**: pc, set, box, pair, liter, meter; existing free text is
  converted.
- **Thresholds (pick 1A)**: period 30 days with a 7 / 30 / 90 switch, cover target 14 days, slow
  stock 60 days without a sale.
- **Home card (pick 2A)**: "Order next" above the recent list, top 5 items, linking to Stock · Reorder.

### One vocabulary

Labels only: routes, tables, columns and reason values keep their names.

| Idea | The one name | Replaces |
|---|---|---|
| Selling | **Sell** (tab, sidebar, page title); switch **New sale / Sales history**; a record is a **Sale** | Transaction, New transaction, History |
| The ledger | **Stock history**; one row is a **stock change** | Recent activity, Recent movements, Movement |
| Stock coming in (`restock`) | **Delivery**; action **Receive delivery** | Restock, Add stock, Stock in |
| Fixing the number (`correction`) | **Stock count**; action **Count stock** | Correction |
| Stock written off (`damaged`) | **Damaged or lost** | Deduct, Damaged, Stock out |
| What to buy | **Order list** (never used for a sale) | — |

The Stock in / Stock out filter becomes reason chips: Deliveries, Counts, Damaged or lost, Sales.

### Where everything lives

| Thing | Phone | Desktop |
|---|---|---|
| Receive delivery, Count stock, Damaged or lost | Three labelled buttons at the top of the Stock tab, above the switch | Buttons at the right of the Stock page header |
| Reorder / History | Switch under the actions, Reorder first | Same switch; History pages 20 rows |
| History filters | Search + reason chips; person filter in the filter sheet | Same, inline in the toolbar |
| Single-item shortcuts | Item page hero and Inventory row ⋯ menu: the same three actions, the same flow, that item already picked | Same |
| Stock change page | Titled by the item, the reason as a badge | Same |
| New sale / Sales history | Sell tab switch; an employee sees only their own sales | Same |
| Order next card | Home, above the recent list; rows carry a labelled button | Home, in the empty right column |
| Recent list on Home | "Recent stock changes", sales hidden, 5 rows, See all → Stock · History | Same |
| Order list bar | Bottom of Reorder, like the cart bar | Same |
| Masterfile | Under Inventory, with the round back button | Same |
| Push prompt | Bell and Account only, off the top of Home | Same |

### The four flows

- **Sell** (unchanged): Sell → pick → cart → Complete → success sheet. Only the words change, the
  price text goes and top sellers come first.
- **Receive a delivery**: Stock → Receive delivery → pick items like the sell picker → a quantity
  per item → review ("5 items, 62 pieces") → Save (all or none) → success. With an order list it
  opens pre-filled; each quantity is confirmed or changed and what did not arrive stays open.
- **Count stock**: Stock → Count stock → pick items or a whole category → type the shelf count
  beside the app's count → review shows only the differences → Save. A matching item records
  nothing. The app saves the **difference found** (counted − the on-hand the screen showed), never
  the absolute number, so a count queued offline does not erase sales made before it syncs.
- **Damaged or lost**: Stock → Damaged or lost (or the item page) → one item → quantity → optional
  note → before → after preview → Save.

Owner's restock loop: Home "Order next" → Stock · Reorder → Add to order list → Share to the
supplier → delivery arrives → Receive delivery (one save).

How the analyzer decides (plain arithmetic, shown to the owner, never a black box):
- Pace = units sold in the period ÷ days (voided sales excluded; a newer item uses its own age).
- Days left = on hand ÷ pace.
- Order now = Out, at or under the warning quantity, or days left under the cover target.
- Suggested quantity = pace × cover target − on hand, rounded up.
- Fast movers = ranked by units sold, with the number of transactions.
- Slow stock = has stock, no sale in 60 days.
- Too few sales → "Not enough sales yet", not a guess.

Audit findings by phase: Phase 1 = S1, S2, S6, S7, S8, F1, F2, F3, F6, F8, F9 · Phase 2 = F7 ·
Phase 3 = S3, S4, S5, F10 · Phase 5 = F4, F5.

### Phase 1: Words, prices, history (no migration) — done 2026-11-13 (v1.51)

- [x] Vocabulary: the table above in enum labels, navigation, page titles and the Sell switch.
- [x] Prices hidden: Sell rows, cart, totals on Sales history and the sale page, the item form and
      Details, the Inventory subtitle.
- [x] Stock history: sales and voids hidden by default; search; reason chips replace Stock in /
      Stock out; person filter; a sale row opens its sale page; desktop pages 20 rows.
- [x] Stock change page: titled by the item, the reason as a badge.
- [x] Home: "Recent activity" → "Recent stock changes" (sales hidden, 5 rows, See all → Stock ·
      History); the Needs attention restock button gets a label.
- [x] Push prompt in the bell and Account only.
- [x] Masterfile uses the round back button; item page hero on-hand figure at its real size.

Notes (2026-11-13):
- Chips: Stock changes (default: deliveries, opening stock, damage, counts) · Deliveries · Counts ·
  Damaged or lost · Sales (sales and voids). Search matches the item's name or code (inner join on
  `inventory_items`); Person filters `created_by` from the Team list. A sale or void row opens
  its sale page; others open the stock change page.
- Add stock / Deduct keep their names and reason picker until Phase 3 retires them; only the
  reason labels changed (Delivery, Stock count, Damaged or lost). Home's button reads "Add stock".
- The sale page hero shows pieces sold, not a total. Prices stay in the database; the item form
  carries a saved price through an edit untouched.
- Pagination store keeps only what was written per key; `usePagination(key, defaults)` layers
  the table's defaults under it, so a filter's page reset no longer drops a 20-row page size.
  Every caller of one key passes the same defaults. 20 added to the page-size picker.
- F1 fixed by renaming the type token `--text-hero` → `--text-display` (`text-hero` resolved to
  the `--color-hero` colour); registered in `cn.utils`.
- Masterfile is a pushed route now: phone drops the app bar and tab bar and shows the round back.
- Database-written notification text (e.g. "New item") is unchanged; Phase 5 handles it.

### Phase 2: Analyzer, read-only — coded 2026-11-13 (v1.52)

- [x] Migration 9: one owner-only RPC (per item: sold units, transaction count, pace, days left,
      suggested quantity, last sold, group), computed from `stock_movements`; no new table.
- [x] Analyzer slice: model, service, query key, list hook.
- [x] Stock tab: `ContextSwitch` Reorder | History in `ContentView` `tabs` (copy `TransactionTabSwitch`).
- [x] Reorder view: Order now, Running low soon, Fast movers, Slow stock; 7 / 30 / 90 switch;
      rows open the item page; the four data states.
- [x] Home: "Order next" card above the recent list (desktop: the right column).
- [x] Item page: "Sales pace" section.

Notes (2026-11-13):
- Decided: Running low soon = under twice the cover target (14–28 days left); "Not enough sales
  yet" = fewer than 3 sales in the period (an Out / low item still shows under Order now, with
  on hand instead of a suggestion); Slow stock only for items at least 60 days old; the sidebar
  reads "Stock" (page title "Stock", the tab "History").
- `stock_analysis(p_days, p_cover_days, p_slow_days, p_min_sales, p_item_id)` is `security
  invoker` and refuses non-owners; the thresholds live in `enums/analyzer.enum.ts` and are sent on
  every call. Whole-shop calls return only items that need a look or sold something. A partial
  index on sale rows (`stock_movements_sale_idx`) backs it. Voided sales are excluded; sales from
  before transactions count one each.
- Home's Order next always reads 30 days and shares the Reorder view's cache at 30 days. Its rows
  carry no button yet; Phase 5 adds "Add to order list".
- Home's See all links set the Stock tab first (Order next → Reorder, Recent → History);
  `AppButton` now passes `onPress` to its link form.
- Sweep: `stock_analysis` is a read RPC in `sweep.mjs`; `FIXTURES=<json>` answers an RPC whose
  migration is not applied yet; an `item-page` capture opens the first Inventory row.

### Phase 3: Receive delivery, Count stock, Damaged or lost — coded 2026-11-14 (v1.53)

- [x] Migration 10: a multi-item, all-or-none receive RPC (`restock` rows) and a stock count RPC
      (lines of item, counted, on-hand seen; records the difference as `correction`, nothing when
      they match); both take a `client_id` (offline replay safe) and go through `runWrite`.
- [x] Stock tab: the three action buttons (phone: top row; desktop: page header).
- [x] Receive delivery: picker → quantities → review → success screen.
- [x] Count stock: pick items or a category → shelf counts → review of differences → save.
- [x] Damaged or lost: today's Deduct dialog without the reason picker (`damaged`, optional note).
- [x] Item page hero and Inventory row ⋯ menu open the same three with the item picked; the old
      Add stock / Deduct dialogs retire and the client stops sending `correction` by hand.

Notes (2026-11-14):
- Decided: a count whose difference would take an item below zero (sales since the screen showed
  its number) refuses the whole save and names the item to recount; Damaged or lost from the Stock
  tab opens a picker page (`/movements/damaged`), tapping an item opens the sheet.
- `receive_delivery(p_lines, p_note, p_client_id)` and `record_stock_count(p_lines, p_note,
  p_client_id)` are owner-only `security definer`. No schema change: each row's `client_id` is
  `md5(batch id || item id)::uuid`, so a replay is ignored and a concurrent duplicate hits the
  unique index. `record_movement` is unchanged (damaged, and older queued writes).
- Pushed pages `/movements/receive`, `/movements/count`, `/movements/damaged`, all on the one
  `ItemPickerTable` (Sell uses it too) with a picker key each. From an item (hero, row ⋯ menu,
  Home's Needs attention "Receive") the flow opens on its sheet with the item picked; the success
  screen pops back the way it came.
- Count: "Count all in <category>" shows once the picker is filtered to a category (up to 200).
  A count with no differences sends nothing and says so. Delivery and count drafts live in
  memory only, like the cart.
- `QuantityInput` (common/form) is the one typed quantity: cart, delivery review, count sheet.
- Sweep: receive, count, damaged pages and their sheets; employee guards for the new routes.

### Phase 4: Order list — coded 2026-11-14 (v1.54)

- [x] Migration 11: a saved order list (header + lines, FKs, RLS owner-only), one open list at a time.
- [x] Add from a Reorder row or "Add all suggestions"; adjust and remove on a pushed order-list page.
- [x] A bar on Reorder like the cart bar: "Order list · N items".
- [x] Share: plain text through the Web Share API, copy as the fallback.
- [x] Receive delivery opens pre-filled from the list; partial deliveries keep the rest open and
      the list closes when fully received.

Notes (2026-11-14):
- Decided: receiving from the list is a new `receive_order_list(p_list_id, p_lines, p_note,
  p_client_id)` that calls `receive_delivery` (unchanged) and takes what arrived off each line in
  the same save; a line received in full (or over) goes, a fully received list is closed and
  kept (`status closed`, `closed_at`). An item without a suggestion (too few sales) goes on with
  enough to clear its warning quantity (`reorder_level − on_hand + 1`, at least 1). "Add all
  suggestions" sits on Order now only; an item already on the list shows "On list" and Add all
  skips it (its quantity is changed on the list page).
- `order_lists` (a partial unique index keeps one `open`) + `order_list_lines` (quantity = still to
  come, unique per list and item). Lines are added only by `add_to_order_list(p_lines)` (opens a
  list if none, skips items already on it, so a replay changes nothing); the owner updates
  `quantity` and deletes lines directly through `runWrite`.
- `/movements/order-list` is a pushed owner page. Quantity changes show at once (the open-list
  cache is patched) and are saved after a 600 ms pause, flushed on leaving the page. Share sends
  "Order list — <date>" + "• Name (CODE) — 12 pc" lines (`utils/order.utils.ts`,
  `hook/common/share.hook.ts`). Receive fills the delivery draft from the list, carries the list
  id, and opens the review; the success sheet says the rest stays on the list.
- Sweep: `FIXTURES` also answers a table read (`{ "order_lists": <row> }`); `order-list` screen and
  the employee guard added.

### Phase 5: Employee and polish — coded 2026-11-14 (v1.55)

- [x] Migration 12: employees read their own sales (RLS); `app.notify` stops sending "New item" to
      employees; unit text converted to the list (show the user any value that does not map first).
- [x] Sales history for an employee: own sales, no void.
- [x] Item form: unit picked from pc, set, box, pair, liter, meter.
- [x] Sell picker: top sellers first by default (needs a sold count employees may read).
- [x] "Add to order list" from Home's Order next rows and the item page.

Notes (2026-11-14):
- Decided (all A): top sellers = units sold since the item was created; the old "New item"
  notices in employees' bells are deleted. Units before the migration: `pc` ×17, `pcs` ×2 →
  `pc`; the migration stops itself if any value is left unmapped.
- `transactions_select` = owner, or staff on their own `created_by`; a second `stock_movements`
  select policy gives staff their own `sale` rows (the sale page lines). An archived item's line
  shows "Deleted item" to an employee (they cannot read archived items). `viewTransactions` is
  every staff role now; `voidTransaction` stays owner-only.
- The `inventory_items_new_push` trigger and `app.push_item_event()` are dropped (employees were
  its only recipients); `app.notify` and `app.push_employees()` are unchanged.
- `inventory_items.units_sold` (sales − voids, backfilled) kept by the `stock_movements_units_sold`
  trigger; owners have no update grant on it. The Sell picker orders `units_sold desc, name`
  (`topSellersFirst` on `ItemPickerTable`); Receive, Count and Damaged stay A–Z.
- `enums/unit.enum.ts` holds the six units; `IInventoryItem.unit` is `ItemUnit`.
- `OrderAddButton` `full` = the item page's full-width "Add to order list" under Sales pace;
  Home's Order next rows carry the row "Add".
- Sweep: `ORDER_STRIP=<column>` drops a sort on a column not migrated yet; employee `txn-detail`.
- Migration 12 verified live (2026-11-14): 19 items `pc`, `units_sold` backfilled, the employee
  reads only sale #1 and its two lines. Sweep: 252 captures, 0 console errors; 8 account-menu
  clicks time out on phone/tablet and the History chip row reports Damaged/Sales off-screen —
  neither screen changed in this phase, left for a later check.

### Phase 6: Motion and premium feel (no new library) — coded 2026-11-14 (v1.56)

- [x] Motion tokens (durations, easings) in `theme.css`; everything honours reduced motion.
- [x] Pushed pages slide in and back (View Transitions); tab changes cross-fade.
- [x] Press feedback on buttons and rows; sliding `ContextSwitch` and tab bar indicators.
- [x] Sheets spring and follow the finger; skeletons cross-fade into content.
- [x] Stat cards and totals count to their value; the cart bar bumps on add.
- [x] Animated check on checkout, Receive and Count; a short vibration on Android.

Notes (2026-11-14):
- Tokens: `--motion-fast/base/slow` (120/200/320 ms) and `--motion-ease-standard/emphasized/spring`
  in `:root`; used as `duration-(--motion-…)` / `ease-(--motion-ease-…)`. Keyframes `pop`,
  `check-draw`, `content-in` in `@theme`. Shared classes in `styles/common/motion.styles.ts`.
- Page motion: the content box is `view-transition-name: page` in both shells; `data-nav` on
  `<html>` (`utils/transition.utils.ts`) picks push / back / fade. `useTransitionNavigate`
  (navigation.hook) sets it and passes `viewTransition` — used by `RouteRoot`'s aria
  `RouterProvider` and every component that navigated with `useNavigate`. A target with
  `handle.pushed` pushes; leaving a pushed page goes back; else fade. The back gesture is a
  history pop (`useHistoryPopDirection`). Data hooks (post-save redirects, inbox taps, signed-out
  flows) still use plain `useNavigate`, so they get the old fade-in only.
- Tab bar: one indicator `li` slides by `count` / `index` cva variants. Chip rows fade at the
  right edge on compact and scroll the picked chip into view (decision A for the History chips).
- `useSwipeToClose`: rubber-bands upward, closes past 96 px or on a flick (> 0.5 px/ms), else
  springs back; `AppModal` sheets (not `flow`) drag by the header too. Bottom sheets enter and
  leave from `translate-y-full`.
- `CountUp` (`components/common/view`) + `useCountUp`: animates the React-rendered text node,
  so the DOM always ends on the real figure; `bump` springs it via WAAPI. StatCard numbers and
  the Cart, Delivery, Count and Order list bars use it.
- `SuccessModal`: badge pops, check draws, `vibrateSuccess()` (Android only) on open.
- Sweep fixes: `account-menu` is wide-only (phones and portrait tablets have no button; the
  Account tab stands in), and buttons inside a sideways-scrolling row are not "offscreen".

## Flow audit (2026-11-13): stock movement and the whole flow

The user finds the flow confusing, **stock movement above all**. Audit only, nothing fixed. **Money is
out of scope** (inventory only; prices step out of the picture). Next conversation (Fable 5.2):
decide the flow redesign with the user, then fold it into V1.7's phases **before** V1.7 Phase 1 is
built (Phase 1's open picks, thresholds 1A and Home card 2A, wait on this).

**Decided 2026-11-13**: all six questions are answered and folded into V1.7 (above), which also
lists the phase that fixes each finding.

Sweep: owner + employee, phone 390 and desktop 1440, light, dev server `localhost:5173`, writes
faked; 53 steps, 0 console errors. Script `flows.mjs` in that session's scratchpad (not in the repo).

### Stock movement (the core confusion)
- S1 One idea, six names: "Stock history" (sidebar, page), "Stock" (phone tab), "Recent activity"
  (dashboard), "Recent movements" (item page), "Movement" (detail route), "Stock in / Stock out"
  (filter).
- S2 Every sale lives in two histories: Transaction → History (one receipt) and Stock history (one
  row per line). 7 of the first 8 Stock history rows are sales, burying restocks and damage.
- S3 The Stock tab is read-only. Add stock / Deduct live elsewhere: item page hero, Inventory row ⋯
  menu, a dashboard icon.
- S4 "Correction" is a reason under both Add stock and Deduct; fixing a wrong count means working out
  the difference and its direction. No "set the count to X" (stock count).
- S5 A delivery is entered one item at a time (open item → Add stock → save → back → repeat).
- S6 Movement detail is titled by its reason ("Sale"), the item under it.
- S7 Dashboard "Needs attention" restock button is an unlabelled box icon.
- S8 Stock history filters only in / out: no search, no reason, item or person filter (PROD-01).

### The rest of the flow
- F1 Item page hero on-hand figure renders small (known `onHandValue` `xl` bug, Phase 1 of V1.5).
- F2 Price noise while money is out of scope: "No price set" on every Sell row, cart "No price" /
  "No prices set", "—" totals on History and the transaction page, "Selling price" in the item
  form and Details, Inventory subtitle "…and its price".
- F3 Selling has three names: tab "Sell", page "Transaction", switch "New transaction / History".
- F4 Unit is free text: "49 pcs" beside "pc" everywhere else.
- F5 Employee bell: 17 "New item" notices (noise for someone who only sells); employees cannot see
  their own past sales.
- F6 The push prompt shows three times (dashboard top, bell, Account) and takes the top of the
  phone dashboard.
- F7 Desktop dashboard mostly empty; "Recent activity" repeats Stock history.
- F8 Masterfile hides behind an Inventory button and uses "Back to Inventory" text, not the round
  back button of pushed pages.
- F9 Desktop Stock history pages 8 rows at a time.
- F10 No "receive a delivery" or "stock count" flow; only single adjustments.

Works, keep: sell flow (pick → cart → complete → success sheet), rows open pushed pages, void with
its one-line explanation, the add-stock before → after preview, Deduct disabled at 0.

### Questions for the planning conversation
1. Stock history: keep sales in it, hide them by default, or show sales only through Transaction
   History (S2)?
2. What the Stock tab is for: a place to act (Receive delivery, Count stock, Damaged/lost, plus the
   V1.7 Reorder view) with history underneath (S3, S5, S10)?
3. Replace "Correction ±" with a **stock count** (enter what is on the shelf, the app records the
   difference) (S4)?
4. One vocabulary across the app (S1, F3): e.g. "Sell" / "Sales", "Stock in" / "Stock out",
   "Stock history".
5. Hide prices everywhere for now (F2), or keep the optional price field but drop it from lists,
   cart and history?
6. Employee: own sales history yes/no; which notices they get (F5).

Answers (2026-11-13): 1 hidden by default, a Sales chip shows them · 2 yes · 3 yes · 4 the word
list in V1.7 · 5 hidden everywhere, the item form included · 6 own sales yes, account notices only.

## V1.5: Pushed detail pages for every list (no drawers)

Decided with the user on 2026-10-27: tapping any list row opens a **new page**, never a drawer, sheet
or detail modal. On phones the page hides the app bar and tab bar and shows only the round back
button; on desktop it sits in the normal shell with "Back to <section>". One phase per conversation.

### Reference implementation: Inventory item page (done 2026-10-27, v1.44)

Copy these; do not invent a second way:
- Route: `ROUTES.item` + `itemPath()` in `utils/route.utils.ts`; entry in `protected.view.routes.ts`
  with `isNotNav`, `can` + `permissionLoader`, `handle: { pushed: true } satisfies IRouteHandle`.
- Shell: `usePushedRoute()` (navigation.hook) → PhoneShell drops AppBar + TabBar and adds safe areas;
  ContentView swaps "Back to…" for `BackButton` on compact. No per-page shell work needed.
- Data: `inventoryServices.getById` (explicit columns, `.maybeSingle()`, not-found error);
  `useInventoryItem(id)` keyed `[listKey, "item", id]` so existing invalidations reach it, with
  `placeholderData` from the cached list row (instant paint).
- Page: `pages/ItemDetail/ItemDetailView.tsx` = `ContentView back` + panel + the modals it opens.
- Panel layout (ui-ux-pro-max checked): heading (name, then code · meta) → hero `SectionCard`
  (the key number + primary actions) → "Details" grouped `DetailRows` → related list
  (direction icon + sign, never colour alone) → "Manage" at the bottom (edit first, destructive
  last, soft red, confirmed, with a one-line explanation). No sticky bars over content.
- Entry points: row tap and the row menu's "View details" both `navigate(<path>(id))`.

### Checklist for every page (a phase is not done until each holds)

- [ ] Route + path helper + `handle: { pushed: true }` + same permission as the list
- [ ] `getById` service + `use<Thing>(id)` hook under the list key prefix, placeholder from list cache
- [ ] Page is layout only; panel splits into hero / list / manage components
- [ ] Loading, not-found/error with retry, empty related list
- [ ] Deep link and refresh work; back pops history, falls back to the section
- [ ] Old modal/sheet + its modal key deleted (confirm with the user first)
- [ ] `yarn build` + `yarn lint` clean; `visual-test` at 360 px light and dark; commit (TARTAR format)

### Phase 1: Sell — transaction detail page (done 2026-10-28, v1.45)

- [x] Promote the shared pieces now that a second page needs them:
      `itemDetailSection/SectionTitle/Surface/Page` styles → `styles/view/detailPage.styles.ts`, a
      `common/view/DetailPageSection` (title + children), and `findCachedRow(queryClient, listKey, id)`
      in `utils/query.utils.ts`; switch the item page to them. Also promoted: hero
      (`detailHero*`), related list (`detailPageList/Row/RowText`) and manage
      (`detailManage*`) styles.
- [x] `/transaction/:transactionId` (`can: "viewTransactions"`), `transactionServices.getById`,
      `useTransaction(id)`; lines keep using `getLines`.
- [x] Panel: heading "Transaction #N" + date · seller → hero (total, status Completed/Voided) →
      Lines list → Voided details (when voided) → Manage: "Void transaction" (owner,
      `voidTransaction`), still opens the existing void form modal.
- [x] `TransactionHistoryTable` row tap navigates; delete `TransactionDetailModal` +
      `transactionDetailModalKey`.
- [x] Checked 2026-10-28, owner at 360 px light + dark and 1440 light: history tap → page (tab
      bar hidden, round back), back keeps the History tab, refresh + deep link load, void form
      opens (writes faked), voided shows its section and no Manage, unknown id → not found;
      employee's typed URL lands on `/transaction`; 0 console errors.
- Found, not fixed (pre-existing, v1.44): `onHandValue` `xl: "text-hero"` resolves to the
  `--color-hero` colour, not the `--text-hero` size, so the item page's on-hand figure is small
  and near-invisible in dark mode.
- Stays as is: `TransactionItemTable` (the sell picker — a tap adds to the cart, it is not a
  detail), the cart sheet and the checkout success modal (flows, not record details).

### Phase 2: Stock — movement detail page (done 2026-10-28, v1.46)

- [x] `/movements/:movementId` (`can: "viewMovements"`), `movementServices.getById`,
      `useMovement(id)` keyed `[movementListKey, "detail", id]`; `transaction_id` added to the
      movement columns. `findCachedRow` now also reads plain-array caches (dashboard recent list).
- [x] Panel: heading = reason, item name under it → hero (`MovementQuantityCard`: direction icon +
      signed quantity, "Left after") → Details (item code, by, when, note) → Related
      (`MovementLinkList`: "Open item", plus "Open the sale" when the movement has a
      transaction). No Manage section.
- [x] New primitive `common/view/RowLink` (+ `styles/view/rowLink.styles.ts`): a react-aria `Link`
      stretched over its positioned row, so a button beside it (`rowLinkRaised`) keeps its own
      tap; optional `onPress` runs before navigating. `dashboardRow` and `detailPageRow` are now
      `relative`. Use it for every non-table row that opens a page.
- [x] `MovementTable` row tap navigates; its `detailSections` are gone.
- [x] Dashboard: `RecentMovementsPanel` rows → movement page; `AttentionPanel` rows → item page
      (Add stock button stays); `StockAlertsList` rows → item page and close the notification
      centre (`onOpen`). Also (user-approved): the item page's "Recent movements" rows open the
      movement page.
- [x] Checked 2026-10-28, owner at 360 px light + dark and 1440 light: list tap → page (tab bar
      hidden), Open item / Open the sale, item page movement row → movement page, refresh + deep
      link, deep-link back → Stock history, unknown id → not found, dashboard rows and Add stock,
      bell stock alert closes the modal; employee's typed URL lands on `/transaction`; 0 console
      errors.

### Phase 3: Masterfile and Team (done 2026-10-28, v1.47)

Decided with the user: brands/categories get **no** page (1A); Team gets one.
- [x] Brands / Categories: `detailSections` / `detailTitle` / `detailActions` dropped; the compact
      row shows name, item count and date, Rename/Delete stay in the row's ⋯ menu (no sheet).
- [x] `/users/:userId` (`can: "manageUsers"`), `userServices.getById`, `useUser(id)` keyed
      `[userListKey, "detail", id]`; `useCanManageUser()` (not self, below the caller's role) in
      `user.form.hook`; `remove(user, onRemoved?)` lets the page go back to Team after a delete.
- [x] Panel: heading name + email → Details (role, status badges, joined, reset asked) → Manage
      (`UserManageActions`: amber Set temporary password / Approve when waiting, Dismiss / Reject /
      Set password / Disable / Turn back on, soft-red Delete last, status hint). Own account and
      higher roles show no Manage.
- [x] `UserTable` row tap navigates; the row menu moved to `menus/UserRowActions` (+ View details).
- [x] Checked 2026-10-28, owner at 360 px light + dark and 1440 light: row tap and View details →
      page (tab bar hidden), password modal, disable confirm, back → Team, refresh + deep link,
      own account read-only, unknown id → not found, Delete (faked) → Team; Masterfile rows open
      no sheet and their ⋯ menu works; employee's typed URL lands on `/transaction`; 0 console
     ### Phase 4: Retire the drawer (done 2026-10-28, v1.48)

- [x] `DataTableList`: the `RecordDetailSheet` path is gone (`detailSections`, `detailTitle`,
      `detailActions`, `cardMetaLimit`, `detailSheetKey`); a compact row's title is pressable only
      with `onRowClick` (navigates, chevron), otherwise the row shows its visible columns.
- [x] Deleted (user-approved): `RecordDetailSheet`, `RecordDetailSection`, `SheetActions`,
      `rowDetailSheetModalKey`, `DetailModal`, `DetailSections`, `DetailGrid`,
      `styles/modal/detail.styles.ts`, `utils/action.utils.ts`; also dropped `visibleDetailSections`,
      `IDetailSection`, `ICardField.title`, the `detail` sheet kind and the sheet/hero styles.
      `DetailRows` + `IDetailItem` stay (the detail pages use them).
- [x] Sell picker (decided 1A): its rows no longer open a sheet; name, price, coloured "N left" and
      Add stay. Masterfile rows unchanged (⋯ menu).
- [x] Docs: `ui-design-conventions` § 5/§ 6, `codebase-engineering` § B, `CLAUDE.md` rule "a list row
      opens a pushed page; never a drawer" + `ui-ux-pro-max` in the screen router row,
      `project-map.md` stale modal lines.
- [x] Full `visual-test` sweep 2026-10-28, signed-out + owner + employee × phone/tablet/desktop ×
      light/dark: 168 captures, 0 console errors, every route guard holds; phone row taps
      navigate on Stock, Stock history, Team, History, Sell picker and Masterfile open nothing.
- Found, not fixed: the sweep's `account-menu` step times out on phone/tablet — the phone app bar
  has no profile button since the redesign (profile lives on Account); the script needs
  `SHEETS.account-menu` limited to desktop. Known: inputs 36 px tall on touch.

rawer)."

## V1.6: Branches (TARTAR style)

Decided with the user on 2026-11-13: the shop gets **branches**, built the way TARTAR does them.
This replaces "one shop, one stock" from 2026-10-02 (it is still one shop — no tenancy, no SaaS).
One phase per conversation; each ends with `yarn build` + `yarn lint` + a `visual-test` pass.

Rules (the user's answers):
- **Each branch has its own stock.** The item catalog (code, name, category, brand, unit, price)
  stays shared; the count lives per branch. A sale deducts only from the branch that sold it and
  Low / Out is judged per branch.
- **Staff work like TARTAR.** Developer and owner see every branch and get the header switcher
  ("All branches" or one branch, remembered on the device). Each employee is assigned one or more
  branches under Team and sees and sells only in those.
- **Existing data moves into a first branch named "Main"** (all stock, movements, transactions,
  every current employee). Nothing is deleted; Main can be renamed.

Assumptions to confirm in Phase 1's plan (not yet decided by the user):
- The warning low stock quantity stays **one number per item**, applied to each branch.
- A branch is **archived, never deleted**, and only when it holds no stock.
- "All branches" is a **viewing** scope. Any write (sell, add or deduct stock, new item's opening
  stock) needs one branch; with "All branches" selected the form asks which.

TARTAR files to port (`Ejie_Business/TARTAR/src`): `hook/data/branch/branch.{list,scope,manage}.hook.ts`,
`store/data/branch/branch.store.ts`, `components/common/layout/ProtectedBranchScope.tsx` +
`BranchScopeList.tsx`, `components/branch/tables/BranchesTable.tsx`, and the `app.can_see_branch`
RLS helper. Moti differences: branches have a **uuid** id (not a slug) and assignments live in a
`user_branches` table with foreign keys (not a `text[]` on the user).

### Phase 1: Database, Manage branches, header switcher — coded 2026-11-14 (v1.57, migration 13 waits to be applied)

Decided 2026-11-14 (all "A"): one warning level per item, copied onto each `branch_stock` row so
the status can be generated; archive only with no stock and never the last active branch;
"All branches" is view-only (writes fall back to Main until Phases 2–3 ask); owners and the
developer always see the switcher (it hides only for an employee with one branch); a branch
carries an item once it is created there or receives it (sparse rows, no flood of "Out").

Notes (2026-11-14):
- Migration is **13** (`20261114000013_create_branches.sql`), not 9; it also gives
  `receive_delivery`, `record_stock_count` and `receive_order_list` an optional `p_branch_id`.
  The order list stays one shop-wide list; a delivery picks its branch in Phase 3.
- Helpers: `app.first_branch()`, `app.can_see_branch()`, `app.write_branch()` (fallback +
  locks the branch row against a concurrent archive), `app.lock_branch_stock()` (creates the
  row at 0, locks item then row). A new employee is put in the first branch by a trigger on
  `users` until Phase 5 adds the picker.
- `inventory_items.on_hand` / `stock_status` are still the all-branches total, so every screen
  reads exactly as before; employees still see the total until Phase 3.
- UI: `components/common/layout/ScopeMenu` (dropdown on wide, sheet on compact) wrapped by
  `components/branch/menus/BranchSwitcher`, passed through `AppLayout`'s header actions;
  `/branches` page copies the brand table. `manageBranches` permission.
- `useStockActions` / `useReceiveOrderList` now use `useTransitionNavigate` (they open pushed
  pages from a tap, not post-save redirects), so Receive / Count / Damaged slide in.

- [x] Migration 13 `create_branches` (Claude writes it, the user pastes it into the SQL editor):
      `branches` (id, name unique by lower(name), sort, archived_at); `user_branches`
      (user_id, branch_id); `branch_stock` (branch_id, item_id, on_hand ≥ 0, generated
      `stock_status`) backfilled from `inventory_items.on_hand` into Main; `branch_id` (not null,
      FK, indexed) on `transactions` and `stock_movements`, backfilled to Main.
      `inventory_items.on_hand` is kept as the all-branches total, maintained by a trigger on
      `branch_stock` (no column dropped).
- [x] RLS: `app.can_see_branch(branch_id)` — owners and the developer always, employees through
      `user_branches`; applied to `branch_stock`, `transactions`, `stock_movements`. Branch writes
      are owner-only.
- [x] RPCs take a branch: `record_transaction`, `record_movement`, `create_item` (opening stock),
      `inventory_summary(p_branch_id default null)`; `void_transaction` returns stock to the
      transaction's own branch. A missing branch falls back to the caller's only branch, else Main,
      so the current app and queued offline writes keep working until Phases 2–3 land.
- [x] Low / Out push + inbox trigger moves from `inventory_items` to `branch_stock` and names the
      branch; the 08:00 digest counts per-branch rows.
- [x] Branch slice: `models/data/branch`, `services/data/branch.services.ts`, `branch.list.hook`,
      `branch.manage.hook`, `branch.scope.hook`, `store/data/branch/branch.store.ts` (persisted
      `branchFilter`, key in `storage.keys.ts`), query + modal keys.
- [x] `/branches` Manage branches page (owner + developer): table, add, rename, archive — through
      `EntityFormModal` and `runWrite`.
- [x] Header switcher: desktop `AppHeader`, phone `AppBar`; hidden when the account can see only
      one branch. Nothing is filtered by it yet.

### Phase 2: Transaction — coded 2026-11-14 (v1.58, no migration)

Notes (2026-11-14):
- `useActiveBranch()` (in `branch.scope.hook.ts`): `branch` = the switcher's pick, `writeBranch` =
  that pick or the only active branch in reach, `multiple` = more than one branch (archived count).
  `useBranchScope.setBranch` confirms before a switch that changes the cart's branch, and resets
  every `branchScopedTableKeys` page.
- The pick in `BranchPickPanel` (`components/branch/panels/`) sets the header switcher; Phase 3's
  writes reuse it. History has no in-table branch filter: the switcher is the filter.
- `inventoryServices.getList({ branchId })` left-joins `branch_stock` filtered to the branch; an
  item the branch does not carry reads 0 / Out. Only the Sell picker passes it so far; top sellers
  still rank by all-branch sales.
- Visual test: owner + employee sweep of Sell / cart / History / detail (54 captures, only the
  known 36 px search input), plus a faked second branch (pick panel, switch-clears-cart confirm,
  North picker all Out, Branch column, detail meta) at phone light and desktop dark.

- [x] Sell picker shows the active branch's stock (`branch_stock`); the cart belongs to one
      branch and is cleared (after a confirm) when the branch changes; checkout sends the branch.
- [x] With "All branches" selected, New transaction asks for a branch first.
- [x] History: **Branch** column (hidden when a single branch is selected), list follows the
      switcher; server-side filter on `branch_id`.
- [x] Transaction detail page: branch in the heading meta; void unchanged.
- [x] Offline queue: the queued payload carries the branch.

### Phase 3: Inventory and Stock history — coded 2026-11-14 (v1.59, no migration)

Decided 2026-11-14 (both "A"): with one branch picked, the stock list shows only the items that
branch carries (Low / Out judged on its `branch_stock` row); "All branches" keeps the totals. A new
item on "All branches" picks its branch inside the Add item form.

Notes (2026-11-14):
- "The branch" for reads and writes is `useActiveBranch().writeBranch` (the pick, or the only
  branch in reach), so a one-branch employee never reads shop-wide totals. Stock history follows
  `branch` like sales History. `inventoryTableKey` and `movementTableKey` joined
  `branchScopedTableKeys`.
- Count sends `on_hand_seen`, so every picker, the item page and "Count all in <category>" read the
  branch's count (`getById` / `getByCategory` take a branch). The delivery and count drafts carry a
  `branchId` like the cart; `useBranchScope.setBranch` confirms before a switch that would move any
  of the three ("Clear stock count and switch").
- `BranchWriteGate` (`components/branch/panels/`) is the loading → error → `BranchPickPanel` gate;
  Sell, Receive, Count and Damaged render through it. From an item on "All branches", Receive /
  Count / Damaged open the page (which asks) instead of pre-picking the total's count; an order
  list fill opens its review only once a branch is known. Item-page stock actions are disabled
  while a cached row (possibly another branch's count) is on screen.
- Known gap: a delivery filled from the order list shows before → after from the total until the
  order list gets its branch filter.
- Visual test: owner + employee sweep of the touched screens (68 captures, only the known 36 px
  inputs), plus a faked "North" (All-branches totals + By branch, North hero / list / pickers,
  Branch column, pick panel, form Branch field, switch-clears-count confirm on desktop).

- [x] Inventory list: on-hand and status for the selected branch; "All branches" shows the total.
- [x] Item page: hero shows the selected branch (or the total), plus a "By branch" list.
- [x] Receive / Count / Damaged: write to the selected branch, ask when "All branches".
- [x] New item: opening stock goes to the chosen branch.
- [x] Stock history: Branch column + follows the switcher; movement detail page shows the branch.

### Phase 4: Dashboard, alerts, notifications — coded 2026-11-14 (v1.60, no migration)

Decided 2026-11-14 ("A"): on "All branches" the summary cards stay on each item's total (like the
Inventory Low / Out tabs, captioned "By total across branches"), while Attention and the bell list
each branch's shelf (like the 08:00 digest), subtitled "N low or out across branches".

Notes (2026-11-14):
- Cards and alerts use `writeBranch` (like the inventory list); Home's recent stock changes use
  `branch` (like Stock history). All three carry the branch in their query key under the old prefix.
- `getAlerts` reads `branch_stock` (inner-joined item and branch, archived ones left out) and
  returns `IStockAlert` (an `IInventoryItem` at the branch's count + `stock_id` / `branch`), so
  Receive still takes it; on "All branches" Receive opens the page, which asks.
- The branch leads the alert meta ("North · CODE · warning at 5"): after the code it was cut off
  at phone width.
- Push / inbox text needed no change: migration 13 already sends "Low stock" / "Out of stock" with
  "<item> · <code> · <branch> · N left · warning at X" (branch only with 2+ active branches, one
  tag per item and branch). The stored rows all predate it; first real check on a live stock change.
- Visual test: owner at All branches / Main / faked North, Home + bell, phone light and desktop
  dark (12 captures); real `branch_stock` alert query and `inventory_summary(p_branch_id)` ran clean.

- [x] Summary cards, Attention panel and the bell's Stock alerts follow the switcher; in
      "All branches" each alert row names its branch.
- [x] Push and inbox text: "Low stock · <item> · <branch>" (already in migration 13).
- [x] Home's recent stock changes follow the switcher and name the branch on "All branches".

### Phase 5: Team

- [ ] Create / edit employee: assign branches (at least one); user detail page lists them.
- [ ] Approving a sign-up asks for the branch first.
- [ ] Employee shell: branch name in the header; a switcher only when assigned more than one.
- [ ] Check with the test accounts that an employee cannot read or sell in another branch
      (typed URL, direct RPC).

### Phase 6: Transfer stock between branches (confirm with the user before building)

- [ ] One action that moves a quantity from branch A to branch B as a paired out + in movement.
      Until then an owner deducts in one branch and adds in the other.

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
- [x] Phase 4 (2026-10-07): table / filter system — TARTAR's `IDataTableColumn` (`models/common/table.model.ts`,
      `mobile` roles, `listHidden` / `listRender`, `collapse`) replaces TanStack `ColumnDef`
      (`@tanstack/react-table` removed); `DataTableList` draws compact rows from the roles (the six
      `*/lists/*Row` files, `ListRow` / `ListGroup` and the expansion hook/store are gone); ruled
      TARTAR grid + `TableEmptyState`; DataTable owns paging — numbered `TablePagination` on wide,
      `LoadMoreSentinel` (grows the page) on compact; plain `TablePanel`; TARTAR `RowActionMenu`;
      `FilterToolbar` is layout only (`toolbar-searching`), keyed search/selects/sheet moved to
      `FilterBar` + `filter/SearchInput`; the 4 table switches are `ContextSwitch` above the toolbar;
      table/filter styles on `compact:` / `wide:`. Not ported: selection, sort, row focus, pending-sync
      rows, `RecordDetailSheet` (phase 5). No ContentView `toolbar` slot needed.
      `SegmentedControl` stays for AccountDeviceCard only
- [x] Phase 5 (2026-10-07): form / modal / detail kit — TARTAR's modal frame (panel, `rounded-sheet`,
      tinted footer) with `kind` sheet heights + `pinned` row on `AppModal` / `AppSheet` (Moti's
      `onOpenChange`, `description`, `hideHeader`, `dismissible` and back gesture kept);
      `ConfirmationModal` is a centred bottom sheet on compact (phrase gate kept); `DetailGrid` +
      `detail.utils` (empty / `hidden` items drop); `RecordDetailSheet`, `RecordDetailSection`,
      `DetailRows`, `SheetActions` wired into `DataTableList` (`cardMetaLimit` 2, `detailSections`,
      `detailTitle`, `detailActions`); `EntityFormModal` uses card `FormSection`s that fold on compact
      (`useSectionDisclosure`), `kind="form"`, `submitKind`; `fieldSpan` cva; modal/form styles on
      `wide:`. Not ported: `FormSummary(Bar)`, `deriveValues`, `intro`, `DetailPanel`, `RowDetailPanel`.
      Screens pass `detailSections` / `detailActions` in phase 7
- [x] Phase 6 (2026-10-07): cards and states — TARTAR's `SectionCard` (`subtitle`, `extra`,
      `stackExtra` on `compact:`, `flush`, `dense`, `loading` / `error` / `onRetry`) and `StatCard`
      (Card + `@container/stat` reflow, `variant` tone chip, `chip`, `caption`, `href`, `raw`,
      peso by default, `loading` / `error`); `EmptyState` replaces `StateBox` (Moti's `compact`
      line and loading text kept); `ErrorState` is TARTAR's Empty block + `compact`, keeping
      `describeError` (offline = warning chip); `RefreshBar` over `DataTableList` while refreshing;
      `toneText` / `toneChip` / `toneFill` on Moti tone names; `moneyLevel` ported (not yet used);
      no `md:` left in card/status styles. `StateBox.tsx`, `LoadingBar.tsx` and
      `styles/state/state.styles.ts` are unused, waiting for the user to delete them. Not ported:
      `InfoCard`, `StatDelta`, `ProgressRow`, `StatusTag` (StatusBadge stays)
- [x] Phase 7 (2026-10-07): screens migrated — `moneyLevel` for prices and totals (inventory,
      cart, receipt, transaction detail); Transaction (New / History) and Masterfile (Categories /
      Brands) switch through `ContextSwitch` in ContentView `tabs` (`*TabSwitch`, Masterfile's add
      button in `actions`); Movements, Users, Brands, Categories pass `detailSections` (+ `detailTitle`)
      and Users / Brands / Categories one `actionsOf(row)` to both `RowActionMenu` and `detailActions`
      (Inventory and Transaction History keep their own detail modals); Dashboard panels use
      `SectionCard` `loading` / `error`, stat tiles carry the error per tile; Auth is TARTAR's framed
      card (wave-cut brand hero, `AuthGlassStack`, "or" divider, `bg-auth-hero`); no `md:` left;
      `--text-sm/md/lg` and `--shadow-card-*` removed (`text-md` → `text-body`, `shadow-card-sm` →
      `shadow-card`, `cn.utils` registers TARTAR's shadow/radius names); `ViewTabs`, `SegmentTabs`,
      their styles, `StateBox`, `LoadingBar` and `state.styles` deleted; ui-design-conventions updated.
      `UserRowActions`, `HomeView`, `CheckboxInput`, `LabeledField`, `TextArea` deleted (unused)

## Post-redesign walkthrough audit (next conversation)

Started 2026-10-08 after Phase 7. Goal (user): walk through every part of the app as every role,
audit the bugs, then plan a fix roadmap here before fixing anything.

Done so far:
- Signed-out sweep (login, register, forgot, guard) at phone / tablet / desktop, light and dark:
  0 failed steps, 0 console errors. Fixed: `cn()` did not know TARTAR's text sizes, so
  `text-section` etc. stripped a component's own text colour (Sign in label, auth links) — sizes
  now registered in `cn.utils`; auth title used `text-hero`, which collides with `--color-hero`
  (invisible in dark) — now `text-[2rem]`; auth email/name inputs now match the password group.
- `sweep.mjs` finds page tabs through ContextSwitch (`PAGE_TABS`), not `role=tab`.
- The sweep's 700 ms settle is shorter than the auth fade-in (~1.5 s): a faint first capture of
  /login is timing, not a bug; lengthen the settle for auth screens.

Audit done (2026-10-08):
- [x] Owner and employee sweeps — 144 captures, 0 sideways scroll, 0 clipping, 0 guard failures;
      2 failed steps (owner txn-detail, dark phone + tablet: passes when run alone — T-02);
      6 console errors, all one DNS blip in one capture. Writes faked throughout.
- [x] Known bug reproduced — F-01 below.
- [x] Every flow walked by hand at phone width (writes faked): add/edit/archive item, stock in/out,
      cart and checkout, void, history, masterfile add/rename/delete, team detail/disable/set
      password/add/pending, account password, inbox mark-all-read, offline queue (owner + employee).
- [x] `text-*` / `shadow-*` merge check — passes. All TARTAR sizes, shadows and radii are registered
      in `cn.utils`; `shadow-card/panel/overlay` share names with colour tokens but the build emits
      no colour override, so shadows render as designed.

Verified working, no action: validation messages, success/queued toasts, offline queue + header
"Offline · n" indicator + replay on reconnect, creatable category/brand, deduct over on-hand
blocked, password mismatch, empty Pending state, route guards, list rows tappable across the whole
row (stretched `::after`).

### Findings
High
- F-01 Phone form sections cannot reopen (Add item **and** Edit item). Folding a section changes
  `collapsedSections`, so `useSectionDisclosure`'s `useMemo` hands back a new `resetSections`; the
  `[open, resetSections]` effect in `EntityFormModal` re-runs and unfolds it in the same tick.
  React Aria's panel is left `hidden="until-found"` while `aria-expanded` stays `true` — the
  section looks open (chevron up), shows nothing, and every tap repeats the cycle.
  Direction: reset only when the sheet opens (depend on the stable store action / `formId`).

Medium
- F-02 Folded sections drop their description on phone (`FormSection` collapsible branch never
  renders `description`; desktop shows "You get a low-stock alert…").
- F-03 Row detail sheets repeat fields: category shows a bare "3" under the name, then "Added"
  twice; team member shows Role and Joined twice (`DataTableList` row sheet + the table's column
  roles in `CategoryTable` / `BrandTable` / `UserTable`).
- F-04 Team member sheet: Delete is a full-width red button while the safer, reversible Disable
  is hidden in the ⋮ menu (`UserTable` actions). Swap: Disable visible, Delete in the menu.
- F-05 Destructive tone is inconsistent: item Archive is red in the detail sheet but its confirm
  button is orange; Void transaction's submit is orange (`ConfirmationModal` tone,
  `VoidTransactionModal`). The one-field Void and Add category forms open as full-height sheets
  with most of the screen empty.
- F-06 Deduct over on-hand previews "27 pc → 0 pc" (clamped) beside "Only 27 pc on hand" — the
  preview should show the shortfall or hide (`movement.form.hook.ts` preview + its modal).

Low
- F-07 Cart bar reads "2 items · 3 total"; the receipt says "3 pcs" (`CartBar.tsx`).
- F-08 A tooltip ("One more Brake pad set") appears and stays after a tap on touch
  (`CartQuantityControl.tsx`).
- F-09 Phone toasts (top-center) cover the bell, avatar and the Offline pill; the close × sits
  over the logo (`AppToaster.tsx`).
- F-10 Sheet chrome differs: detail and account-menu sheets have a drag handle with the × above
  the title line; form sheets have no handle and an aligned × (`AppSheet` / `DetailModal` /
  `AppModal`).
- F-11 Desktop dashboard: Needs attention stretches to Recent activity's height, mostly empty.
- F-12 Phone search placeholder truncates to "Search name, item code" (Inventory, Transaction).

Tooling and data
- T-01 `sweep.mjs` flags list rows as small targets (it measures the title button, not the
  stretched row) — hit-test the row instead. ~80 of the 83 flagged captures are this.
- T-02 `sweep.mjs` txn-detail step times out intermittently in dark — wait for the history list.
- T-03 Leftover real test data: "Visual Employee muqu8jcr", "Push Employee muqtwncm", "Push test
  item muqtwncm" — the user decides whether to delete them.

Questions for the user (not bugs): items with no price can be sold and are left out of the total
— intended? Employees have no History tab — matches V1 scope ("owner history and void").

### Fix batches (one per conversation, each ends with yarn build + yarn lint + a re-sweep)
- [x] Batch A: form sections — F-01, F-02 — `components/common/form/EntityFormModal.tsx`,
      `components/common/form/FormSection.tsx`, `hook/common/disclosure.hook.ts`
      (2026-10-27: `resetSections` made stable so the reset-on-open effect no longer undoes a
      fold; folded sections show their description. Re-check at 360 px, light + dark: Add item
      and Edit item, both sections fold and reopen with content, 8/8 pass)
- [x] Batch B: detail sheets — F-03, F-04, F-10 — `components/common/table/DataTableList.tsx`,
      `components/common/modal/DetailModal.tsx` / `AppSheet.tsx`, `CategoryTable.tsx`,
      `BrandTable.tsx`, `UserTable.tsx`
      (2026-10-27: given sections replace the sheet's auto labelled rows and status tags use the
      list face ("5 items"); category/brand/user sections trimmed to what the hero lacks. New
      `priority: "menu"` keeps a danger action in ⋮ — team sheet shows Set password + Disable,
      Delete in ⋮, a reset request is the primary. Grab handle floats in the header padding so the
      × aligns with the title; handle stays only on swipeable AppSheets. Re-check at 360 px, light
      + dark: category, brand, team member, movement, account menu — × centred on the title in all
      10, no repeated fields, 0 page errors)
- [x] Batch C: destructive and stock forms — F-05, F-06 — `ConfirmationModal.tsx`,
      `VoidTransactionModal.tsx`, the archive confirm in the inventory hooks,
      `movement.form.hook.ts` + its modal, form-sheet sizing in `AppModal.tsx`
      (2026-10-27: new confirm kind `danger` — red, reversible, no cannot-be-undone warning —
      used by Archive; Void submits red. `EntityFormModal` gives `size="sm"` forms the hugging
      `action` sheet, so category, brand, Void and Set password no longer fill the phone. Deduct
      over on-hand hides the before → after row and says the shortfall. Re-check at 360 px,
      light + dark: Archive confirm, Void (411 px), Add category (325 px), Set password (443 px),
      Deduct over / within stock, Add item still full height — 14/14 pass, 0 page errors)
- [x] Batch D: polish — F-07, F-08, F-09, F-11, F-12 — `CartBar.tsx`, `CartQuantityControl.tsx`,
      `AppToaster.tsx`, `styles/dashboard/dashboard.styles.ts`, the search placeholders
      (2026-10-27: cart bar reads "7 items · 8 pcs", or just "1 item" when the headline is
      already pieces. `AppTooltip` is off on no-hover screens (`useCanHover`), so a tap never
      leaves a tooltip up; mouse hover still shows one. Phone toasts start under the app bar
      (`toastMobileOffset`). Dashboard panels keep their own height (`wide:items-start`). Search
      placeholder "Name, code or brand" fits at 360 px. Re-check: phone light + dark, desktop
      light + dark — 16/16 pass, 0 page errors. Not covered: a priced cart (test items have no
      price); toasts at 600–768 px still use the desktop offset)
- [x] Batch E: sweep tooling — T-01, T-02 — `.claude/skills/visual-test/scripts/sweep.mjs`
      (2026-10-27: the touch-target check also measures a drawn absolute `::after`, so stretched
      list rows count at full row size. txn-detail waits up to 15 s for the first history card or
      table row instead of guessing before the list loads. Signed-out captures settle 1.6 s.
      Re-sweep: all roles at phone, light + dark — 56 captures, 0 failed steps, 0 console errors,
      0 list-row flags. What remains flagged is the known 36 px inputs (search, auth password,
      account, item-form selects). Owner txn-detail at tablet + desktop, light + dark: 4/4 pass.
      T-03 left in place — the user has not decided)

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
   - [x] Delete the unused placeholder `src/pages/Home/HomeView.tsx` (2026-10-08)
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
- 2026-11-13 (V1.6): **branches, TARTAR style** — replaces "one shop, one stock". Stock is
  **per branch** (shared catalog, `branch_stock` count); owners and the developer scope with a
  header switcher, employees are assigned branches; existing data moves into a first branch
  **Main**; built whole-app in six phases.
- 2026-11-13 (V1.7 flow redesign): **one vocabulary** — Sell / Sale / Sales history, Stock history,
  Delivery, Stock count, Damaged or lost, Order list (labels only, database names unchanged).
  **Stock history hides sales by default.** **Stock count replaces Correction** and saves the
  difference found, not the absolute number. **Selling price is hidden everywhere, the item form
  included** (replaces the 2026-09-24 display-only price; the column stays). **Employees see their
  own sales and get account notices only.** **Unit is a short list**, not free text.

## Who sees what

| Capability | Developer | Owner | Employee |
|---|:-:|:-:|:-:|
| Transaction: search, filter, cart, checkout | ✓ | ✓ | ✓ |
| Sales history | ✓ | ✓ | own sales only (from V1.7 Phase 5) |
| Void a sale | ✓ | ✓ | ✗ |
| Inventory page | ✓ | ✓ | ✗ |
| Receive delivery, count stock, damaged or lost | ✓ | ✓ | ✗ |
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
