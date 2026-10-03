MODE: implement
AUTOPILOT — Moti round 1, batch 3. Branch moti-development. Last commit Development v1.25
(round 1 batch 2: contrast and touch quick wins), pushed. Batch 3: phone shell and lists —
UX-01, UX-02, MOB-03, UI-01; report round-1-critique.md.
The run is on `moti-development`; stay on it, never switch.
Menu rows are now 44 px on touch and `text-primary` / `text-success` / `text-warning` / `text-danger` / `text-info` resolve to darker text-only tokens in light mode (`theme.css`); use those utilities, not new colours.
