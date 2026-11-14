# Moti UX overhaul — implementation brief for Claude

Prepared: 14 November 2026
Repository: https://github.com/cerejie/Moti
Base branch: `moti-development`
Review baseline: `9a4dd0ea9824795faff376b778304d35676c71cd`

## Start here

Act as a senior product designer and full-stack engineer. Implement the following overhaul in the existing Moti application. Deliver working changes, not only a proposal or static mockup. Prioritize understandable user flows, simple language, reliable stock updates, and a native-feeling mobile PWA.

Read the repository's applicable instructions and inspect the current branch before editing. The baseline above was reviewed from source, not tested in a rendered browser; verify every finding against the current code. Preserve newer work. Create a working branch from the current `moti-development` branch; do not force-push, deploy, or execute migrations against production as part of this brief. Use local/test data for verification.

Make reasonable implementation decisions within this specification. Ask only when a missing answer blocks safe progress. Do not add features simply because they are common in inventory systems. Implement in coherent phases, but continue until the required scope is complete. If infrastructure or credentials block a phase, clearly distinguish completed UI from unverified behavior.

## 1. Product purpose and scope

Moti has two core requirements:

1. The owner sees current stock. Employees record customer purchases, which deduct stock automatically. The owner receives low-stock alerts when a product reaches its warning quantity.
2. The owner sees the products with the most units sold over 7, 30, or 90 days and uses that information, together with remaining stock, to decide what to buy next.

This is stock tracking with simple sale recording. Do not expand it into accounting, payment processing, customer management, supplier procurement, or a full POS. Keep existing historical data and auditability. Keep existing optional features accessible where appropriate, without making them mandatory steps.

Success means employees can record a sale without training on inventory terminology, and owners can find a quantity or understand a recommendation without navigating through multiple modules.

## 2. Mandatory design direction

- Organize the app around everyday tasks, not database entities.
- Keep one visually dominant primary action per task screen.
- Retain necessary error prevention; remove duplicated confirmations and success dialogs that require dismissal.
- Use visible text labels with icons. Do not make core tasks depend on recognizing an icon or discovering a gesture.
- Keep the existing brand and reuse the current component system, tokens, forms, query hooks, permissions, and PWA infrastructure where suitable.
- Do not replace the UI framework merely for visual novelty.
- Use clean surfaces, restrained borders, readable typography, and consistent spacing. Avoid decorative dashboard tiles, excessive gradients, and animations that delay work.
- Product names and quantities are the visual priority. Codes, brands, and explanatory text are secondary.
- Use color plus words for status; never color alone.
- Avoid giant desktop layouts squeezed into a phone. Adapt presentation while keeping task names and behavior consistent.

## 3. Approved vocabulary

Use these terms consistently in navigation, headings, buttons, validation, notifications, and empty states. Internal code/database names need not change merely to match UI wording.

| Existing concept | User-facing wording | Usage |
| --- | --- | --- |
| Inventory | Stocks | Main destination for current quantities |
| Sell | Sales | Navigation destination |
| Start a transaction | Record sale | Screen title or action when a start action is necessary |
| Checkout | Review sale | Opens the final item/quantity review |
| Complete sale | Save sale | Commits the sale and deducts stock |
| Transactions | Sales history | Owner history view |
| Employee transaction history | My sales | Employee destination |
| Reorder | What to buy | Main recommendation destination |
| Order now / reorder priorities | Buy soon | Recommendation view |
| Fast movers | Most sold | Ranking by units sold |
| Receive delivery | Add stock | Add newly received quantities to existing products |
| Count stock | Check stock count | Compare physical quantity with the app |
| On hand | Available | Current recorded quantity |
| Reorder level / Warn at | Low-stock alert at | Threshold field |
| Stock movements | Stock history | Audited stock changes |
| Masterfile | Categories & brands | Use only if those are its actual contents; inspect and name other settings explicitly |
| Add item to catalog | New product | Creates a product definition |
| Void transaction | Cancel sale | Owner action; explain that it restores stock |
| Order list | Buying list | Existing optional planning list |

Do not use “Add item” interchangeably for creating a product, adding stock, and adding a product to a sale. A row button may say “Add” when the Sales context is clear.

Sample threshold helper: “Notify me when 5 or fewer remain.” Use the product's real unit when appropriate.

## 4. Information architecture and permissions

