# Project map — domain to path

Worked examples of the fan-out described in `architecture-navigation`. Use them as templates;
verify before assuming a file exists.

**Status:** Moti has no modules yet. When the first real module ships, replace the template below
with its actual paths and mark it as the reference module — every later screen copies it.

## Reference module — `<domain>` (template until the first module exists)

```
Screen      src/pages/<Domain>/<Domain>View.tsx                 ContentView + feature components only
UI          src/components/<domain>/tables/<Domain>Table.tsx    DataTable, columns, row actions
            src/components/<domain>/modal/<Domain>FormModal.tsx EntityFormModal + IFieldConfig[]
            src/components/<domain>/cards/<Domain>SummaryCards.tsx  StatCard in BentoGrid
Data        src/hook/data/<domain>/<domain>.list.hook.ts        useQuery, filters, pagination, modal handles
Form        src/hook/data/<domain>/<domain>.form.hook.ts        useForm + zodResolver + useMutation + error text
Calls       src/services/data/<domain>.services.ts              getList (paged), getAll, create/update/remove via runWrite
Input       src/models/data/<domain>/<domain>.request.ts        zod schemas + z.infer types
Rows        src/models/data/<domain>/<domain>.response.ts       I<Domain> interfaces (snake_case columns)
States      src/enums/<domain>.enum.ts                          status union + labels + tones
UI state    src/store/data/<domain>/<domain>.store.ts           only if beyond the common registries
Keys        src/keys/query.keys.ts      <domain>ListKey
            src/keys/modal.keys.ts      <domain>FormModalKey
            src/keys/table.keys.ts      <domain>TableKey
Look        src/styles/<domain>/<domain>.styles.ts              domain-only styles; shared ones in styles/<kind>/
Route       src/routes/route.paths.ts + src/routes/protected.view.routes.ts
Schema      supabase/migrations/<timestamp>_create_<domain_plural>.sql   table, FKs, indexes, RLS, policies
```

## Infrastructure

```
Supabase client     src/utils/supabase.utils.ts          supabase, toError
Env                 src/utils/env.utils.ts               the only import.meta.env reader
Offline writes      src/store/common/sync.store.ts       runWrite, queue, flush
                    src/utils/write.utils.ts             executeWrite
                    src/models/common/write.model.ts     IQueuedWrite
Network state       src/store/common/network.store.ts + src/hook/common/network.hook.ts
Store reset         src/store/common/reset.store.ts      create, resetAllStores
Modals              src/store/common/modal.store.ts + src/hook/common/modal.hook.ts
Confirm             src/store/common/confirm.store.ts + src/hook/common/confirmation.hook.ts
Pagination          src/store/common/pagination.store.ts + src/hook/common/pagination.hook.ts
Auth                src/services/data/auth.services.ts + src/store/data/auth/auth.store.ts
                    src/routes/route.guard.tsx
Shell               src/layouts/AppLayout.tsx + src/components/common/layout/
Tokens              src/styles/common/theme.css
PWA                 vite.config.ts (VitePWA), index.html, public/
Schema              supabase/migrations/
```

## Sibling references (read-only, outside this repo)

```
UI / hooks / stores   C:/Users/cclisondato/Documents/MyProgramming/Dcwd_Work/dcwd_apps-crm-customer2/src
Supabase / offline    C:/Users/cclisondato/Documents/MyProgramming/Ejie_Business/TARTAR/src
                      C:/Users/cclisondato/Documents/MyProgramming/Ejie_Business/TARTAR/supabase/migrations
```
