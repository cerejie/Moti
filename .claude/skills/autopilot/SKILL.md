---
name: autopilot
description: "Hands-off improvement loop that stands in for the user: deep-critique audits the whole app → decision-making rules on every finding → the verdicts become a round plan in the roadmap → implementation batches fix it (consulting the critique report and decision-making whenever a choice comes up), each gated by yarn build + yarn lint + a visual re-sweep, committed in the TARTAR format and pushed → deep-critique audits again. Every phase runs in a fresh worker sub-agent (a clean context, the equivalent of /clear and a new conversation) and resumes from disk, so a run can also be continued across sessions with /clear + /autopilot. Loops until a critique round finds nothing left to fix — only 'leave' or user decisions. Use only when the user types /autopilot or the prompt starts with 'AUTOPILOT'. Never auto-invoke on an ordinary prompt."
---

# /autopilot — critique → decide → plan → implement → critique again

```
        ┌──────────────────────────────────────────────────────────────┐
        ▼                                                              │
 CRITIQUE ROUND (1 worker)                     IMPLEMENTATION (1 worker per batch)
 visual-test sweep                             next unticked batch of the round
 deep-critique, deep, whole app      ───►      implement, consulting the report and
 decision-making on every finding              decision-making for every choice
 plan = Round <n> batches in roadmap           build + lint + re-sweep + each finding's
 commit + push                                 Verification step → tick → commit + push
                                                        │
                                   all batches ticked ──┘ → next CRITIQUE ROUND
```

## Fresh context every phase — the token rule

Every phase — each critique round and each implementation batch — starts from a **clean
context**, the equivalent of `/clear` and a new conversation:

- **Inside a run:** each phase is a new worker sub-agent. It knows nothing from earlier phases
  except what is on disk: `NEXT_PROMPT.md`, the roadmap, the round files and `LOG.md`. Nothing is
  passed from memory of the conversation; if a later phase needs it, it is written to disk first.
- **The conductor stays thin:** it never reads source, reports or screenshots — only each
  worker's ≤ 8-line report — so dozens of phases fit in one session.
- **Across sessions:** the run can end at any phase boundary and resume later with zero
  re-exploration — after an automatic context summary, or if the user ever types `/clear` then
  `/autopilot` — the loop continues exactly at `NEXT_PROMPT.md`. Every phase therefore leaves the repo committed, pushed and resumable.
- Workers read regions, not whole files, and load only the skills and reference files their
  step needs (`token-efficiency`).

## Until it is right — when the loop ends

The loop runs until a critique round, on a fresh full sweep, finds **no fix-now finding at any
severity** — everything left is `leave` (the design is right) or `user decides`. That round
writes `STOP: converged`. There is no round limit.

Invoking this skill is the user's **standing authorization** to audit, decide, plan, implement,
commit and push on the current branch without asking, step after step, and to spawn one worker
sub-agent per step. For this run only it overrides: CLAUDE.md's "plan before the first write,
then wait for approval" and "suggest only, never commit"; `codebase-engineering` § A's wait and
§ H's "never commit, push or branch unless asked"; `deep-critique` § 0's "report in the reply
only" (the critique worker writes its report to a file — the critique itself stays read-only);
and the global "ask when unclear" (`decision-making` answers instead). Every other rule in
CLAUDE.md and the loaded skills still binds — folder law, no `useState`, styles in
`*.styles.ts`, tokens in `theme.css`, Supabase only in `services/data/`, no `any`, never run a
migration.

## The skills it drives

