---
name: architecture-navigation
description: Find the right files in the Moti app fast — one command that returns a domain's whole fan-out across every layer, a path-inference map, a progressive search ladder, and the impact check before editing shared code. Use for "where is X", "which file handles Y", and impact analysis before a change.
---

# Architecture Navigation

Goal: open 3–6 correct files, not 60 — and get there in **two commands, not twenty**.

## 1. Start with one command, always

Every file belonging to a domain carries the domain's name. That makes the whole fan-out one
`find` away. Run this **before** inferring anything:

```bash
find src supabase -iname "*<domain>*" -not -path "*/components/ui/*"
```

Pair it, in the **same message**, with the "who touches it" half:

```bash
grep -rl "<Symbol>" src --include=*.ts --include=*.tsx
```

Two parallel calls, and you know both where the domain lives and what depends on it. Read files
only after this. Sizing rules: `token-efficiency` § 1.

When the find comes back empty, the domain is named something else — try the shorter noun, then
fall through to § 3.

## 2. The layer flow — a feature is always these files

```
pages/<Domain>/<Domain>View.tsx                    layout only — ContentView + feature components
components/<domain>/<kind>/<PascalCase>.tsx        kind = cards | tables | modal | forms | panels | wizard | menus
hook/data/<domain>/<domain>.<kind>.hook.ts         kind = list | form (React Query + orchestration)
services/data/<domain>.services.ts                 Supabase calls only
models/data/<domain>/<domain>.{request,response}.ts
supabase/migrations/<timestamp>_<name>.sql         the table behind it
```

Supporting layers: `store/data/<domain>/<domain>.store.ts`, `styles/<kind|domain>/<name>.styles.ts`
(**never** colocated), `keys/{query,modal,table,storage}.keys.ts`, `enums/<domain>.enum.ts`,
`routes/`, `utils/`.

## 3. Fallback — infer the path

Use this when § 1 came back empty, or when placing a **new** file. Given a domain `x`:

```
x
├── Screen     → src/pages/<X>/<X>View.tsx
├── UI         → src/components/x/<kind>/<X><Thing>.tsx
├── Data       → src/hook/data/x/x.list.hook.ts           (queries, filters, pagination)
├── Form       → src/hook/data/x/x.form.hook.ts           (useForm + zod + mutation + error text)
├── Calls      → src/services/data/x.services.ts          (the only Supabase caller for x)
├── Input      → src/models/data/x/x.request.ts           (zod schemas + inferred types)
├── Rows       → src/models/data/x/x.response.ts          (I-prefixed interfaces)
├── States     → src/enums/x.enum.ts                      (unions + label/tone maps)
├── UI state   → src/store/data/x/x.store.ts
├── Look       → src/styles/x/<name>.styles.ts  or  src/styles/<kind>/<name>.styles.ts
├── Keys       → src/keys/query.keys.ts, modal.keys.ts, table.keys.ts
├── Route      → src/routes/route.paths.ts + protected.view.routes.ts
└── Schema     → supabase/migrations/*_x*.sql
```

Multi-word domain: kebab-case folder, dots in the filename —
`hook/data/expense-category/expense.category.list.hook.ts`.

Worked example once the first module exists: `.claude/references/project-map.md`.

## 4. Progressive search ladder

Stop at the first rung that answers. Rungs 1–2 answer most questions.

1. **One-shot find** (§ 1) — the default opening move.
2. **Known path** — § 3 or the project map already says where it is. Open it.
3. **Symbol search** — `grep -rl` for the component, hook, query key, modal key, table name or
   RPC name, scoped to `src/` or `supabase/`; then `grep -n` in the winners.
4. **Route data** — when a screen is hard to find, `routes/protected.view.routes.ts` names the
   page component directly.
5. **Nearest sibling** — read the closest existing domain's files to learn the shape.
6. **Graph** — `graphify query "..."` / `graphify affected "X"` when `graphify-out/graph.json`
   exists (`graphify-workflow`).
7. **Broad scan** — only with a real reason, and say why.

Never start at rung 7. Never read `node_modules/`, `dist/`, `dev-dist/` or `components/ui/`
to answer a behaviour question.

## 5. Entry points

| Question | File |
|---|---|
| What renders first / providers | `src/main.tsx`, `src/App.tsx` |
| Supabase client, error mapping | `src/utils/supabase.utils.ts` |
| Offline write queue | `src/store/common/sync.store.ts`, `src/utils/write.utils.ts` |
| Env vars | `src/utils/env.utils.ts` (the only reader of `import.meta.env`) |
| Auth / session | `src/services/data/auth.services.ts`, `store/data/auth/`, `routes/route.guard.tsx` |
| Navigation (sidebar, tab bar, topbar) | `src/routes/protected.view.routes.ts` |
| App shell | `src/layouts/AppLayout.tsx`, `components/common/layout/` |
| Design tokens | `src/styles/common/theme.css` |
| PWA manifest + service worker | `vite.config.ts` (`VitePWA`), `index.html`, `public/` |
| Current schema | `supabase/migrations/` (newest last) |

## 6. Impact check before editing shared code

Anything under `components/common/`, `hook/common/`, `store/common/`, `utils/`, `keys/`,
`models/common/` or `styles/common/` is app-wide. Before editing:

1. `grep -rl "<Name>" src --include=*.ts --include=*.tsx` — count the callers.
2. More than one caller → the change must be **additive**: a new optional prop or variant with
   the current behaviour as default.
3. `styles/common/theme.css` affects every screen — token changes need the user's go-ahead.
4. A migration that alters an existing table, column, policy or RPC affects every service that
   reads it — list them before proposing it (`supabase-backend` § F).
