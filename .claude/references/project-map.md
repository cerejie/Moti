# Project map — domain to path

Worked examples of the fan-out described in `architecture-navigation`. Use them as templates;
verify before assuming a file exists.

**Status:** Inventory is the reference module (2026-10-02). Every later screen copies it.

## Reference module — `inventory`

```
Screen      src/pages/Inventory/InventoryView.tsx                ContentView + table + its modals
UI          src/components/inventory/tables/InventoryTable.tsx   TablePanel, FilterToolbar, DataTable (renderCard on phones)
            src/components/inventory/cards/InventoryItemCard.tsx phone row
            src/components/inventory/menus/InventoryRowActions.tsx  role-aware RowActionMenu
            src/components/inventory/modal/ItemFormModal.tsx     EntityFormModal + IFieldSection[]
            src/components/inventory/modal/StockMovementModal.tsx sale / add / deduct with preview
            src/components/inventory/modal/ItemDetailModal.tsx   DetailModal + movement history
            src/components/inventory/menus/StockAlertsBell.tsx   owner bell in the topbar
Data        src/hook/data/inventory/inventory.list.hook.ts       list, summary, alerts queries
Form        src/hook/data/inventory/inventory.form.hook.ts       item form + archive
            src/hook/data/movement/movement.form.hook.ts         stock movement form
Calls       src/services/data/inventory.services.ts              paged list, rpc create_item, runWrite updates
            src/services/data/movement.services.ts               rpc record_movement (p_client_id)
Input       src/models/data/inventory/inventory.request.ts       zod; numbers kept as strings
Rows        src/models/data/inventory/inventory.response.ts      IInventoryItem, IInventorySummary
States      src/enums/stock.enum.ts                              status, reasons, tones
Keys        src/keys/query.keys.ts (stockQueryKeys) · modal.keys.ts · table.keys.ts
Look        src/styles/inventory/inventory.styles.ts
Route       src/routes/route.paths.ts + src/routes/protected.view.routes.ts (can + permissionLoader)
Schema      supabase/migrations/20261002000002_create_inventory.sql
```

Other modules: `category`, `movement`, `dashboard`, `user` (Team), `account`, `auth`.

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
Auth                src/services/data/account.services.ts + src/store/data/account/account.store.ts
                    src/hook/account/*.hook.ts (login, logout/endSession, expiry, permission, me)
                    src/models/common/permission.model.ts · src/routes/route.loader.ts
Push                src/hook/common/push.hook.ts · src/services/data/push.services.ts
                    public/push-sw.js (workbox.importScripts) · supabase/functions/send-push
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
