---
name: codebase-engineering
description: Default working method for the Moti PWA (React 19 + Vite + shadcn aria-vega + React Query + zustand + Supabase) — understand before changing, copy the nearest existing slice, plan and wait for approval, make the smallest correct change, validate with yarn build + yarn lint, hand over a commit suggestion. Use for any feature, bug fix, or refactor request in this repo.
---

# Codebase Engineering

The default workflow. Every other skill is a specialization of this one.

## Workflow

```
UNDERSTAND → LOCATE (architecture-navigation) → FIND NEAREST EXISTING PATTERN
→ PLAN + WAIT FOR APPROVAL → CONFIRM important decisions (§ F) → MINIMAL CHANGE
→ VALIDATE (§ G) → REPORT (+ migration command if the schema changed, + graphify reminder)
→ COMMIT SUBJECT + BULLETS — mandatory, always last (§ H)
```

Do not start editing on the first read of the request.

## A. Understand, then plan

Answer these before touching code:

- Which **layer** owns it? model / enum / key / service / hook / store / component / page / route /
  style / migration. When unsure: `componentization` § 1.
- Which existing slice is **closest** to what is being asked?
- Does it **already partially exist**? Search the same domain folder in every layer first.
- Does it change the **database**? Then `supabase-backend` applies and § F asks first.

Then present a **short numbered plan** — each file to add (`+`) or change (`~`) and what changes
in it — and **wait for explicit approval**. Reading and searching need no plan. A trivial one-line
fix may proceed after stating the one line being changed. If the approved plan turns out wrong
mid-way, stop and re-plan; never improvise a different change.

## B. Nearest existing pattern — always copy, never invent

Until Moti has its first module, the reference shapes are the ones in
`Dcwd_Work/dcwd_apps-crm-customer2/src` (UI, hooks, stores) and
`Ejie_Business/TARTAR/src` (Supabase services, write queue). Once the first Moti module exists,
**it** is the reference — record it in `.claude/references/project-map.md`.

| Need | Copy the shape of |
|---|---|
| New screen | `pages/<Domain>/<Domain>View.tsx` — `ContentView` + feature components, nothing else |
| List / query hook | `hook/data/<domain>/<domain>.list.hook.ts` — `useQuery` keyed from `keys/query.keys.ts` |
| Form + mutation hook | `hook/data/<domain>/<domain>.form.hook.ts` — `useForm` + `zodResolver` + `useMutation` + error text (crm-customer2 `billing.form.hook.ts`) |
| Service | `services/data/<domain>.services.ts` — one default-exported object, Supabase only (`supabase-backend` § B) |
| Request model | `models/data/<domain>/<domain>.request.ts` — zod schema + `z.infer` type |
| Response model | `models/data/<domain>/<domain>.response.ts` — `I`-prefixed interfaces |
| Store | `store/data/<domain>/<domain>.store.ts` — `States` + `Actions` + `initialValues`, reset-aware `create` |
| Modal | compose `AppModal` / `EntityFormModal` / `DetailModal`; state via `useModal(key)` |
| Table | `DataTable` in a `TablePanel` with `FilterToolbar` + `TablePagination` |
| Route | one entry in `routes/protected.view.routes.ts` + its path in `route.paths.ts` |
| UI primitive | `npx shadcn@latest add <x>` into `components/ui/`, wrapped once in `components/common/<kind>/` |
| Schema change | `supabase/migrations/<timestamp>_<name>.sql` (`supabase-backend` § F) |

Order of preference: **reuse → extend → careful refactor → new pattern (last resort)**.

## C. House rules

- **Layer flow is one-directional:** pages → components → hook/data → services/data →
  `utils/supabase.utils.ts`. A component never calls a service; a hook never imports Supabase;
  a service never imports React.
- **Pages are layout only.** No queries, no columns, no handlers in a page.
- **All client state is zustand** — `useState`/`useReducer` are lint errors. Modals through
  `useModal(key)`, confirmations through `useConfirm`, filters/search/pagination keyed per table.
- **Server state is React Query.** Never fetch in a component, never fetch in `useEffect`.
  Every mutation invalidates the keys it affects.
- **Forms are react-hook-form + zod.** The schema is the only validation layer — no manual `if`
  checks in the submit handler. Submit disabled while `mutation.isPending`.
- **UI comes from `components/common/`**, which is the only layer allowed to import
  `components/ui/` (`ui-design-conventions`).
- **Writes go through `runWrite`** so the PWA offline queue stays intact (`supabase-backend` § D).
- No new dependency without saying why the existing stack cannot do it.

## D. Comments — short, and one line