| Skill | Role in the loop | When |
|---|---|---|
| `visual-test` | Evidence: every role × screen × size × theme, measured and screenshotted | Every critique round; re-sweep after every batch |
| `deep-critique` | The auditor: finds what is wrong, with evidence, severity and a Verification step | Every critique round; **reference** during implementation (the finding's evidence, direction and verification) |
| `decision-making` | The user's stand-in: fix now / defer / leave / user decides, per finding | Every critique round; **again** for any design choice, ambiguity or trade-off met while implementing |
| `codebase-engineering` + router skills | How code is changed in this repo | Every implementation batch |

## State

Roadmap: `.claude/references/roadmap.md`, section **"V1.4: Autopilot loop"** (create it under
the Progress list if missing). Working files in `.claude/state/autopilot/` (create if missing):

| File | Purpose |
|---|---|
| `NEXT_PROMPT.md` | What the next worker does. First line is the mode: `MODE: critique` or `MODE: implement`. Rewritten by every worker. |
| `round-<n>-critique.md` | The deep-critique report of round n, verbatim. Never edited after the round commits. |
| `round-<n>-decisions.md` | One line per finding: `ID → fix now (batch k) / defer / leave / user decides — reason`. Implementation workers append in-flight decisions here. |
| `USER-DECISIONS.md` | Everything parked for the user, as plain numbered questions with options. Carried across rounds until the user answers. |
| `LOG.md` | One entry per worker. Append only. |
| `STOP` | Exists = autopilot refuses to run. Holds the reason. Only the user deletes it. |

## Conductor — the session that received /autopilot

The conductor never audits, implements or reads source. Its context holds only worker reports.

1. **Check.** If `STOP` exists, report its reason and end. Run `git rev-parse --abbrev-ref HEAD`;
   on `main`/`master`, write `STOP` and end. Make sure the preview answers on
   `http://127.0.0.1:4180` (`visual-test` § 1); start it in the background if not. If
   `NEXT_PROMPT.md` is missing, the first worker runs `MODE: critique`, round 1.
2. **Dispatch.** Spawn one worker with the `Agent` tool: `subagent_type: "general-purpose"`,
   `run_in_background: false`, description `Autopilot <mode> <round>.<batch>`, and this prompt
   (fill the brackets; the account file path is local, never commit it):

   > AUTOPILOT WORKER. Read `.claude/skills/autopilot/SKILL.md` and run exactly one step as its
   > **Worker** section says, starting from `.claude/state/autopilot/NEXT_PROMPT.md`. You are
   > the user's stand-in: audit, decide, plan, implement, commit and push without asking. Load
   > skills with the Skill tool; if it is unavailable, read `.claude/skills/<name>/SKILL.md`.
   > Scratchpad (playwright-core installed): `<scratchpad>`. Preview: `http://127.0.0.1:4180`.
   > Test accounts: read `<memory dir>/test-accounts.md`; pass them only as env vars.
   > Your final message is your report to the conductor, in the Worker report shape.

3. **Confirm.** Check the result, not the claim: `git status --short`, `git log --oneline -1`,
   `git status -sb` (no `ahead`). A reported commit that is not there, a dirty tree without a
   `STOP`, or a push that did not land → write `STOP` with what you saw and end.
4. **Next.** Print one line: `<mode> <round>.<batch> → Development v<X.YY>, pushed — <summary>`.
   If `STOP` now exists, end. Otherwise go back to step 1.
5. **Never pause for the user.** Keep looping until `STOP` — no "shall I continue?", no
   session-boundary stop. When this session's context grows long the harness summarizes it
   automatically; after that, re-read this skill and continue from `NEXT_PROMPT.md` (disk is the
   only state). `/clear` + `/autopilot` remains available to the user but is never required.

End the run with: a table of steps (mode, round.batch, version, what changed); the `STOP`
reason; the open `USER-DECISIONS.md` questions; the last sweep gallery (publish that worker's
`index.html` with the Artifact tool, images through `files`); and "physical-device visuals
unconfirmed — check on a phone".

## Worker — common start (both modes)

1. **Orient.** Read `NEXT_PROMPT.md`, the last two `LOG.md` entries, `USER-DECISIONS.md` and the
   roadmap's "V1.4: Autopilot loop" section. `git status --short`,
   `git rev-parse --abbrev-ref HEAD`. If `STOP` exists, report its reason and end. On
   `main`/`master`, hard-stop.
2. **Settle leftovers.** A dirty tree before any work is the previous run's or the user's
   uncommitted work: verify (`yarn build`, `yarn lint`), commit it as its own version (see
   Commit), push, then continue.
3. Run the mode named on the first line of `NEXT_PROMPT.md`.

## Worker — MODE: critique (round n)

1. **Evidence.** Load `visual-test`. `yarn build`, then the full sweep — all roles, all sizes,
   both themes — into `<scratchpad>/shots/round-<n>`. Open every phone shot (light and dark) and
   the tablet and desktop shot of each screen.
2. **Audit.** Load `deep-critique` and run it at depth `deep` on the whole app,
   `focus=mobile,ux` plus every other lens at standard depth. It stays read-only. Use the sweep as
   its visual evidence; it reads the code, migrations and config for everything else. Round
   n > 1: read the previous round's decisions first — do not re-raise a finding decided `leave`
   unless its screen or code changed since; confirm fixed findings are actually fixed (a fix that
   did not hold is a new High finding). Save the full report as `round-<n>-critique.md`.
3. **Decide.** Load `decision-making` and rule on every finding as the user — from memory, the
   roadmap's Decisions log, `design-plan.md`, CLAUDE.md and the report's evidence. Tier by its
   Step 0 (most are Simple). Verdicts:
   - **fix now** — worth it, and within autopilot's authority;
   - **defer** — worth it, not this round (low impact, or depends on another fix);
   - **leave** — the current design is right; one-line reason;
   - **user decides** — outside autopilot's authority (list below). Write it to
     `USER-DECISIONS.md` as a plain question with options and a recommendation; never stop the
     loop for it while fix-now work remains.

   Never print the role transcripts. Never call `AskUserQuestion`. Save `round-<n>-decisions.md`.
4. **Plan into the roadmap.** Group the fix-now findings into **batches** of ≤ 6 findings that
   share a screen, component or pattern, ordered Critical → High → Medium, quick wins first
   within a level. Append to the roadmap's V1.4 section:

   ```
   ### Round <n> (<date>) — <x> findings: <f> fix now, <d> defer, <l> leave, <u> user decides
   Report: .claude/state/autopilot/round-<n>-critique.md
   - [ ] Batch 1: <theme> — <IDs> — <files likely touched>
   - [ ] Batch 2: …
   ```
5. **Converged?** If there are no fix-now findings at any severity, write `STOP`:
   `converged after round <n>` + the counts + "open user decisions: <k>". Otherwise write
   `NEXT_PROMPT.md` as `MODE: implement`, round n, batch 1.
6. **Commit and push** (see Commit): `Docs: Add Autopilot Round <n> Critique And Plan`.

## Worker — MODE: implement (round n, batch k)

1. **Load the batch.** Read the batch line in the roadmap, then each of its findings in
   `round-<n>-critique.md` (evidence, direction, verification) and their lines in
   `round-<n>-decisions.md`. Load `codebase-engineering`, plus the router's skills the batch
   needs (`ui-design-conventions` + `shadcn` for UI, `componentization`, `pwa-conventions`,
   `supabase-backend` for service code). Write the file plan into the `LOG.md` entry — it is
   not waited on.
2. **Implement**, copying the nearest sibling, smallest correct change, never hand-editing
   `components/ui/`. **Consult while working:**
   - unsure what the finding means or how to prove it → re-read it in the critique report, and
     load `deep-critique` for the lens it came from;
   - any design choice, ambiguity or trade-off → run `decision-making` (Simple tier unless it
     is not) and append `- <question> → <pick> (<reason>)` to `round-<n>-decisions.md`;
   - the fix turns out to need something outside autopilot's authority → stop that finding,
     add it to `USER-DECISIONS.md`, mark it `user decides` in the decisions file, carry on with
     the rest of the batch.
3. **Verify.** `yarn build` and `yarn lint` — both clean, fix until they are. Re-run the sweep for
   the screens the batch touched (`SCREENS=…`, all sizes and themes) and open the new shots.
   Run each finding's **Verification** step from the report. A fix that does not hold is reverted
   and its finding deferred with the reason. If build or lint still fail after a genuine
   root-cause attempt, do not commit — hard-stop with the failing output.
4. **Tick and hand off.** Tick the batch in the roadmap (`- [x] Batch k … — Development
   v<X.YY>`). Write `NEXT_PROMPT.md`: the next unticked batch (`MODE: implement`), or, when the
   round's batches are all ticked, `MODE: critique`, round n + 1.
5. **Commit and push** (see Commit), one `Type: Title` line per fix.

## Never decide — always `user decides`

- a Supabase migration, schema, RLS, RPC, grant or storage change (Claude never runs
  migrations; the user pastes them into the SQL editor) — a worker may draft the SQL inside the
  question, never as a migration file;
- a new business rule — money math, stock rules, permissions, what a role may see — that memory
  and the roadmap's Decisions log do not already settle;
- deleting a feature, screen or user data; a new dependency; removing a column;
- force-pushing, rewriting history, switching or creating a branch, deploying.

## Commit (both modes)

1. Update first so they ride in the commit: the roadmap V1.4 section, the round files,
   `USER-DECISIONS.md`, the `LOG.md` entry and `NEXT_PROMPT.md`.
2. Version = `git log -1 --format=%s` bumped by 0.01 (`Development v1.21` → `v1.22`).
3. Stage only the paths this worker touched plus the roadmap and `.claude/state/autopilot/` —
   never `git add -A`.
4. Title `Development v<X.YY>`, blank line, one `Type: Title Case Summary` line per change
   (`Feature` · `Fix` · `Update` · `Style` · `Refactor` · `Database` · `Docs`), blank line, the
   harness `Co-Authored-By` trailer. Pass the message through a file (`git commit -F`).
5. `git push origin HEAD`. A rejected push is a hard-stop — never force, never pull-rebase.

## Hard-stop

Write `STOP` with one paragraph: what blocked, what was done, what the user must decide. Commit
and push only work that is already build- and lint-clean; leave the rest uncommitted.

## LOG.md entry

```
## <mode> <round>.<batch> — Development v<X.YY> (<date>)
Sweep: <captures> captures, <issues> measured issues, <errors> console errors
Plan / findings: <IDs or counts>
Decisions: <count> (see round-<n>-decisions.md)
Fixed: <one line per fix, with files>      (implement only)
Verified: build + lint clean; re-sweep <screens> ok; verification steps <ok/failed>; emulated viewport only
Push: ok | rejected
```

## Worker report — the final message, at most 8 lines

```
Step: <critique round n | implement n.k>
Commit: Development v<X.YY> (<short hash>) | none
Push: ok | rejected | skipped
STOP: none | <reason>
Summary: <one or two lines>
Findings: <total> — <fix now> fix now, <defer> defer, <leave> leave, <user> user decides
Gallery: <OUT>/index.html
```

## NEXT_PROMPT.md shape

```
MODE: <critique|implement>
AUTOPILOT — Moti round <n>[, batch <k>]. Branch <branch>. Last commit Development v<X.YY>
(<what it did>), pushed. <critique: "Full sweep, then deep-critique deep on the whole app;
previous decisions in round-<n-1>-decisions.md."> <implement: "Batch <k>: <theme> — <IDs>;
report round-<n>-critique.md.">
```

One extra line only if the next worker must know something (a fix that a later batch depends on).