### Owner

Mobile primary navigation: **Stocks · Sales · What to buy**.

Default destination: **Stocks**. Replace the separate dashboard landing experience with a compact summary on Stocks. Do not show both Inventory and Stock as separate primary destinations.

Header: page title, visible active branch name when multiple branches exist, notification bell, and profile entry. Fit these without crowding; a branch label can occupy a second header line.

Profile/settings contains Account, Team, Branches, and other occasional administration. Stock history is reachable from Stocks; product-specific history is reachable from the product detail. Owner Sales includes a secondary Sales history view.

### Employee

Mobile primary navigation: **Sales · My sales · Account**.

Default destination: Sales with product selection already ready. Do not require a “New sale” click on every visit. The employee can see only their own sales and stock availability needed for selling. Retain owner-only stock editing, recommendations, staff management, and cancellation privileges unless the current approved permissions explicitly say otherwise.

### Desktop

Use a persistent left sidebar with the same primary labels and role visibility. Put settings near the bottom. Do not reintroduce a long list of operational modules simply because more screen space exists.

Preserve route guards and server-side access controls. Hidden buttons are not authorization. Maintain compatibility for existing bookmarked routes using redirects or contextual mappings. Preserve notification and product deep links.

## 5. Stocks screen

The screen must answer “What do I have left?” immediately.

Top-to-bottom mobile layout:

1. Header and branch context.
2. Compact low/out-of-stock counts. Tapping a count applies the corresponding filter; avoid duplicate status controls if a single chip row can do both jobs.
3. Search: “Search product, code or brand”.
4. Filters: All, Low stock, Out of stock. Put category/brand filtering in one secondary filter sheet. Put Archived inside additional filters.
5. Product list.
6. A clearly available owner action: Add stock. Use one consistent location that does not obstruct the list or bottom navigation.

Each row shows product name, short identifying metadata, quantity with unit, and status. Example: “Engine Oil 1L / EO-001 · Brand / 8 bottles available / Low stock”. Tap the row to open details; do not show separate View, Edit, History, and Delete buttons on every row.

Product detail shows quantity, alert threshold, recent history, and Add stock. Secondary actions include Edit product, Check stock count, Record damaged/lost stock, and Archive. Keep destructive actions separated from normal work.

Stocks secondary menu contains New product, Stock history, and Categories & brands. Keep any existing batch stock-count workflow available as a secondary action. Preserve existing damage/loss capabilities without placing them in primary navigation.

Use a desktop table with sortable quantities/status and appropriate filters. On phones use rows/cards with no horizontal table scrolling. Do not display a combined “total units” across incompatible units such as bottles, boxes, and meters.

## 6. Sales flow — highest priority

### Mobile

1. Open Sales directly into product selection. Auto-select the sole authorized branch. For multiple branches, retain the last valid choice and show its name clearly.
2. Keep search near the top. Use existing popular-product ordering if correct; always allow full catalog search. Do not add barcode scanning unless it already exists or is required separately.
3. Each product row shows name, identifier, available quantity/unit, and Add. Tapping Add selects one unit in the draft sale; it must not deduct committed stock yet.
4. Replace Add with a quantity stepper. Allow direct numeric entry so selling 20 units does not require 19 taps. Use integer or fractional entry according to existing valid unit rules.
5. Show a fixed bottom action only when products are selected: “Review sale · 3 products”. Place it above the navigation/safe area. It must remain reachable when the keyboard opens.
6. Review sale uses a full-height screen/sheet for comfortable reading. Show editable quantities, remove controls, branch, and collapsed optional “Add note”. Show product count and line-specific units rather than summing mixed units as “pieces”.
7. Final primary action: Save sale. This is the confirmation; do not add another generic confirmation dialog.
8. After confirmed server success, show a nonblocking accessible “Sale saved. Stock updated.” status and reset to a fresh selection screen. No mandatory OK, Close, or Start again dialog.

Back from review retains the draft, search, and useful scroll position. Switching ordinary tabs does not silently discard a draft. A branch change with a draft must explain its impact and require an explicit choice; never silently apply the same draft to a different branch.

### Desktop

Product search/list on the left, persistent draft-sale panel on the right. The panel is the review surface, with quantities, branch, optional note, and Save sale. No extra review modal when the same information is already visible.

### Failure behavior

