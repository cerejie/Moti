---
name: supabase-backend
description: The Moti backend is Supabase — the one client, the service-object shape, error mapping, explicit column lists, server paging, RPC for transactional writes, the offline write queue, auth/session, storage, RLS, environments, and SQL migrations that Claude writes but never runs. Use before any service file, table, column, migration, policy, RPC, storage bucket or auth change.
---

# Supabase Backend

Supabase is Moti's **only** backend. The pattern is copied from `Ejie_Business/TARTAR`
(`src/utils/supabase.utils.ts`, `src/utils/write.utils.ts`, `src/store/common/sync.store.ts`,
`src/services/data/*.services.ts`, `supabase/migrations/`). When something here is ambiguous, read
the TARTAR equivalent and follow it.

## A. The one client

`src/utils/supabase.utils.ts` creates the client **once** and exports `supabase` and `toError`.
Never construct a second client, and never import `supabase` outside `src/services/data/` and
`src/utils/write.utils.ts`.

```ts
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
```

- URL and anon key come from `src/utils/env.utils.ts` (the only reader of `import.meta.env`),
  validated at module load with a clear "copy `.env.example` to `.env.local`" error.
- `toError(error)` turns a Supabase/Postgres error into a user-readable `Error`, mapping
  constraint codes to sentences (`23505` duplicate, `23503` still referenced, `42501` RLS denied).
  Add a code there — never hand-write the same sentence in a service.
- If `src/models/common/database.types.ts` exists, type the client with it
  (`createClient<Database>`). Regenerating it is the user's command:
  `supabase gen types typescript --linked > src/models/common/database.types.ts`.

## B. Service shape

One file per domain, `src/services/data/<domain>.services.ts`, one default-exported object.
No React, no state, no UI. Every read checks `error` and throws `toError(error)`.

```ts
const table = "tasks";
const columns = "id, title, status, due_date, owner_id, created_at";

const taskServices = {
  getList: async (
    filters: ITaskFilters,
    pagination: IPaginationRequest,
  ): Promise<IPaginationResponse<ITask>> => {
    const [from, to] = pageRange(pagination);
    let query = supabase.from(table).select(columns, { count: "exact" });
    if (filters.status) query = query.eq("status", filters.status);
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);
    return { items: (data ?? []) as ITask[], totalCount: count ?? 0 };
  },

  create: (values: ICreateTaskRequest) =>
    runWrite({ kind: "insert", table, values, label: "Create task" }),
};

export default taskServices;
```

Rules:

- **Explicit column lists** — never `select("*")`. Embedded relations by name:
  `owner:profiles(full_name)`.
- **Growing lists are server-paged**: `.range()` + `{ count: "exact" }`, returning
  `IPaginationResponse<T>`; the hook threads pagination into both the query key and the call.
  Lookup lists that feed selects stay unpaged; a report/export gets a separate `getAll`.
- Filtering, sorting and aggregation happen in the query or an RPC, not in JS over a full fetch.
- The service returns rows in their **snake_case** shape; response models match the columns.
- `AbortSignal`: pass React Query's `signal` through `.abortSignal(signal)` on reads.

## C. Transactions and business logic — RPC

Anything that must succeed or fail together (multi-table writes, counters, status transitions
with side effects) is a **Postgres function** called with `supabase.rpc("fn_name", { p_arg })` —
arguments `p_`-prefixed — never a sequence of client calls. Business rules that protect data
integrity live in the database (constraints, functions, triggers), not only in the UI.

## D. Writes go through the offline queue

Moti is a PWA that keeps working offline. **Every insert / update / delete / rpc write goes
through `runWrite`** (`src/store/common/sync.store.ts`), which executes `executeWrite`
(`src/utils/write.utils.ts`) when online and enqueues the write — persisted under a key from
`keys/storage.keys.ts` — when offline. The queue flushes on reconnect.

- A service write returns `runWrite({ kind, table, values | match | fn, args, label })`.
- `executeWrite` throws when an update/delete matched nothing ("changed nothing — the record is
  gone or you lack permission"); keep `.select()` on those so RLS denials are not silent.
- A mutation result with `queued: true` surfaces a **queued** message ("Saved offline — will sync
  when you're back online"), never a success message. The mutation hook handles this once; do not
  reimplement it per feature.
- Writes that need the server's answer immediately (sign-in, payments, uniqueness checks) are
  online-only: call `executeWrite` directly and show the offline state if `navigator.onLine` is false.
- Never bypass the queue by calling `supabase.from(...).insert()` in a service.

## E. Auth, storage, realtime

- **Auth** lives in `services/data/auth.services.ts` (`signInWithPassword`, `signUp`,
  `signInWithOtp`, `signOut`, `getSession`). One `onAuthStateChange` subscription, in the auth
  hook, mirrors the session into `store/data/auth/auth.store.ts`; sign-out calls
  `resetAllStores()` and clears the React Query cache. Route guards read the store, not Supabase.
  The final auth model (email, phone OTP, OAuth, roles) is decided with the Moti spec — ask.
- **Storage**: buckets are created in a migration with their policies; uploads/downloads go
  through the owning domain's service. Store the object path in the row, not a public URL; use
  signed URLs for private buckets.
- **Realtime**: subscribe in a hook with cleanup, and use the event to `invalidateQueries` —
  never write realtime payloads into a store.

## F. Migrations — Claude writes SQL, the user runs it

**Never run** `supabase db push`, `supabase migration up`, `supabase db reset`, `supabase link`,
or SQL against a live project. Never generate a migration without approval (`codebase-engineering`
§ F). Write the file, then hand the commands over.

- File: `supabase/migrations/<YYYYMMDDHHMMSS>_<verb_first_snake_name>.sql`, timestamp later than
  every existing file.
- **Additive by default.** Never drop or rename a column or table, never rewrite data, without
  explicit approval that names what it breaks. Preserve production data.
- Every new table ships in the same migration with:
  - `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`
    (+ `updated_at` with a trigger if rows are edited)
  - foreign keys for every relationship, with a deliberate `on delete` rule
  - indexes on every column used to filter, sort or join (including FK columns)
  - `alter table <t> enable row level security;` and explicit policies per operation — ownership
    via `auth.uid()`; no `using (true)` on user data
  - `check` constraints for enumerated values and invariants
- Functions: `security invoker` by default; `security definer` only when needed, with
  `set search_path = ''` and fully-qualified names.

End the report with the commands for the user:

```bash
# Local stack
supabase db reset                 # rebuild local DB from all migrations

# Remote project (after `supabase link --project-ref <ref>`)
supabase db push                  # apply pending migrations
supabase gen types typescript --linked > src/models/common/database.types.ts
```

## G. Environments and secrets

- `.env.example` (committed) lists `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with empty
  values; real values go in `.env.local` (git-ignored). Separate Supabase projects for dev and
  prod map to `.env.development.local` / `.env.production.local` if used.
- Only the **anon** key ever reaches the client. The `service_role` key, the JWT secret and DB
  passwords never appear in `src/`, `.env*` committed files, or the service-worker cache.
- RLS is the security boundary — anything the anon key can reach without a policy is public.

## H. Checklist before reporting a data change

- [ ] Supabase touched only in `services/data/` (and `write.utils.ts`)
- [ ] Every `error` thrown through `toError`; explicit columns; growing lists paged
- [ ] Writes via `runWrite`; queued result handled by the mutation hook
- [ ] Mutation invalidates the affected query keys
- [ ] New table: PK, FKs, indexes, RLS + policies, constraints
- [ ] Migration written, **not run**; commands handed to the user
