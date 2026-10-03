---
name: autopilot
description: "Hands-off tester-and-fixer loop that stands in for the user. /autopilot runs critique cycles back to back: each cycle goes to a fresh worker sub-agent (a clean context, the equivalent of /clear) that tests every role and screen visually (visual-test), critiques navigation, placement, layout, design and UX as a tester, answers each critique question with the decision-making skill, fixes the chosen batch, gates on yarn build + yarn lint + a re-sweep, commits in the TARTAR format and pushes the current branch; the conductor then starts the next cycle. Stops when the critique converges or a worker hard-stops. Use only when the user types /autopilot or the prompt starts with 'AUTOPILOT'. Never auto-invoke on an ordinary prompt."
---

# /autopilot — test, critique, decide, fix, repeat

Invoking this skill is the user's **standing authorization** to decide, commit and push on the
current branch without asking, cycle after cycle, and to spawn one worker sub-agent per cycle.
It overrides, for this run only: CLAUDE.md's "plan before the first write, then wait for
approval" and "suggest only, never commit", `codebase-engineering` § A's wait and § H's "never
commit, push or branch unless asked", and the global "ask when requirements are unclear" (the
`decision-making` skill answers instead). Every other rule in CLAUDE.md and the loaded skills
still binds — folder law, no `useState`, styles in `*.styles.ts`, tokens in `theme.css`,
Supabase only in `services/data/`, no `any`.

State lives in `.claude/state/autopilot/`:

| File | Purpose |
|---|---|
| `NEXT_PROMPT.md` | The prompt the next worker starts from. Rewritten by every worker. |
| `CRITIQUE.md` | The open critique: every question still deferred, with its evidence. Rewritten by every worker. |
| `LOG.md` | One entry per cycle: questions, verdicts, fixes, commit, push result. Append only. |
| `STOP` | Exists = autopilot refuses to run. Holds the reason. Only the user deletes it. |

Two roles. The session the user typed `/autopilot` in is the **conductor**. Each cycle runs in a
**worker** — a sub-agent the conductor spawns, starting from a clean context.

## Conductor — the session that received /autopilot

The conductor never implements, critiques or reads source itself. Its context holds only the
worker reports, so it stays small however many cycles run.

1. **Check.** If `STOP` exists, report its reason and end. Run `git rev-parse --abbrev-ref HEAD`;
   on `main`/`master`, write `STOP` and end. Make sure the preview answers on
   `http://127.0.0.1:4180` (`visual-test` § 1); start it in the background if not.
2. **Dispatch.** Spawn one worker with the `Agent` tool: `subagent_type: "general-purpose"`,
   `run_in_background: false`, description `Autopilot cycle <n>`, and this prompt (fill the
   brackets; the account file path is local, never commit it):

   > AUTOPILOT WORKER. Read `.claude/skills/autopilot/SKILL.md` and run its **Worker** section
   > exactly once, starting from `.claude/state/autopilot/NEXT_PROMPT.md`. You are the user's
   > stand-in: test, critique, decide, fix, commit and push without asking. Load skills with the
   > Skill tool; if it is unavailable, read `.claude/skills/<name>/SKILL.md` directly.
   > Scratchpad (playwright-core installed): `<scratchpad>`. Preview: `http://127.0.0.1:4180`.
   > Test accounts: read `<memory dir>/test-accounts.md`; pass them only as env vars.
   > Your final message is your report to the conductor, in the Worker report shape.

3. **Confirm.** When the worker returns, check the result, not the claim:
   `git status --short`, `git log --oneline -1`, `git status -sb` (no `ahead`). If the worker
   reported a commit that is not there, the tree is dirty without a `STOP`, or the push did not
   land, write `STOP` with what you saw and end.
4. **Next.** Print one line: `Cycle <n> → Development v<X.YY>, pushed — <summary>`. If `STOP`
   now exists, end. Otherwise go back to step 1.
5. **Cap.** At most 12 workers per conductor run; at the cap, end with the open critique count.

End the run with: a table of cycles (cycle, version, what changed), the `STOP` reason, the link
to the last sweep gallery (publish the final worker's `index.html` with the Artifact tool, its
images through `files`), and "physical-device visuals unconfirmed — check on a phone".

## Worker — one cycle, in order, no skipping

1. **Orient.** Read `NEXT_PROMPT.md`, `CRITIQUE.md`, the last two `LOG.md` entries and the
   roadmap's "V1.4: Autopilot critique loop" section. Run `git status --short` and
   `git rev-parse --abbrev-ref HEAD`. If `STOP` exists, report its reason and end.
2. **Guard.** Hard-stop (step 11) on `main`/`master`.
3. **Settle leftovers.** If the tree is dirty before any work, it is the previous run's or the
   user's uncommitted work: verify (`yarn build`, `yarn lint`), commit it as its own version
   (step 9), push, then continue.
4. **Test.** Load `visual-test`. `yarn build` (the preview serves `dist/`), then run the full
   sweep — all roles, all sizes, both themes — into `<scratchpad>/shots/cycle-<n>`. Open the
   screenshots with Read: every phone capture in light and dark, and the tablet and desktop
   capture of each screen. Read `report.json` for the measured issues.