- Disable repeated submission while saving and preserve existing server idempotency; a double tap or retry must not deduct stock twice.
- Server-check quantities at save time. If another employee consumed stock, preserve the draft and identify the conflicting product and available quantity.
- Never clear a failed sale draft or show successful stock deduction before it is confirmed.
- Retain the existing offline queue if present. Queued success must say “Saved on this device. Waiting to sync.” It must not say the owner's stock is already updated.
- Pending/failed queued sales must remain discoverable even if the local draft is cleared after durable queue storage. Provide retry/conflict resolution through existing infrastructure.
- Changing account must not expose another account's draft or queued data.

## 7. Add stock and check stock count

These must stay distinct because they perform different arithmetic.

### Add stock

Stocks → Add stock → choose products and quantities received → Save added stock.

For each product show: Available 8 bottles; Received 12; After saving 20 bottles. Support multiple lines in the existing batch workflow. From product detail preselect that product. Do not require a supplier, invoice, or purchase order for a simple receipt unless an existing business rule requires it.

### Check stock count

Show: App quantity 8; Actual quantity counted 6; Correction −2. The form records an absolute physical count, not an increment. Use “Save stock correction” for the final action. Preserve audit reasons and permissions. If stock changes while the user is counting, use existing concurrency protection or require a refreshed comparison rather than silently overwriting a newer quantity.

### Cancel sale

Owner-only action from a saved sale. Confirm the exact sale and explain “This restores the stock.” Preserve the original record and cancellation reason. Do not delete history. Ensure repeat cancellation cannot restore stock twice.

## 8. What to buy

Top-level period selector: **7 days · 30 days · 90 days**, default 30. Clearly label it “Sales in the last”.

Two views:

- **Buy soon:** replenish priorities based on current stock, thresholds, and sales pace.
- **Most sold:** ranked by units sold during the selected period, not revenue or transaction count.

A top-selling product with plenty available is not necessarily the first product to buy. Keep those questions separate. Use concise ranked rows instead of four simultaneous equal-weight dashboard panels. Move slow-stock analysis to secondary access if preserving it.

Example row, illustrative only:

“Engine Oil — 60 bottles sold in 30 days — 8 available — About 4 days left — Suggested: buy 20 bottles.”

Reuse existing deterministic analysis. No LLM/API is needed. Inspect current behavior before changing formulas. Current baseline constants use 14 coverage days and a minimum of 3 sales for pace estimates. Keep a conservative default; place an owner-adjustable coverage target in secondary settings, not a mandatory setup wizard.

Reference calculation: pace = eligible units sold / eligible observed days; estimated days left = available / pace; suggested quantity = max(0, ceil(pace × coverage target − available)). Preserve the existing newer-product age handling where valid. Exclude cancelled sales. Handle zero sales, insufficient history, invalid dates, and empty periods explicitly. Always show actual units sold even if forecasting is unavailable. Explain estimates under “How suggestions work”; do not imply guaranteed future demand. Out-of-stock periods may suppress observed sales, so do not present historical pace as unconstrained demand.

Period changes must update both ranking and estimates. Do not relabel previous-period results as new-period results while loading. Maintain a visible loading/refreshing state.

### Branch correctness

The reviewed analysis service did not pass a branch ID and the analysis cache did not include one. Verify the current implementation. If a branch is selected, sales, quantity, thresholds, estimates, and cache keys must all use that branch consistently. For All branches, label aggregate results clearly. Keep branch-specific shortages discoverable because aggregate stock can hide a branch shortage. Never display global recommendations under a branch-specific label.

Extend RPC/query/cache scoping through reviewed, non-destructive migrations if necessary. Preserve owner-only server authorization. Do not claim scope is fixed through UI filtering alone.

### Buying list

Preserve an existing buying list as optional secondary functionality. Recommendations must work without creating a list. Adding to a buying list does not increase stock and does not place an order with a supplier. Only recording actual received stock increases availability. Avoid expanding this into a new procurement workflow.

## 9. Alerts and truthful stock status

