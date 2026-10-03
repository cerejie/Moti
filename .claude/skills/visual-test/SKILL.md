---
name: visual-test
description: Sign in as every Moti role and open every screen, tab and sheet at phone, tablet and desktop width in light and dark — measured (sideways scroll, clipping, controls off the edge, sub-44 px touch targets, console errors, route guards) and screenshotted into a gallery. Writes are faked, so real data never changes. Use after any UI, layout, navigation or role change, when asked to test, screenshot or check screens, and inside every autopilot cycle.
---

# Visual test — every role, every screen, both themes

A build proves the code compiles; this proves the screens are right. It replaces "visuals
unconfirmed" with measured results and screenshots the user can see. It is the one exception to
`codebase-engineering` § G's "never start `yarn preview`".

## 1. Setup (once per session)

1. **Browser driver in the scratchpad, never the repo.** In the session scratchpad:
   `npm init -y && npm i playwright-core`. No Chrome on this machine: the script launches Edge
   (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`, override with `EDGE`).
2. **Serve the production build:** `yarn build`, then in the background
   `yarn preview --host 127.0.0.1 --port 4180 --strictPort`. Check with
   `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4180/` before starting a second one.
   - **Never port 4173** — TARTAR's service worker lives on `localhost:4173`; the user keeps
     their TARTAR preview running there. Never stop it.
   - Bare `--host` exposes the app on the LAN; always pass `127.0.0.1`.
   - After a rebuild, the running preview serves the new `dist/`. If a fresh asset 404s, start a
     new preview on 4181 and pass `BASE`. Stopping preview on Windows can leave vite running —
     ask the user to stop it.
3. **Accounts from Claude's memory (`test-accounts`), never from a committed file.** Pass them as
   env vars: `MOTI_OWNER`, `MOTI_EMPLOYEE`, `MOTI_PW`. Never write a password into the repo, a
   commit, a log or a report.

## 2. Run the sweep

```bash
OUT="<scratchpad>/shots/<run>" PW="<scratchpad>/node_modules/playwright-core/index.js" \
MOTI_OWNER=… MOTI_EMPLOYEE=… MOTI_PW=… \
node .claude/skills/visual-test/scripts/sweep.mjs
```

| Env | Default | Narrow it with |
|---|---|---|
| `ROLES` | `signed-out,owner,employee` | `ROLES=employee` |
| `SIZES` | `phone,tablet,desktop` (360 / 820 / 1440) | `SIZES=phone` |
| `THEMES` | `light,dark` | `THEMES=dark` |
| `SCREENS` | all | `SCREENS=cart,inventory` (screen or sheet names) |

A full run is ~170 captures and takes a few minutes; after a fix, re-run only the screens it
touched. What it does, per role × size × theme:

- **Screens:** every route the role can open, then every tab inside `main`.
- **Sheets:** bell, account menu, Add item, cart (adds the first item), transaction detail.
- **Route guards:** signed-out `/inventory` must land on `/login`; the employee's typed owner
  URLs must land on `/transaction`.
- **Measures:** sideways document scroll, clipped boxes (ellipsis and line clamps are
  deliberate and skipped), buttons/tabs past the right edge, touch targets under 44 px
  (phone and tablet only), page and console errors.
- **Writes are faked:** every non-GET to `rest/v1` or `functions/v1` gets an empty 200, except
  the read RPCs `login_email`, `my_authority_role`, `inventory_summary`. A new read RPC must be
  added to `READ_RPC` in the script, or its screen shows faked data.

Output in `OUT`: `<role>/<screen>-<size>-<theme>.jpg`, `report.json` (every capture, its
issues, console errors, faked writes) and `index.html` — a phone gallery, light and dark side by
side, issues listed per screen.

Extend the script when a screen, tab or sheet is added: one entry in `SCREENS` or `SHEETS`.

## 3. Read the results — the numbers are not the verdict

The measures catch mechanical breakage. Design problems need eyes: **open the screenshots** with
the Read tool — every phone shot in light and dark, plus desktop for each screen — and judge them
against `ui-design-conventions` and `.claude/references/design-plan.md` (glance → understand →
act, compact native rows, one primary action, hierarchy, spacing, empty and loading states).

Known measured findings that are real, not noise: inputs 36 px tall on touch, account menu items
31 px. Treat a "small" hit as a finding to decide on, not an automatic fix.

## 4. Extra checks (when the change needs them)

- **Installed-app insets:** Edge cannot emulate `display-mode: standalone`. Inject a stylesheet
  that overrides the safe-area utilities with fixed values (47 px top, 34 px bottom), variant
  classes included (`.max-md\:pb-tabbar`). Build the CSS with `String.raw`, or JavaScript eats
  the `\:` and the rule is silently dropped.
- **iOS keyboard stand-in:** an init script replaces `window.visualViewport` with an
  `EventTarget` whose `height` shrinks while the layout viewport stays put, then dispatches
  `resize`. The sheet must sit on the keyboard with Save visible.
- **Loading / error / empty states:** delay `**/rest/v1/**` by 4 s (loading), abort it (error),
  search `zzqqxx-nothing` (empty).
- **Push:** `launchPersistentContext` (one scratchpad profile per user), `headless: false`,
  service workers allowed, `grantPermissions(["notifications"])`; delivery is proven by
  `registration.getNotifications()`. Edge subscribes through WNS. Real pushes are real writes —
  only when the task is push.

## 5. Report

- Totals: captures, captures with issues, failed steps, console errors, faked writes.
- Each real finding: role · screen · size · theme · what is wrong.
- **Show the screenshots:** publish `OUT/index.html` with the Artifact tool, passing every image
  it references through `files` (`<role>/<name>-phone-<theme>.jpg`). Republish to the same file
  path for a later run so the link stays.
- Never claim a physical-device result: real standalone launch, real insets and real keyboards
  are only checkable on the phone.
