# Round 1 decisions (2026-10-03)

25 findings: 15 fix now, 3 defer, 3 leave, 4 user decides. Report: `round-1-critique.md`.

- SEC-01 → user decides — a database and business-rule change (how a reset is proven); question 1 in USER-DECISIONS.md.
- QA-01 → fix now (batch 1) — a sale that silently stalls is the worst failure the app has; the fix is a few lines in `sync.store.ts`.
- QA-03 → fix now (batch 1) — one root error element; developer text must never reach a shop user.
- QA-02 → fix now (batch 1) — a list that looks filtered but is not misleads the seller; a notice + dim is enough.
- A11Y-01 → fix now (batch 2) — text-only tone tokens; the brand fill stays, so the Decisions log is not touched.
- MOB-02 → fix now (batch 2) — one selector in the existing coarse rule the user already approved (Phase 5 Batch 1, option A).
- UI-04 → fix now (batch 2) — same menu, same batch.
- UX-03 → fix now (batch 2) — wrong copy for the owner; one line.
- UI-02 → fix now (batch 2) — already noted in the roadmap as "for later"; `formatCount` exists.
- MOB-04 → fix now (batch 2) — `inputMode="numeric"` on the number field type; stock is whole numbers.
- UX-01 → fix now (batch 3) — the bell must show what its badge counted.
- UX-02 → fix now (batch 3) — Sign out and theme belong on Account; reuses existing hooks, the avatar menu stays for desktop.
- MOB-03 → fix now (batch 3) — hide the rows picker on phones and the arrows on a single page; "Load more" not needed at one-shop scale.
- UI-01 → fix now (batch 3) — two columns until `xl`, the breakpoint Batch 6 already established for wide content.
- MOB-01 → fix now (batch 4) — back is the main Android gesture; own batch because it touches every sheet. Revert and defer if the re-sweep shows any history side effect.
- UX-04 → fix now (batch 4) — typed quantity in the cart sheet only; the store already clamps.
- A11Y-02 → user decides — changing the button fill changes the brand colour the user chose on 2026-10-02; question 2.
- PWA-01 → user decides — needs a new dependency (or breaks "never cache server rows in a store"); question 3.
- SEC-02 → user decides — migration (attempt counter, sign-up cap, neutral reset answer); question 4.
- PROD-01 → defer — worth it, but it is a new feature and matters once the catalogue is real; revisit next round.
- QA-04 → defer — low impact (8 h at most, server already refuses everything); depends on a session re-check design.
- OPS-01 → defer — a CI workflow is cheap but the repo has no remote checks today; propose with the deploy phase.
- TEST-01 → leave — the roadmap already parks pgTAP under LATER by the user's own decision.
- PERF-01 → leave — measured and accepted in Phase 5 Batch 4; self-hosting fonts would be a new dependency for little gain.
- UI-05 → leave — 13.6 px secondary text is deliberate density; titles and inputs are 16 px.

## In-flight decisions — batch 1 (implement 1.1)

- QA-01: how to recognise an expired session in a replay → HTTP 401 on the write itself, raised as `SessionExpiredError` in `write.utils.ts` (the status is the fact; matching the text "JWT expired" or one PostgREST code would miss the others).
- QA-01: clear old auth failures in `adoptOwner`? → no (after the fix a 401 never becomes a `failure`, so there is nothing to clear; an entry parked before this version still has Retry in the sync sheet).
- QA-01: also queue a live (not replayed) write that gets 401? → no (outside the finding; it changes what checkout reports to the seller. Left as is).
- QA-02: when to show the notice → only when the rows are placeholder rows and the query is paused (online, the old rows show for a moment while the new ones load; dimming then would flicker).
- QA-02: where the rule lives → one helper `isShowingPausedRows` in `query.utils.ts`, passed by the four tables as `isStale`; the list hooks stay unchanged.
- QA-03: one root error element or one per screen → one on the root route (the finding's direction; it replaces the shell, and Reload brings it back). It also removes the launch splash, since it can be the first thing to render.
- QA-03: what text to show → never the error's own message (it is the developer text); a fixed sentence, or the offline sentence when the device is offline.

## In-flight decisions — batch 2 (implement 1.2)

- A11Y-01: how to darken coloured text without touching components → Tailwind's `--text-color-*` theme keys in `theme.css`, fed by new `--primary-text`, `--success-text`, `--warning-text`, `--danger-text`, `--info-text` tokens (`text-primary` and the rest pick them up; `bg-*` and `border-*` keep the fills; dark mode points them back at the fills, so nothing changes there).
- A11Y-01: which shades → `#b03a0a`, `#147438`, `#92400e`, `#b91c1c`, `#1d4ed8` (each is at least 5:1 on white, on its own tint and on the app backdrop, with room for the 90 % alert text); muted text `#71717a` → `#66666e` (5.04 on the backdrop).
- A11Y-01: the sign-in hero is carbon in light mode too, where darker orange would lose contrast → its accent text gets its own `text-on-hero-accent` (the brand fill).
- A11Y-01: the unselected page tab (stock `text-foreground/60`, 4.49:1) → `text-muted-foreground` in `tabs.styles.ts` (the generated tab is not edited; dark mode already uses that colour).
- UI-04: what is clipped → not the label: the generated separator's `-mx-1` makes the menu 4 px wider than its box. Fixed with `mx-0` on the account menu's separator (looks the same, the bleed was already cut off).
- UX-03: what the owner's line says → "The name and email you sign in with." (the app has no screen where an owner edits these, so the line promises nothing); employees keep the old line.
- UI-02: wording → "1 item · 1 pc", the same as the checkout receipt.
- MOB-04: `enterKeyHint` too? → no (the finding's direction is `inputMode` only; every `number` field is a whole positive count, so the digit pad fits all three).

## In-flight decisions — batch 3 (implement 1.3)

- UX-01: where the compact empty state lives → a `compact` prop on `StateBox` (one line, no box; the boxed form stays the default), used by the bell's stock alerts and the dashboard's "Needs attention" card.
- UX-01: wording → "All stocked up" alone; the sentence under it repeated the title.
- UX-02: one card or two → one card, "Appearance and sign out", last on Account (the finding's direction; Sign out is the last thing on the screen, where people look for it).
- UX-02: theme control → the existing `SegmentedControl` (`lg`, Light / Dark) over the theme store's `toggleTheme`; the store is not changed, and tapping the chosen side does nothing.
- UX-02: remove "My account" from the avatar menu? → no (the finding keeps the menu for desktop; removing an entry is outside it).
- MOB-03: single page on a phone → keep the count line, hide "Page 1 of 1" and both arrows (the count still says the list is complete); from `md` up nothing changes.
- MOB-03: rows picker on a phone → hidden with CSS only, so the page size chosen on a wider screen still applies.
- UI-01: breakpoint → two columns until `xl`, as decided in the round; at 1440 px the Low stock hint wraps to two lines without truncating, as it did before.