- Keep low-stock alerts when stock reaches or crosses the configured threshold; inspect existing trigger/deduplication behavior before modifying it.
- Avoid another identical alert after every sale while already below the threshold. Re-arm after replenishment; allow a separate out-of-stock escalation.
- Example: “Engine Oil is running low — Downtown · 8 bottles available · Alert level: 10.” Action: View stock.
- Link to the correct product and branch. Keep a persistent in-app inbox even when push permission is denied or unsupported.
- Clear the active shortage state after replenishment while retaining notification history.
- Ask for push permission through a contextual owner action, not a blocking launch prompt.
- Preserve existing real-time/refetch behavior and verify stock refreshes after completed sales, receipts, corrections, and cancellations. Never imply instant cross-device visibility for unsynced sales.
- Show stale/offline status and last-updated context when stock cannot be refreshed. Keep previously loaded content readable.

## 10. Responsive and accessible implementation requirements

| Surface | Mobile | Desktop |
| --- | --- | --- |
| Primary navigation | Labeled bottom tabs | Left sidebar |
| Stocks | Readable product rows | Table and optional detail panel |
| Sales | Product list + fixed review action | Product list + persistent sale panel |
| Review | Full-height flow | Integrated panel |
| Secondary filters | Sheet | Inline controls/popover |
| What to buy | Ranked rows | Comparison table |

Use current breakpoints if appropriate. Validate at 360, 390, 768, and 1440 CSS-pixel widths, plus a real or emulated installed-PWA viewport. Use roughly 44–48 CSS-pixel targets for important touch controls, readable text, clear focus states, adequate contrast, and reduced-motion support. Do not disable browser zoom.

Respect bottom safe-area insets, dynamic viewport height, and the virtual keyboard. No overlapping tabs, action bars, toasts, or input fields. Prefer one main scroll region per mobile screen. System/browser Back closes the current sheet or returns from review/details predictably; it must not unexpectedly log out or discard work. Preserve meaningful scroll/filter state across detail navigation. Long names and large quantities must wrap or truncate safely with an accessible full value.

Use semantic controls, accessible names for icon buttons, focus management for overlays, keyboard operation, and live status announcements for save/error outcomes. Loading, empty catalog, no search results, no sales history, no recommendations, offline, and permission-denied states all need understandable messages and relevant recovery actions. Never show invented sample stock in a real empty/error state.

## 11. Starting points in the reviewed code

These are investigation targets, not instructions to rewrite every file:

- `src/routes/protected.view.routes.ts`: navigation, role guards, legacy route compatibility.
- `src/models/common/permission.model.ts`: owner/employee capabilities.
- `src/pages/Dashboard/DashboardView.tsx`: migrate useful summary content into Stocks.
- `src/pages/Inventory/InventoryView.tsx` and inventory table/actions/detail components: stock landing screen and action hierarchy.
- `src/pages/Movements/MovementsView.tsx`: split stock history, stock maintenance, and recommendations into the proposed locations.
- `src/pages/Transaction/TransactionView.tsx`, `TransactionPanel`, `CartBar`, `CartModal`, `CheckoutSuccessModal`: sale flow and responsive review.
- `src/hook/data/transaction/transaction.form.hook.ts`: success/failure/draft behavior.
- `src/components/analyzer/panels/ReorderPanel.tsx`, analyzer hooks/services/enums: recommendation presentation and scope.
- `src/components/common/layout/PhoneShell.tsx`, `TabBar.tsx`, `AppBar.tsx`, `ScopeMenu.tsx`: mobile shell and branch visibility.
- `src/components/common/table/DataTable.tsx`: existing mobile list adaptation; reuse rather than undo it.
- `src/components/common/modal/AppModal.tsx`: existing responsive sheets and full-flow support.
- Supabase stock, transaction, notification, analysis, and branch migrations: inspect authoritative data behavior and policies.

Recheck actual paths and current behavior. Do not treat comments as stronger evidence than executable code. Trace data from components through hooks/services to database functions before changing semantics.

## 12. Delivery sequence

1. Audit current routes, role permissions, terminology, transaction flow, and existing test scripts. Establish current build/test status and identify unrelated failures.
2. Implement navigation and vocabulary, including useful redirects and role-specific landing pages.
3. Implement Stocks and the streamlined mobile/desktop Sales flows.
4. Reorganize Add stock, Check stock count, history, and administration under secondary entry points.
5. Implement What to buy and correct branch scoping where required.
6. Verify alerts, offline handling, data integrity, and responsive/accessibility details.
7. Review the implementation a second time against this brief and the actual business requirements. Remove redundant actions and fix misleading states discovered in that review.

