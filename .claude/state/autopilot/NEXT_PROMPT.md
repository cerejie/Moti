MODE: critique
AUTOPILOT — Moti round 2. Branch moti-development. Last commit Development v1.27
(round 1 batch 4: sheet back gesture and cart quantity), pushed. Check round: full sweep, then verify the Round 1
roadmap batches against round-1-critique.md and round-1-decisions.md; in-scope gaps and
regressions only.
The run is on `moti-development`; stay on it, never switch.
Round 2 is a check round ("It must end"): nothing in scope → write `STOP: converged`. MOB-01's back handling lives in `hook/common/sheet.hook.ts` (mounted in `App.tsx`), not `modal.hook.ts`.
