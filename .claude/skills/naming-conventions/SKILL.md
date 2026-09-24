---
name: naming-conventions
description: Where a new file goes in the Moti app and what it is called — folder-per-domain rules, file naming by kind, names inside files, SQL naming, and the reuse-first inventory. Use before creating or moving any component, hook, service, model, store, style, page, route or migration.
---

# Naming & Pathing Conventions

**Rule zero: never invent a convention this repo already has.** Before naming or placing
anything, open the two nearest existing siblings and copy their vocabulary, folder and file-name
shape. Consistency beats preference. Until Moti has siblings, the reference is
`Dcwd_Work/dcwd_apps-crm-customer2/src`.

## Where a new file goes

| Kind | Path | Naming | Example |
|---|---|---|---|
| Page | `src/pages/<Domain>/<Name>View.tsx` | PascalCase + `View` | `pages/Tasks/TasksView.tsx` |
| Feature component | `src/components/<domain>/<kind>/<Name>.tsx` | PascalCase | `components/task/tables/TasksTable.tsx` |
| Table cell | `src/components/<domain>/tables/cells/<Name>Cell.tsx` | `<Thing>Cell` | `tables/cells/DueDateCell.tsx` |
| Modal | `src/components/<domain>/modal/<Name>Modal.tsx` | `<Thing>Modal` | `task/modal/TaskFormModal.tsx` |
| App primitive | `src/components/common/<kind>/<Name>.tsx` | `App<Thing>` for thin shadcn wrappers | `common/button/AppButton.tsx` |
| shadcn primitive | `src/components/ui/<name>.tsx` | generated, kebab-case | `ui/dialog.tsx` |
| Data hook | `src/hook/data/<domain>/<domain>.<kind>.hook.ts` | kinds: `list`, `form` | `hook/data/task/task.list.hook.ts` |
| Shared hook | `src/hook/common/<name>.hook.ts` | lowercase, dot-separated | `hook/common/pagination.hook.ts` |
| Service | `src/services/data/<domain>.services.ts` | plural `services`, default export `<domain>Services` | `services/data/task.services.ts` |
| Request model | `src/models/data/<domain>/<domain>.request.ts` | zod schema camelCase + `I<Thing>Request` type | `createTaskSchema`, `ICreateTaskRequest` |
| Response model | `src/models/data/<domain>/<domain>.response.ts` | `I<Thing>` | `ITask` |
| Shared contract | `src/models/common/<name>.model.ts` | `I<Thing>` | `pagination.model.ts` → `IPaginationResponse<T>` |
| Enum | `src/enums/<domain>.enum.ts` | union type + `<thing>Labels` / `<thing>Tones` maps | `TaskStatus`, `taskStatusLabels` |
| Store | `src/store/data/<domain>/<domain>.store.ts` | `use<Domain>Store` + `select*` selectors | `useTaskStore`, `selectTaskFilters` |
| Common store | `src/store/common/<name>.store.ts` | `use<Name>Store` | `modal.store.ts` |
| Style | `src/styles/<kind\|domain>/<name>.styles.ts` | camelCase constants / `cva` variants | `styles/table/table.styles.ts` |
| Tokens | `src/styles/common/theme.css` | shadcn variable names + Moti extras | `--primary`, `--success` |
| Key constant | `src/keys/<kind>.keys.ts` | `<thing>ListKey`, `<thing>FormModalKey`, `<thing>PaginationKey`, `<thing>StorageKey` | `taskListKey` |
| Util | `src/utils/<topic>.utils.ts` | named exports | `format.utils.ts` |
| Route path | `src/routes/route.paths.ts` | `ROUTES.<camelKey>` | `ROUTES.tasks` |
| Route entry | `src/routes/protected.view.routes.ts` | `key` kebab-case, `label` Title Case | `key: "tasks"` |
| Migration | `supabase/migrations/<YYYYMMDDHHMMSS>_<snake_name>.sql` | verb-first snake_case | `20261001090000_create_tasks.sql` |

A file belongs to the **domain it serves**, never to a top-level folder named after its kind. A
task modal lives in `components/task/modal/`, not in `components/modal/`. Domain folders are
**singular, lowercase** (`task`, `expense-category`); page folders are PascalCase (`Tasks`).

## Names inside files

- Components: `const TasksTable = () => …; export default TasksTable;` — one default export at the
  bottom matching the filename.
- Props: a local, unexported `type IProps = { … }`.
- Hooks: `use<Thing>` named exports — `useTaskList`, `useCreateTaskForm`.
- Handlers: `handle<Event>` (`handleRowSelect`); callback props: `on<Event>` (`onSubmit`).
- Booleans: `is` / `has` / `can` prefixes (`isOverdue`, `canEdit`).
- Name things for what they are — `overdueTasks`, `effectiveFilters`. Never `data2`, `tmp`,
  `handleThing`.
- Constants shared across files are camelCase named exports; `SCREAMING_SNAKE_CASE` only for
  true compile-time constants (`MAX_UPLOAD_BYTES`).

## Database naming (Supabase / Postgres)

- Tables: plural snake_case (`tasks`, `task_comments`). Columns: snake_case (`due_date`, `created_by`).
- Primary key `id uuid default gen_random_uuid()`; timestamps `created_at` / `updated_at timestamptz`.
- Foreign keys: `<singular>_id` (`task_id`, `owner_id` → `auth.users`).
- Enums: `<thing>_status` Postgres type, or a `check` constraint — match what exists.
- RPC functions: verb-first snake_case (`complete_task`), arguments `p_`-prefixed (`p_task_id`).
- Policies: a quoted sentence — `"owners can update their tasks"`.
- Response models keep the snake_case column names; do not rename them in the service.

## Reuse before creating

Check `components/common/` and `hook/common/` first — the inventory is in
`ui-design-conventions` § 3. Only write a new file when nothing there fits, and when a second
domain needs the same thing, promote it to `common/` (`componentization`).

## Do not

- No barrel `index.ts` files (except `routes/index.ts`).
- No `@/` imports outside `components/common/` — see CLAUDE.md "Imports are relative".
- No colocated `*.styles.ts` next to a component.
- No `Manager`, `Handler`, `Provider`, `Repository` or `Helper` suffixes on new modules — this app
  uses `services`, `hook`, `store`, `utils`.
- No hand-edited file under `components/ui/`, and no rename of a generated shadcn file.