Keep changes focused. Do not delete data, reset stock, remove historical records, weaken row-level security, or perform a wholesale schema/framework rewrite. Add migrations only where behavior requires them, with explicit deployment notes.

## 13. Acceptance checklist

### Navigation and clarity

- [ ] Owner lands on Stocks; employee lands on a usable sale selector.
- [ ] Owner has Stocks, Sales, What to buy; employee has Sales, My sales, Account.
- [ ] No duplicate primary Inventory/Stock modules or unexplained Masterfile/Reorder jargon.
- [ ] Core actions have visible labels and occasional actions do not crowd product rows.
- [ ] Old URLs and notification links still reach meaningful authorized destinations.

### Core task scenarios

- [ ] Employee records one product and a multi-product sale through selection → review → save on mobile, with no extra confirmation or dismiss-required success modal.
- [ ] Desktop sale can be reviewed and saved in the persistent panel.
- [ ] Changing quantity to 20 permits direct input; Back retains the draft.
- [ ] A stock receipt of 12 against 8 yields 20; a physical count of 6 against 8 yields an audited −2 correction.
- [ ] Duplicate submit/retry cannot deduct twice; repeated cancellation cannot restore twice.
- [ ] Simultaneous sales of limited stock produce a truthful recoverable conflict rather than silently overselling.
- [ ] Owner can find a low-stock product, inspect its history, and add received stock without navigating through unrelated modules.

### Recommendations and scope

- [ ] Most sold is ranked by eligible units sold for each selected period.
- [ ] Buy soon considers remaining stock rather than merely copying the sales ranking.
- [ ] Insufficient history still shows factual sales totals, with no fabricated forecast.
- [ ] Cancelled sales are excluded; zero-sales and new-product cases are handled.
- [ ] Branch switching cannot reuse another branch's cached quantities or recommendations.
- [ ] An illustrative test fixture with 60 units sold over 30 eligible days, 8 available, and 14-day coverage yields 2/day, about 4 days left, and 20 suggested units.
- [ ] Buying-list edits never increase stock or imply an external order was submitted.

### Resilience and access

- [ ] Employee cannot access owner data or mutations by entering URLs or making direct requests.
- [ ] Queued offline sales are labeled pending; failed saves preserve recoverable information.
- [ ] Push denial does not block use or remove in-app shortage visibility.
- [ ] Alerts correctly identify branch/product and do not spam repeated threshold notifications.
- [ ] Mobile keyboard, safe areas, long names, loading/error states, keyboard navigation, and browser Back behave correctly.

Run the repository's relevant build, type checking, linting, and existing tests. Add focused behavioral tests for changed sale/stock semantics, permissions, branch scope, and responsive navigation as supported by the stack. Do not write shallow tests that merely mirror markup. Inspect rendered screens at the specified widths; capture review screenshots if tooling permits. State plainly which tests could not run and why.

Conduct a small usability trial when actual staff are available: ask a staff member to record a sale and find it again; ask the owner to locate remaining stock, add a delivery, and choose what to buy. Do not coach them through labels. Record hesitation, wrong turns, task completion, and errors. The acceptance checklist verifies implementation; it does not substitute for observing real users.

## 14. Required completion report

Return a concise report containing:

1. Implemented screen/flow changes and the final navigation.
2. Files changed and the working branch/commit, if created.
3. Screenshots or a runnable preview when available, covering owner Stocks, employee Sales, mobile review, What to buy, and desktop Sales.
4. Tests run, results, and anything unverified.
5. Migrations/configuration required before deployment, without claiming they were applied to production.
6. Remaining issues or explicit tradeoffs. Do not claim every acceptance item passes without evidence.

## Design rationale references

These support the general principles; they do not prove that these exact labels work for Moti's staff.

- Nielsen Norman Group, familiar real-world language: https://www.nngroup.com/articles/match-system-real-world/
- Nielsen Norman Group, recognition rather than recall: https://www.nngroup.com/articles/recognition-and-recall/
- Nielsen Norman Group, clear task paths rather than a universal click limit: https://www.nngroup.com/articles/3-click-rule/
- GOV.UK Design System, descriptive action labels and primary-action hierarchy: https://design-system.service.gov.uk/components/button/
- Android Developers, consistent compact navigation: https://developer.android.com/develop/ui/compose/components/navigation-bar
- W3C, target size guidance: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