A comment is a single `//` line explaining a non-obvious *why*: a business rule, an external
limitation, a deliberate deviation, an edge case. Never restate the code, never a banner, never a
multi-line JSDoc essay, never commented-out code — delete it, git has it.

```ts
// Supabase returns an empty array, not an error, when RLS hides every row.
if (data.length === 0) throw new Error(notFoundMessage);
```

## E. Do not overengineer

No speculative abstractions, factories, wrappers, generic layers or barrel files. The simplest
thing that fits the existing architecture wins. Generalize with **props and a keyed registry**
(`useModal(key)`, `usePagination(key)`) — never with abstraction layers.

## F. Confirm before important changes

Ask first — in plain, non-technical language, numbered, with options — before:
schema/migration changes, RLS or auth changes, destructive data operations, changing an existing
table/column/RPC contract, business rules, adding or replacing a library, deleting functionality,
restructuring folders, or editing a shared `common/` file used by many screens.

```
Before I implement this, I need to confirm a few things:

1. [plain-language question]
   - A: ... (recommended)
   - B: ...
```

Do **not** ask when the change is obvious, isolated, reversible and already consistent with an
existing pattern — state the decision in one line and keep going.

## G. Validate

Cheapest sufficient check first, then stop:

| Change | Command |
|---|---|
| Copy, labels, a style constant | nothing — report it as compiled, let the user confirm it renders |
| New/changed types, models, services, or more than one file | `npx tsc -b` |
| Any feature, before reporting done | `yarn build` then `yarn lint` — 0 errors, 0 warnings |
| vite config, PWA, dependency | `yarn build` |

Report failures with the actual output. Never report success without running the check. Two
failures of the same command means stop and read the code. Never start `yarn dev` or
`yarn preview` yourself — they block and produce no verdict.

## H. After a successful change — mandatory close-out

Every change ends with these, in this order. A report that stops early is not finished:

1. Validation result (§ G).
2. Files added / changed, how to test, remaining notes — under ten lines.
3. If the schema changed: the migration commands for the user to run (`supabase-backend` § F).
4. If code changed: `Graph refresh: run graphify update . when convenient.` (skip for doc-only
   or `.claude/`-only edits; never claim the graph was updated).
5. **Commit suggestion**, in a copyable block, always last:

```
Feature: Task List With Status Filter

- Added task list screen with status filter and pagination
- Added tasks table, RLS policies and list RPC migration
```

**Title** — `Type: Short Title Case Summary`, one line, no trailing period. Types, and only these:
`Feature` · `Fix` · `BugFix` · `Migration` · `Update`.

**Body** — `-` bullets only, one line each, important changes only. No prose paragraphs, no
file-by-file restatement of the diff.

Suggest only — never commit, push or branch unless asked. If several requests were handled in
one turn, give one commit covering what is actually uncommitted.

## I. Minimal change principle

Touch only what the request requires. If you spot an unrelated problem, mention it in the report
and leave it alone unless fixing it is required to finish safely.

## J. Building a new feature end to end

A request for a new feature produces the **whole vertical slice**, in this order. Never stop at
the component, and never invent a shortcut layer.

1. Migration `supabase/migrations/<timestamp>_<name>.sql` — table, FKs, indexes, RLS (confirm first, § F)
2. `enums/<domain>.enum.ts` — status unions + label/tone maps (if the domain has states)
3. `models/data/<domain>/<domain>.request.ts` (zod) and `<domain>.response.ts`
4. `keys/query.keys.ts` (+ `modal.keys.ts`, `table.keys.ts` as needed)
5. `services/data/<domain>.services.ts`
6. `hook/data/<domain>/<domain>.list.hook.ts` and `<domain>.form.hook.ts`
7. `store/data/<domain>/<domain>.store.ts` — only if the screen has client state beyond the
   common registries
8. `components/<domain>/<kind>/*.tsx` + `styles/<domain>/*.styles.ts`
9. `pages/<Domain>/<Domain>View.tsx`
10. `routes/route.paths.ts` + `routes/protected.view.routes.ts`

Non-negotiables — a slice that misses one is not done:

- **Correctness** — every Supabase `error` is thrown through `toError`; the UI shows it.
- **States** — loading, empty, error and success on every data view (`ui-design-conventions`).
- **Efficiency** — explicit column lists, never `select("*")`; no query inside a loop.
- **Scalability** — a growing list is server-paged (`.range()` + `count: "exact"`).
- **Security** — RLS on every table; never trust the client for ownership; no service-role key
  in the client; never log a token or personal record.
- **Offline** — writes through `runWrite`; queued results surface a queued message, not success.
- **Mobile** — usable at 360 px width, touch targets ≥ 44 px, safe areas respected.

Then validate (§ G) and close out (§ H). State which files you created and which you skipped.
