# Project map — domain to path

Worked examples of the fan-out described in `architecture-navigation`. Use them as templates;
verify before assuming a file exists.

**Status:** Inventory (Phase 2) is the reference module. Every later screen copies its shape.

## Reference module: `inventory`

```
Screen      src/pages/Inventory/InventoryView.tsx              ContentView + sections + modals only
            src/pages/Inventory/InventoryItemView.tsx          detail page, `back` link, no title
UI          src/components/inventory/panels/InventorySections.tsx  ViewTabs Items | Movements (managers), else Items only
            src/components/inventory/panels/InventoryPanel.tsx     TablePanel: toolbar, table, pagination, no-shop state
            src/components/inventory/panels/InventoryToolbar.tsx   SegmentTabs (status) + FilterToolbar + sort SelectInput
            src/components/inventory/panels/InventoryActions.tsx   header buttons, manager-only
            src/components/inventory/tables/InventoryTable.tsx     DataTable columns; compact column set on phones
            src/components/inventory/modal/ItemFormModal.tsx       EntityFormModal + IFieldSection[]; selects with "+ Add …" (selectAction)
            src/components/inventory/cards/ItemSummaryCard.tsx     SectionCard + StatCards
Data        src/hook/data/inventory/inventory.list.hook.ts     useInventoryList, useInventoryItem, useInventorySection, useOpenMovements
Form        src/hook/data/inventory/inventory.form.hook.ts     useItemForm (pick lists, code hint, add category/brand on top), useItemArchive
Calls       src/services/data/inventory.services.ts            getList (paged view read), getById, create/update/setArchived via runWrite rpc
Input       src/models/data/inventory/inventory.request.ts     itemSchema (ids + text inputs; item_code display only), IInventoryFilters
Rows        src/models/data/inventory/inventory.response.ts    IInventoryItem (one view row; brand/unit/location names + ids)
States      src/enums/inventory.enum.ts                        StockStatus labels + tones, tabs, sections, sort
Keys        src/keys/query.keys.ts      inventoryListKey, inventoryItemKey
            src/keys/modal.keys.ts      itemFormModalKey
            src/keys/table.keys.ts      inventoryTableKey, inventoryStatusKey, inventorySectionKey
Look        src/styles/inventory/inventory.styles.ts
Route       src/routes/route.paths.ts (inventory, inventoryItem) + src/routes/protected.view.routes.ts
Schema      supabase/migrations/20260924000002_create_inventory_catalog.sql   tables, status view, RLS, write RPCs
            supabase/migrations/20260925000003_create_masterfile_and_item_codes.sql   item_code, masterfile, current item RPCs
```

Patterns to copy:
- **Writes are RPCs** that take a client-generated id (`newWriteId()` in the service), so an offline
  replay is a no-op. Clients get select policies only.
- **Mutations use `useAppMutation`** (`hook/common/mutation.hook.ts`), which shows the success or
  "saved offline" toast, invalidates by key prefix, and uses `toastErrors` for writes started from a confirm.
- **Modal openers are split from the form hook** (`useItemFormModal` vs `useItemForm`), so a button
  never creates a second form instance.

## Second slice: `movement` (Phase 3)

```
Screen      Inventory → Movements tab (InventorySections)       shop-wide ledger, owners only
UI          src/components/movement/modal/StockMovementModal.tsx  one form for sale / add / deduct
            src/components/movement/cards/BalancePreview.tsx      before → after
            src/components/movement/panels/StockActions.tsx       Sell / Add stock / Deduct on the item page
            src/components/movement/panels/MovementsPanel.tsx + MovementToolbar.tsx
            src/components/movement/tables/MovementTable.tsx      shared by the page and the item card (`showItem`)
            src/components/movement/cards/ItemMovementsCard.tsx   item page history
Data        src/hook/data/movement/movement.list.hook.ts        useMovementList, useMovementTab, useItemMovements
Form        src/hook/data/movement/movement.form.hook.ts        useStockMovementModal, useStockMovementForm
Calls       src/services/data/movement.services.ts              getList, getByItem, record (runWrite rpc)
Models      src/models/data/movement/movement.request.ts / movement.response.ts
States      src/enums/movement.enum.ts                          types, reasons, modes, tabs
Schema      supabase/migrations/20260924000003_create_stock_movement_history.sql
```

- **Idempotency key per form open:** `client_id` is part of the form values, generated when the modal opens.

## Masterfile: `category`, `brand`, `masterfile` (units + locations) (Phase 9)

```
Screen      src/pages/Masterfile/MasterfileView.tsx             /settings/masterfile, managers; `back` to Settings
UI          src/components/masterfile/panels/MasterfilePanel.tsx   no-shop state + ViewTabs Categories | Brands | Units | Locations
            src/components/masterfile/panels/MasterfileList.tsx    shared list: count + Add, four states, RowActionMenu rows
            src/components/masterfile/panels/CategoryListPanel.tsx, BrandListPanel.tsx, MasterfileEntryPanel.tsx (kind prop)
            src/components/category/modal/CategoryFormModal.tsx    name, code (toCodeInput mask), brands multiselect
            src/components/brand/modal/BrandFormModal.tsx          name, code, "Sold in" categories multiselect
            src/components/masterfile/modal/MasterfileFormModal.tsx  unit or location name, one instance per kind
Data        src/hook/data/{category,brand,masterfile}/*.list.hook.ts   useCategoryOptions, useBrandOptions, useMasterfileOptions(kind), useMasterfileTab
Form        src/hook/data/{category,brand,masterfile}/*.form.hook.ts   modal data may carry onCreated(id) → caller auto-selects
Calls       src/services/data/{category,brand,masterfile}.services.ts   unpaged getOptions with item counts; runWrite rpc writes
Models      src/models/data/{category,brand,masterfile}/*.ts; src/utils/code.utils.ts (codePattern, toCodeInput)
States      src/enums/masterfile.enum.ts                        tabs, kinds
Look        src/styles/masterfile/masterfile.styles.ts
Schema      supabase/migrations/20260925000003_create_masterfile_and_item_codes.sql
Tests       supabase/tests/masterfile.test.sql
```

