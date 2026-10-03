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