5. **Critique as a tester.** Walk the app the way each role uses it — sign in, land, navigate,
   find an item, sell, check out, review history, manage stock and users, change settings — and
   write every problem as a question a critical tester would put to the designer, with evidence:

   ```
   Q<n> [navigation|placement|layout|visual|ux|a11y|consistency] <role> · <screen> · <size> · <theme>
   Should <specific change>? — <what is wrong and why it hurts the user> (shot: <file>)
   ```

   Yardsticks: `ui-design-conventions`, `.claude/references/design-plan.md` (native mobile
   feel, glance → understand → act, compact rows, one primary action, clear hierarchy and
   spacing, the four data states), touch targets ≥ 44 px, no sideways scroll, light and dark
   parity, desktop staying productive. Merge the questions still open in `CRITIQUE.md`; drop
   any the screenshots show are already fixed. Never re-ask a question `LOG.md` already
   answered "leave" unless the screen changed since.
6. **Decide instead of asking.** Load `decision-making` and run it on every question, as the
   user — from memory, the roadmap's Decisions log, `design-plan.md` and CLAUDE.md. Tier by its
   Step 0; most are Simple. Verdict per question: **fix now**, **defer** (worth doing, not this
   cycle) or **leave** (the current design is right — say why). Never print the role transcript.
   Never call `AskUserQuestion`. Then pick **one coherent batch** of fix-now items — at most 6,
   sharing a screen or a pattern, highest user impact first. **Never decide these — hard-stop
   instead (step 11):**
   - a Supabase migration, schema, RLS, RPC or storage change (Claude never runs migrations;
     the user pastes them into the SQL editor);
   - a new business rule — money math, stock rules, permissions, what a role may see — that
     memory and the roadmap's Decisions log do not already settle;
   - deleting a feature or a screen, a new dependency, removing a column, force-pushing,
     rewriting history, switching or creating a branch, deploying.
7. **Implement.** Follow `codebase-engineering` (copy the nearest sibling, smallest correct
   change) plus the router's UI skills (`ui-design-conventions`, `shadcn`, `componentization`
   as needed); the plan is written into `LOG.md`, not waited on. Never hand-edit
   `components/ui/`.
8. **Verify.** `yarn build` and `yarn lint` — both clean, fix until they are. Then re-run the
   sweep for the screens the batch touched (`SCREENS=…`, all sizes and themes) and open the
   new shots: each fixed question must look fixed and nothing else may regress. A fix that does
   not hold is reverted and its question deferred. If build or lint still fail after a genuine
   root-cause attempt, do not commit — hard-stop with the failing output.
9. **Commit.** First update the files that ride in the commit: the roadmap's V1.4 section (one
   line for the cycle: version, what changed), `CRITIQUE.md` (open questions only), the
   `LOG.md` entry (shape below) and `NEXT_PROMPT.md`. Then:
   - version = `git log -1 --format=%s` bumped by 0.01 (`Development v1.20` → `v1.21`);
   - stage only the paths this cycle touched plus the roadmap and `.claude/state/autopilot/` —
     never `git add -A`;
   - title `Development v<X.YY>`, blank line, one `Type: Title Case Summary` line per change
     (`Feature` · `Fix` · `Update` · `Style` · `Refactor` · `Database` · `Docs`), blank line,
     the harness `Co-Authored-By` trailer. Pass the message through a file (`git commit -F`).
10. **Push and hand off.** `git push origin HEAD`. A rejected push is a hard-stop — never force,
    never pull-rebase on your own. **Converged:** if this cycle's critique produced no fix-now
    item (everything is leave, or deferred only because it needs a hard-stop decision), write
    `STOP` with `critique converged` plus the deferred list for the user, and commit it.
11. **Hard-stop.** Write `STOP` with one paragraph: what blocked, what was done, what the user
    must decide (as plain numbered questions with options). Commit and push only work that is
    already build- and lint-clean; leave the rest uncommitted.

One cycle per worker. Never start a second — the conductor spawns a fresh worker for it.

### LOG.md entry

```
## Cycle <n> — Development v<X.YY> (<date>)
Sweep: <captures> captures, <issues> with measured issues, <errors> console errors
- Q<n> <question> → fix now | defer | leave (<one-line reason>)
Fixed: <one line per fix, with the files>
Verified: build + lint clean; re-sweep <screens> ok, emulated viewport only
Push: ok | rejected
```

### Worker report — the final message, at most 8 lines

```
Cycle: <n>
Commit: Development v<X.YY> (<short hash>) | none
Push: ok | rejected | skipped
STOP: none | <reason>
Summary: <one or two lines of what changed>
Critique: <asked> asked, <fixed> fixed, <deferred> deferred, <left> left
Gallery: <OUT>/index.html
```

## NEXT_PROMPT.md shape

```
AUTOPILOT — Moti critique cycle <n+1>. Branch <branch>. Last commit Development v<X.YY>
(cycle <n>: <summary>), pushed. Start from the open questions in CRITIQUE.md (<count>), then a
fresh full sweep. Batch focus suggestion: <the screen or pattern with the most open questions>.
```

Carry forward any state the next worker must know (a deferred item that depends on this cycle's
change) as one extra line. Nothing else.