- **Item codes are the server's:** `app.next_item_code` locks the category row; the form only previews `CAT-BRD-###`.
- **Stacked forms:** the item page mounts `CategoryFormModal` and `BrandFormModal` after `ItemFormModal`, so
  "+ Add category / brand" opens on top and returns the new id through `onCreated`.
- **Settings hub:** `SettingsLinksCard` lists the `/settings/*` sub-pages the role can open.

## Third slice: `dashboard` (Phase 4)

```
Screen      src/pages/Dashboard/DashboardView.tsx               owners only
UI          src/components/dashboard/panels/DashboardPanel.tsx     no-shop state + the three cards
            src/components/dashboard/cards/StockSummaryCards.tsx   StatCard tiles; status tiles preset the Inventory tab
            src/components/dashboard/cards/StockAlertsCard.tsx     + tables/StockAlertTable.tsx (shared with the sheet)
            src/components/dashboard/cards/RecentMovementsCard.tsx reuses MovementTable
            src/components/dashboard/modal/StockAlertsModal.tsx    bell sheet, mounted in AppLayout
            src/components/common/layout/StockAlertsButton.tsx     topbar bell
Data        src/hook/data/dashboard/dashboard.list.hook.ts      useStockSummary, useStockAlerts, useRecentMovements,
                                                                useOpenStockStatus, useStockAlertsModal
Calls       src/services/data/dashboard.services.ts             getSummary, getAlerts (read-only views)
Models      src/models/data/dashboard/dashboard.response.ts
Nav badge   route `badge: "stockAlerts"` → useNavigationMenu → AppSidebar / TabBar
Schema      supabase/migrations/20260924000004_create_inventory_dashboard_views.sql
```

## Fourth slice: `analyzer` (Phase 5)

```
Screen      src/pages/Analyzer/AnalyzerView.tsx                 owners only
UI          src/components/analyzer/panels/AnalyzerPanel.tsx       no-shop / timezone states + Ranking | Needs reorder tabs
            src/components/analyzer/panels/RankingPanel.tsx        AnalyzerToolbar (period, step, metric) + summary + table
            src/components/analyzer/panels/RankingToolbar.tsx      category / status filters + sort direction
            src/components/analyzer/panels/ReorderPanel.tsx        + tables/ReorderTable.tsx
            src/components/analyzer/cards/AnalyzerSummaryCards.tsx StatCards, each with an InfoHint formula
Data        src/hook/data/analyzer/analyzer.list.hook.ts        useAnalyzerPeriod, useAnalyzerView, useVolumeRanking,
                                                                usePeriodSummary, useReorderItems
Calls       src/services/data/analyzer.services.ts              rpc reads: ranking (paged), summary, reorder (paged)
Models      src/models/data/analyzer/analyzer.request.ts + analyzer.response.ts; enums/analyzer.enum.ts (labels + formulas)
Dates       src/utils/date.utils.ts                             periodRange, todayIn, day start/end instants (shop tz)
            src/hook/data/shop/shop.list.hook.ts                useShopTimezone
Schema      supabase/migrations/20260924000005_create_smart_analyzer.sql
Seed        supabase/seed.sql                                   Phase 5 scenario with hand-calculated results
```

## Infrastructure

```
Supabase client     src/utils/supabase.utils.ts          supabase, toError
Env                 src/utils/env.utils.ts               the only import.meta.env reader
Offline writes      src/store/common/sync.store.ts       runWrite, queue, flush, failedId
Sync issues         src/hook/common/network.hook.ts      useSyncStatus, useSyncIssues
                    src/components/common/layout/SyncStatusButton.tsx + common/modal/SyncIssuesModal.tsx
                    src/utils/write.utils.ts             executeWrite
                    src/models/common/write.model.ts     IQueuedWrite
Network state       src/store/common/network.store.ts + src/hook/common/network.hook.ts
Store reset         src/store/common/reset.store.ts      create, resetAllStores
Modals              src/store/common/modal.store.ts + src/hook/common/modal.hook.ts
Confirm             src/store/common/confirm.store.ts + src/hook/common/confirmation.hook.ts
Pagination          src/store/common/pagination.store.ts + src/hook/common/pagination.hook.ts
Auth                src/services/data/auth.services.ts + src/store/data/auth/auth.store.ts
                    src/hook/data/auth/auth.session.hook.ts   useAuthSession, useMe, usePermissions, useSignOut
                    src/routes/route.guard.tsx                ProtectedRoute, PublicRoute, PermissionGate
Permissions         src/models/common/permission.model.ts     derivePermissions; routes gate with `can`
Mutations + toasts  src/hook/common/mutation.hook.ts      useAppMutation; toaster in components/common/status/AppToaster.tsx
Tenancy             src/hook/data/shop/shop.list.hook.ts      useActiveShop (superadmin switcher or own shop)
                    src/store/data/shop/shop.store.ts         superadmin's picked shop
Date range filter   src/components/common/filter/DateRangeFilter.tsx   Popover + aria RangeCalendar
Formula hint        src/components/common/view/InfoHint.tsx            tap-to-open ⓘ popover
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
