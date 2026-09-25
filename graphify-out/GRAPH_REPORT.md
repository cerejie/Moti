# Graph Report - Moti  (2026-09-25)

## Corpus Check
- 411 files · ~201,765 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .example 1, .ico 1)

## Summary
- 2378 nodes · 6803 edges · 122 communities (118 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 392 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `75a0a13a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- UserTable.tsx
- cn
- dropdown-menu.tsx
- ContentView.tsx
- RankingPanel.tsx
- inventory.form.hook.ts
- Separator
- Button
- cn.utils.ts
- masterfile.form.hook.ts
- category.form.hook.ts
- select.tsx
- shop.form.hook.ts
- ShopSettingsCard.tsx
- Composition: asChild (radix) vs render (base)
- InventoryTable.tsx
- transaction.styles.ts
- dashboard.list.hook.ts
- movement.form.hook.ts
- VolumeRankingTable.tsx
- AppSidebar.tsx
- lucide-react
- TabBar.tsx
- user.services.ts
- App.tsx
- DataTable.tsx
- StockSummaryCards.tsx
- MovementTable.tsx
- analyzer.list.hook.ts
- package.json
- navigation.hook.ts
- EntityFormModal.tsx
- shop.list.hook.ts
- field.tsx
- Roadmap
- AppModal.tsx
- SegmentTabs.tsx
- movement.list.hook.ts
- pagination.hook.ts
- dependencies
- FilterToolbar.tsx
- reset.store.ts
- TransactionDetailModal.tsx
- compilerOptions
- auth.session.hook.ts
- AppButton.tsx
- user.form.hook.ts
- AccountCard.tsx
- AccessBlocked.tsx
- Topbar.tsx
- MasterfileList.tsx
- components.json
- devDependencies
- ItemDetailPanel.tsx
- manage-staff/index.ts
- ShopTable.tsx
- CartPanel.tsx
- compilerOptions
- sync.store.ts
- Project map — domain to path
- AppShell.tsx
- useModal
- EntityFormModal
- SyncIssuesModal.tsx
- SectionCard.tsx
- ConfirmationModal.tsx
- typography.styles.ts
- Commands
- Tools
- Styling & Customization
- Commands
- Tools
- Styling & Customization
- pwa.hook.ts
- confirmation.hook.ts
- transaction.form.hook.ts
- Token Efficiency
- Popover
- TablePagination.tsx
- InfoHint.tsx
- SignInForm.tsx
- 3. The primitives — reuse before building
- eslint.config.js
- StatCard.tsx
- Customization & Theming
- Registry Authoring and Addresses
- shadcn/ui
- Customization & Theming
- Registry Authoring and Addresses
- shadcn/ui
- Architecture Navigation
- Componentization
- Component Structure → [composition.md](./rules/composition.md)
- format.utils.ts
- vercel.json
- Moti release checklist
- Naming & Pathing Conventions
- class-variance-authority
- SuccessModal.tsx
- Graphify Workflow
- scripts
- DateRangeFilter.tsx
- shadcn CLI Reference
- Customizing Components
- Icons
- shadcn CLI Reference
- ViewTabs.tsx
- Icons
- tsconfig.json
- vite-env.d.ts
- pwa-assets.config.ts
- TransactionTable.tsx
- TemporaryPasswordModal.tsx
- Component Composition
- avatar.tsx
- useAppMutation
- Chat & Messaging
- Component Composition
- permission.model.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 282 edges
2. `react` - 94 edges
3. `lucide-react` - 79 edges
4. `useActiveShop()` - 54 edges
5. `useModal()` - 41 edges
6. `AppButton()` - 39 edges
7. `usePermissions()` - 37 edges
8. `scopedKey()` - 35 edges
9. `useFilters()` - 32 edges
10. `Button()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Message surfaces use Bubble` --references--> `Badge()`  [INFERRED]
  .claude/skills/shadcn/rules/chat.md → src/components/ui/badge.tsx
- `Icons → [icons.md](./rules/icons.md)` --references--> `Button()`  [INFERRED]
  .agents/skills/shadcn/SKILL.md → src/components/ui/button.tsx
- `Icons → [icons.md](./rules/icons.md)` --references--> `Button()`  [INFERRED]
  .claude/skills/shadcn/SKILL.md → src/components/ui/button.tsx
- `Attachments use Attachment` --references--> `Item()`  [INFERRED]
  .claude/skills/shadcn/rules/chat.md → src/components/ui/item.tsx
- `System notes and dividers use Marker` --references--> `Separator()`  [INFERRED]
  .agents/skills/shadcn/rules/chat.md → src/components/ui/separator.tsx

## Import Cycles
- None detected.

## Communities (122 total, 4 thin omitted)

### Community 0 - "react"
Cohesion: 0.08
Nodes (41): react, react-aria-components, IProps, IProps, PasswordInput(), IProps, SearchInput(), IProps (+33 more)

### Community 1 - "UserTable.tsx"
Cohesion: 0.17
Nodes (18): statusOptions, column, IProps, StaffRole, userRoleLabels, UserStatus, userStatusLabels, userStatusOf() (+10 more)

### Community 2 - "cn"
Cohesion: 0.07
Nodes (45): DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink() (+37 more)

### Community 3 - "dropdown-menu.tsx"
Cohesion: 0.21
Nodes (16): Items always inside their Group component, Workflow, Items always inside their Group component, Workflow, DropdownMenuGroup(), DropdownMenuItem(), dropdownMenuItemVariants, DropdownMenuLabel() (+8 more)

### Community 4 - "ContentView.tsx"
Cohesion: 0.06
Nodes (48): CardSkeleton(), IProps, IProps, ListSkeleton(), IProps, bodies, IProps, PageSkeleton() (+40 more)

### Community 5 - "RankingPanel.tsx"
Cohesion: 0.10
Nodes (35): AnalyzerSummaryCards(), formulaHint(), AnalyzerToolbar(), metricOptions, periodOptions, RankingPanel(), directionOptions, RankingToolbar() (+27 more)

### Community 6 - "inventory.form.hook.ts"
Cohesion: 0.09
Nodes (32): ItemFormModal(), InventoryActions(), InventorySections(), InventorySection, inventorySectionLabels, InventorySort, InventoryTab, affectedKeys (+24 more)

### Community 7 - "Separator"
Cohesion: 0.13
Nodes (18): Chat & Messaging → [chat.md](./rules/chat.md), CLI, Critical Rules, Icons → [icons.md](./rules/icons.md), Styling & Tailwind → [styling.md](./rules/styling.md), Use Components, Not Custom Markup → [composition.md](./rules/composition.md), Chat & Messaging → [chat.md](./rules/chat.md), CLI (+10 more)

### Community 8 - "Button"
Cohesion: 0.14
Nodes (39): Buttons inside inputs use InputGroup + InputGroupAddon, Contents, Field validation and disabled states, FieldSet + FieldLegend for grouping related fields, Forms & Inputs, Forms use FieldGroup + Field, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2–7 choices) use ToggleGroup (+31 more)

### Community 9 - "cn.utils.ts"
Cohesion: 0.10
Nodes (19): Scrollable threads use MessageScroller, Scrollable threads use MessageScroller, IProps, IProps, BentoCell(), IProps, BentoGrid(), IProps (+11 more)

### Community 10 - "masterfile.form.hook.ts"
Cohesion: 0.08
Nodes (37): zod, IProps, MasterfileFormModal(), placeholders, emptyStates, IProps, MasterfileEntryPanel(), MasterfileList() (+29 more)

### Community 11 - "category.form.hook.ts"
Cohesion: 0.09
Nodes (32): BrandFormModal(), CategoryFormModal(), BrandListPanel(), CategoryListPanel(), affectedKeys, IBrandModal, ISaveBrand, useBrandFormModal() (+24 more)

### Community 12 - "select.tsx"
Cohesion: 0.13
Nodes (16): Select — multiple selection and object values (base only), Select — multiple selection and object values (base only), buttonVariants, LinkButton(), Calendar(), CalendarInner(), cellVariants, RangeCalendar() (+8 more)

### Community 13 - "shop.form.hook.ts"
Cohesion: 0.11
Nodes (24): ShopFormModal(), ShopActions(), ShopStatus, ISaveShop, settingsKeys, shopKeys, useShopForm(), useShopFormModal() (+16 more)

### Community 14 - "ShopSettingsCard.tsx"
Cohesion: 0.16
Nodes (17): InstallAppCard(), ISettingsLink, links, ShopSettingsCard(), toSettingsRequest(), useShopSettingsForm(), settingsActions, settingsForm (+9 more)

### Community 15 - "Composition: asChild (radix) vs render (base)"
Cohesion: 0.08
Nodes (34): Accordion, Base vs Radix, Button / trigger as non-button element (base only), Composition: asChild (radix) vs render (base), Contents, Select, Slider, ToggleGroup (+26 more)

### Community 16 - "InventoryTable.tsx"
Cohesion: 0.12
Nodes (25): IProps, StatusBadge(), IProps, ItemSummaryCard(), column, InventoryTable(), IProps, metaLine() (+17 more)

### Community 17 - "transaction.styles.ts"
Cohesion: 0.07
Nodes (44): CartBar(), IProps, IProps, IProps, IProps, cartBar, cartBarButton, cartBarCount (+36 more)

### Community 18 - "dashboard.list.hook.ts"
Cohesion: 0.12
Nodes (22): RecentMovementsCard(), useDisclosure(), settledSearchKey(), useSearch(), alertsPreviewSize, useOpenStockStatus(), useRecentMovements(), itemPath() (+14 more)

### Community 19 - "movement.form.hook.ts"
Cohesion: 0.13
Nodes (23): StockMovementModal(), movementModeReasons, movementModeTitles, movementModeTypes, MovementReason, movementReasonLabels, MovementTab, MovementType (+15 more)

### Community 20 - "VolumeRankingTable.tsx"
Cohesion: 0.10
Nodes (33): column, IProps, metaLine(), ReorderTable(), statusBadge(), column, countLabel(), IProps (+25 more)

### Community 21 - "AppSidebar.tsx"
Cohesion: 0.13
Nodes (23): SidebarGroupContent(), SidebarHeader(), SidebarMenu(), SidebarMenuBadge(), SidebarMenuItem(), sidebarBadgeLabel, sidebarBrandButton, sidebarBrandLogo (+15 more)

### Community 22 - "lucide-react"
Cohesion: 0.15
Nodes (20): lucide-react, AppAlert(), defaultIcon, IProps, InstallBanner(), IosInstallSteps(), OfflineBanner(), BalancePreview() (+12 more)

### Community 23 - "TabBar.tsx"
Cohesion: 0.29
Nodes (10): IBadge, IProps, tabbarBadge, tabbarBadgeLabel, tabbarIcon, tabbarItem, tabbarItemActive, tabbarLabel (+2 more)

### Community 24 - "user.services.ts"
Cohesion: 0.06
Nodes (34): A. Understand, then plan, C. House rules, Codebase Engineering, D. Comments — short, and one line, E. Do not overengineer, F. Confirm before important changes, G. Validate, H. After a successful change — mandatory close-out (+26 more)

### Community 25 - "App.tsx"
Cohesion: 0.16
Nodes (17): next-themes, sonner, App(), Topbar(), AppToaster(), Toaster(), useInstallCapture(), useAuthSession() (+9 more)

### Community 26 - "DataTable.tsx"
Cohesion: 0.12
Nodes (24): @tanstack/react-table, dataTableColumns(), dataTableFeatures, IDataTableColumn, IProps, dataTableCell, dataTableCellEnds, dataTableCellExpanded (+16 more)

### Community 27 - "StockSummaryCards.tsx"
Cohesion: 0.10
Nodes (29): 5. Data views — four states, always, LoadingBar(), StateBox(), DataTable(), StockAlertsCard(), IStatusTile, statusTiles, StockSummaryCards() (+21 more)

### Community 28 - "MovementTable.tsx"
Cohesion: 0.12
Nodes (24): IProps, IProps, column, IProps, MovementTable(), quantityText(), reasonBadge(), movementReasonTones (+16 more)

### Community 29 - "analyzer.list.hook.ts"
Cohesion: 0.24
Nodes (15): AnalyzerMetric, SortDirection, StockStatus, IToolbarFilters, IViewFilters, useAnalyzerPeriod(), IDateRange, IPeriodRequest (+7 more)

### Community 30 - "package.json"
Cohesion: 0.09
Nodes (23): name, private, type, version, clsx, eslint, @hookform/resolvers, ref_node_url (+15 more)

### Community 31 - "navigation.hook.ts"
Cohesion: 0.09
Nodes (34): react-router-dom, RouteRoot(), INavRoute, navigationRoutes, useActiveNavRoute(), useBackRoute(), useBreadcrumbTrail(), useHeaderBack() (+26 more)

### Community 32 - "EntityFormModal.tsx"
Cohesion: 0.12
Nodes (18): 7. Forms, react-hook-form, IProps, FormRoot(), IProps, FormSection(), IFieldConfig, IFieldSection (+10 more)

### Community 33 - "shop.list.hook.ts"
Cohesion: 0.14
Nodes (33): Decisions log, AnalyzerPanel(), InventoryToolbar(), pageSizes, ProductPanel(), useFilters(), usePagination(), useDebouncedSearch() (+25 more)

### Community 34 - "field.tsx"
Cohesion: 0.20
Nodes (10): IProps, FieldContent(), FieldDescription(), FieldError(), FieldLabel(), FieldSeparator(), FieldTitle(), fieldVariants (+2 more)

### Community 35 - "Roadmap"
Cohesion: 0.09
Nodes (21): Data model (V1), Moti V1 roadmap: multi-tenant, inventory only, Phase 0: Foundation, Phase 10: Transaction selling and final navigation, Phase 1: Multi-tenant auth and roles, Phase 2: Inventory catalog, Phase 3: Stock transactions, Phase 4: Dashboard and alerts (+13 more)

### Community 36 - "AppModal.tsx"
Cohesion: 0.20
Nodes (16): AppModal(), IProps, drawerBody, drawerCloseBar, drawerContent, drawerFooter, drawerHeaderRuled, modalBody (+8 more)

### Community 37 - "SegmentTabs.tsx"
Cohesion: 0.22
Nodes (15): TabsTrigger must be inside TabsList, TabsTrigger must be inside TabsList, IProps, ISegmentTab, SegmentTabs(), Tabs(), TabsContent(), TabsList() (+7 more)

### Community 38 - "movement.list.hook.ts"
Cohesion: 0.17
Nodes (16): MovementsPanel(), MovementToolbar(), reasonOptions, tabs, movementTabLabels, IToolbarFilters, ITypeFilters, useMovementDateRange() (+8 more)

### Community 39 - "pagination.hook.ts"
Cohesion: 0.24
Nodes (8): IPaginationFormValue, IPaginationRequest, Actions, defaultPagination, initialValues, selectPagination(), States, usePaginationStore

### Community 40 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, clsx, @hookform/resolvers, @internationalized/date, lucide-react, next-themes, react (+13 more)

### Community 41 - "FilterToolbar.tsx"
Cohesion: 0.10
Nodes (24): FilterToolbar(), IFilterControl, IProps, IProps, sortOptions, statusTabs, inventorySortLabels, inventoryTabLabels (+16 more)

### Community 42 - "reset.store.ts"
Cohesion: 0.17
Nodes (14): E. Auth, storage, realtime, State, rowExpansionPersistProps, useRowExpansion(), clearSessionData(), Actions, initialValues, selectCollapsingRow() (+6 more)

### Community 43 - "TransactionDetailModal.tsx"
Cohesion: 0.13
Nodes (18): TransactionLinesList(), summarySection, TransactionDetailModal(), voidSection, fields, VoidTransactionModal(), TransactionPanel(), TransactionSection (+10 more)

### Community 44 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 45 - "auth.session.hook.ts"
Cohesion: 0.14
Nodes (25): ref_react_dom_client, @tanstack/react-query, zustand, IOptions, queuedMessage, useNetwork(), useOwnQueue(), useSyncIssues() (+17 more)

### Community 46 - "AppButton.tsx"
Cohesion: 0.24
Nodes (9): AppButton(), IProps, IProps, QuantityStepper(), buttonTone, IButtonTone, stepperButton, stepperRoot (+1 more)

### Community 47 - "user.form.hook.ts"
Cohesion: 0.16
Nodes (18): TransactionHistoryPanel(), UserFormModal(), UserActions(), UsersPanel(), assignableRoles(), usePermissions(), useShopOptions(), useTransactionDetail() (+10 more)

### Community 48 - "AccountCard.tsx"
Cohesion: 0.15
Nodes (19): ref_hookform_resolvers_zod, SidebarUserMenu(), PasswordReminder(), AccountCard(), fields, emptyPassword, useChangePasswordForm(), changePasswordSchema (+11 more)

### Community 49 - "AccessBlocked.tsx"
Cohesion: 0.31
Nodes (7): AccessBlocked(), describeBlock(), IProps, useSignOut(), IAuthSession, IProfile, IProfileShop

### Community 50 - "Topbar.tsx"
Cohesion: 0.18
Nodes (18): AppSidebar(), ShopSwitcher(), StockAlertsButton(), TabContent(), selectActiveShopId(), useShopStore, toneSolid, topbarAction (+10 more)

### Community 51 - "MasterfileList.tsx"
Cohesion: 0.18
Nodes (14): IProps, RowActionMenu(), IProps, IRow, IRowAction, masterfileCount, masterfileList, masterfileMeta (+6 more)

### Community 52 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 53 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, shadcn, @tanstack/react-query-devtools (+10 more)

### Community 54 - "ItemDetailPanel.tsx"
Cohesion: 0.19
Nodes (14): IProps, detailRows(), ItemDetailPanel(), useInventoryItem(), detailLabel, detailValue, itemDetailStack, detailGrid (+6 more)

### Community 55 - "manage-staff/index.ts"
Cohesion: 0.21
Nodes (14): ref_npm_supabase_supabase_js_2, admin, assertCanManage(), corsHeaders, createStaff(), ICaller, internalError(), ITarget (+6 more)

### Community 56 - "ShopTable.tsx"
Cohesion: 0.21
Nodes (13): column, IProps, ShopTable(), staffLine(), shopStatusLabels, shopStatusOf(), shopStatusTones, shopCell (+5 more)

### Community 57 - "CartPanel.tsx"
Cohesion: 0.23
Nodes (14): CartLine(), CartTotal(), CartSheetModal(), CartContent(), CartPanel(), lineTotal(), useCart(), useCartSheet() (+6 more)

### Community 58 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 59 - "sync.store.ts"
Cohesion: 0.12
Nodes (21): ref_zustand_middleware, activeShopStorageKey, cartStorageKey, installDismissedStorageKey, syncStorageKey, themeStorageKey, DistributiveOmit, IQueuedWrite (+13 more)

### Community 60 - "Project map — domain to path"
Cohesion: 0.18
Nodes (10): Fourth slice: `analyzer` (Phase 5), Infrastructure, Masterfile: `category`, `brand`, `masterfile` (units + locations) (Phase 9), Project map — domain to path, Reference module: `inventory`, Second slice: `movement` (Phase 3), Sibling references (read-only, outside this repo), Third slice: `dashboard` (Phase 4) (+2 more)

### Community 61 - "AppShell.tsx"
Cohesion: 0.12
Nodes (17): AppShell(), IProps, SyncIssuesModal(), ErrorBoundary, IProps, IState, SidebarInset(), SidebarProvider() (+9 more)

### Community 62 - "useModal"
Cohesion: 0.19
Nodes (13): useModal(), useModalActions(), useBrandForm(), ConfirmKind, IConfirmRequest, IModalFormValue, IModalRequest, Actions (+5 more)

### Community 63 - "EntityFormModal"
Cohesion: 0.18
Nodes (10): CLAUDE.md — Moti, Code rules, Commands — yarn only, Completion checklist, Folder law — every file has exactly one home, Forms, Rules that hold everywhere, Skill router (+2 more)

### Community 64 - "SyncIssuesModal.tsx"
Cohesion: 0.24
Nodes (12): SyncStatusButton(), syncIssuesModalKey, syncButton, syncCount, syncCountFailed, syncError, syncIntro, syncLabel (+4 more)

### Community 65 - "SectionCard.tsx"
Cohesion: 0.27
Nodes (11): IProps, SectionCard(), CardAction(), sectionCardActions, sectionCardBody, sectionCardFill, sectionCardFlush, sectionCardFooter (+3 more)

### Community 66 - "ConfirmationModal.tsx"
Cohesion: 0.14
Nodes (20): AlertDialogAction(), AlertDialogCancel(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay(), AlertDialogTitle() (+12 more)

### Community 67 - "typography.styles.ts"
Cohesion: 0.13
Nodes (16): IProps, cardTitle, fieldError, fieldHint, fieldLabel, link, money, numeric (+8 more)

### Community 68 - "Commands"
Cohesion: 0.17
Nodes (12): `add` — Add components, `apply` — Apply a preset to an existing project, `build` — Build a custom registry, Commands, `diff` — Check for updates, `docs` — Get component documentation URLs, Dry-Run Mode, `info` — Project information (+4 more)

### Community 69 - "Tools"
Cohesion: 0.17
Nodes (11): Configuring Registries, Setup, `shadcn:get_add_command_for_items`, `shadcn:get_audit_checklist`, `shadcn:get_item_examples_from_registries`, `shadcn:get_project_registries`, `shadcn:list_items_in_registries`, shadcn MCP Server (+3 more)

### Community 70 - "Styling & Customization"
Cohesion: 0.17
Nodes (12): Built-in variants first, className for layout only, Contents, No manual dark: color overrides, No raw color values for status/state indicators, No space-x-* / space-y-*, Prefer size-* over w-* h-* when equal, Prefer truncate shorthand (+4 more)

### Community 71 - "Commands"
Cohesion: 0.17
Nodes (12): `add` — Add components, `apply` — Apply a preset to an existing project, `build` — Build a custom registry, Commands, `diff` — Check for updates, `docs` — Get component documentation URLs, Dry-Run Mode, `info` — Project information (+4 more)

### Community 72 - "Tools"
Cohesion: 0.17
Nodes (11): Configuring Registries, Setup, `shadcn:get_add_command_for_items`, `shadcn:get_audit_checklist`, `shadcn:get_item_examples_from_registries`, `shadcn:get_project_registries`, `shadcn:list_items_in_registries`, shadcn MCP Server (+3 more)

### Community 73 - "Styling & Customization"
Cohesion: 0.17
Nodes (12): Built-in variants first, className for layout only, Contents, No manual dark: color overrides, No raw color values for status/state indicators, No space-x-* / space-y-*, Prefer size-* over w-* h-* when equal, Prefer truncate shorthand (+4 more)

### Community 74 - "pwa.hook.ts"
Cohesion: 0.20
Nodes (11): ref_virtual_pwa_register_react, UpdatePrompt(), useAppUpdate(), IBeforeInstallPromptEvent, Actions, initialValues, States, usePwaStore (+3 more)

### Community 75 - "confirmation.hook.ts"
Cohesion: 0.33
Nodes (9): useConfirmation(), Actions, closedConfirm, initialValues, selectConfirm(), selectConfirmPhrase(), selectConfirmRunning(), States (+1 more)

### Community 76 - "transaction.form.hook.ts"
Cohesion: 0.11
Nodes (25): TransactionSuccessModal(), TransactionStatus, TransactionStatusTab, affectedKeys, ICreateTransaction, ITransactionSuccess, IVoidTransaction, useTransactionSuccess() (+17 more)

### Community 77 - "Token Efficiency"
Cohesion: 0.18
Nodes (10): 1. Size it before you read it, 2. Read regions, not files, 3. Always exclude the noise, 4. Batch independent calls, 5. Validate at the narrowest scope, 6. Do not re-read what you already know, 7. Write once, in the right shape, 8. Answer at one altitude (+2 more)

### Community 78 - "Popover"
Cohesion: 0.26
Nodes (13): Choosing between overlay components, No manual z-index on overlay components, Choosing between overlay components, No manual z-index on overlay components, AppTooltip(), IProps, AlertDialog(), Dialog() (+5 more)

### Community 79 - "TablePagination.tsx"
Cohesion: 0.09
Nodes (28): B. Nearest existing pattern — always copy, never invent, IProps, TablePagination(), IProps, TablePanel(), InventoryPanel(), IProps, ItemMovementsCard() (+20 more)

### Community 80 - "InfoHint.tsx"
Cohesion: 0.31
Nodes (9): IInfoHintItem, IProps, infoHintDialog, infoHintItem, infoHintList, infoHintPopover, infoHintTerm, infoHintText (+1 more)

### Community 81 - "SignInForm.tsx"
Cohesion: 0.16
Nodes (15): fields, SignInForm(), FormFieldGrid(), IProps, useSignInForm(), IProps, authBrand, authBrandLogo (+7 more)

### Community 82 - "3. The primitives — reuse before building"
Cohesion: 0.18
Nodes (10): 1. The library — shadcn/ui on React Aria, nothing else, 2. Tokens and styling — non-negotiable, 3. The primitives — reuse before building, 4. Page shell, 8. Mobile-first — Moti is a PWA, 9. Verify, UI & Design Conventions, IProps (+2 more)

### Community 83 - "eslint.config.js"
Cohesion: 0.20
Nodes (9): GENERATED, RETIRED_BASE_PATTERNS, RETIRED_BASES, ref_eslint_config, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+1 more)

### Community 84 - "StatCard.tsx"
Cohesion: 0.15
Nodes (21): Attachments use Attachment, IProps, StatCard(), Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter() (+13 more)

### Community 86 - "Customization & Theming"
Cohesion: 0.22
Nodes (9): Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates, Color Variables, Contents, Customization & Theming, Dark Mode (+1 more)

### Community 87 - "Registry Authoring and Addresses"
Cohesion: 0.22
Nodes (9): Address Schemes, Build and Verify, GitHub Registries, Include, Item Definitions, Mental Model, Registry Authoring and Addresses, Registry Dependencies (+1 more)

### Community 88 - "shadcn/ui"
Cohesion: 0.22
Nodes (9): Component Docs, Examples, and Usage, Current Project Context, Detailed References, Key Fields, Key Patterns, Principles, Quick Reference, shadcn/ui (+1 more)

### Community 90 - "Customization & Theming"
Cohesion: 0.14
Nodes (14): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates (+6 more)

### Community 91 - "Registry Authoring and Addresses"
Cohesion: 0.22
Nodes (9): Address Schemes, Build and Verify, GitHub Registries, Include, Item Definitions, Mental Model, Registry Authoring and Addresses, Registry Dependencies (+1 more)

### Community 92 - "shadcn/ui"
Cohesion: 0.22
Nodes (9): Component Docs, Examples, and Usage, Current Project Context, Detailed References, Key Fields, Key Patterns, Principles, Quick Reference, shadcn/ui (+1 more)

### Community 93 - "Architecture Navigation"
Cohesion: 0.25
Nodes (7): 1. Start with one command, always, 2. The layer flow — a feature is always these files, 3. Fallback — infer the path, 4. Progressive search ladder, 5. Entry points, 6. Impact check before editing shared code, Architecture Navigation

### Community 94 - "Componentization"
Cohesion: 0.20
Nodes (9): 1. Where each responsibility belongs, 2. The component tree, 3. The shadcn boundary, 4. Extract when, 5. Keep it inline when, 6. Guardrails on load-bearing files, 7. Splitting an existing large file, Componentization (+1 more)

### Community 95 - "Component Structure → [composition.md](./rules/composition.md)"
Cohesion: 0.27
Nodes (13): Card structure, Dialog, Sheet, and Drawer always need a Title, Component Structure → [composition.md](./rules/composition.md), Card structure, Dialog, Sheet, and Drawer always need a Title, Component Structure → [composition.md](./rules/composition.md), CardContent(), CardDescription() (+5 more)

### Community 96 - "format.utils.ts"
Cohesion: 0.16
Nodes (13): asChecked(), asList(), asText(), FormField(), countFormatter, dateFormatter, dateRangeFormatter, dateTimeFormatter (+5 more)

### Community 97 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 98 - "Moti release checklist"
Cohesion: 0.29
Nodes (6): 1. Tests pass locally first, 2. Production Supabase project, 3. Vercel, 4. Smoke test on production, 5. Later releases, Moti release checklist

### Community 99 - "Naming & Pathing Conventions"
Cohesion: 0.29
Nodes (6): Database naming (Supabase / Postgres), Do not, Names inside files, Naming & Pathing Conventions, Reuse before creating, Where a new file goes

### Community 100 - "class-variance-authority"
Cohesion: 0.26
Nodes (9): class-variance-authority, IProps, ISegmentedOption, SegmentedControl(), ToggleGroupContext, Toggle(), toggleVariants, segmentedControlItem (+1 more)

### Community 101 - "SuccessModal.tsx"
Cohesion: 0.25
Nodes (9): 6. Modals — one frame, never rebuilt, ConfirmationModal(), DetailModal(), IProps, SuccessModal(), successBadge, successBody, successText (+1 more)

### Community 102 - "Graphify Workflow"
Cohesion: 0.33
Nodes (5): Commands, Do not use it when, Graphify Workflow, The refresh is the user's to run, Use it when

### Community 103 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, generate-pwa-assets, lint, preview

### Community 104 - "DateRangeFilter.tsx"
Cohesion: 0.22
Nodes (10): @internationalized/date, IProps, tabs, TransactionHistoryToolbar(), useTransactionDateRange(), transactionTableKey, dateRangeDialog, dateRangePopover (+2 more)

### Community 105 - "shadcn CLI Reference"
Cohesion: 0.40
Nodes (5): Contents, Presets, shadcn CLI Reference, Switching Presets, Templates

### Community 106 - "Customizing Components"
Cohesion: 0.40
Nodes (5): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Customizing Components

### Community 107 - "Icons"
Cohesion: 0.40
Nodes (4): Icons, Icons in Button use data-icon attribute, No sizing classes on icons inside components, Pass icons as component objects, not string keys

### Community 108 - "shadcn CLI Reference"
Cohesion: 0.40
Nodes (5): Contents, Presets, shadcn CLI Reference, Switching Presets, Templates

### Community 109 - "ViewTabs.tsx"
Cohesion: 0.33
Nodes (9): IProps, IViewTab, IViewTabVariant, ViewTabs(), viewTabsBar, viewTabsContent, viewTabsList, viewTabsListInline (+1 more)

### Community 110 - "Icons"
Cohesion: 0.40
Nodes (4): Icons, Icons in Button use data-icon attribute, No sizing classes on icons inside components, Pass icons as component objects, not string keys

### Community 111 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 114 - "TransactionTable.tsx"
Cohesion: 0.20
Nodes (10): column, IProps, statusBadge(), TransactionTable(), tableCellNumeric, historyAmount, historyAmountStack, historyCell (+2 more)

### Community 115 - "TemporaryPasswordModal.tsx"
Cohesion: 0.29
Nodes (9): TemporaryPasswordModal(), useTemporaryPassword(), temporaryPasswordModalKey, passwordLabel, passwordNote, passwordPanel, passwordRow, passwordValue (+1 more)

### Community 116 - "Component Composition"
Cohesion: 0.20
Nodes (10): Avatar always needs AvatarFallback, Button has no isPending or isLoading prop, Callouts use Alert, Component Composition, Contents, Empty states use Empty component, Toast notifications follow the project base, Use existing components instead of custom markup (+2 more)

### Community 117 - "avatar.tsx"
Cohesion: 0.25
Nodes (7): AppAvatar(), IProps, AvatarBadge(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), ImageState

### Community 118 - "useAppMutation"
Cohesion: 0.36
Nodes (9): UserTable(), useConfirm(), useAppMutation(), capitalize(), useDeleteMasterfileEntry(), useMasterfileForm(), useShopSuspension(), useResetPassword() (+1 more)

### Community 119 - "Chat & Messaging"
Cohesion: 0.25
Nodes (8): Attachments use Attachment, Chat & Messaging, Contents, Escape hatch: the scroller hooks, Message rows use Message, Message surfaces use Bubble, Streaming, anchoring, and jump-to-latest are built in, System notes and dividers use Marker

### Community 120 - "Component Composition"
Cohesion: 0.29
Nodes (7): Button has no isPending or isLoading prop, Callouts use Alert, Component Composition, Contents, Empty states use Empty component, Toast notifications follow the project base, Use existing components instead of custom markup

### Community 121 - "permission.model.ts"
Cohesion: 0.50
Nodes (4): UserRole, derivePermissions(), IPermissionKey, IPermissions

## Knowledge Gaps
- **618 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+613 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 684 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `react`, `dropdown-menu.tsx`, `ContentView.tsx`, `RankingPanel.tsx`, `Separator`, `Button`, `cn.utils.ts`, `select.tsx`, `Composition: asChild (radix) vs render (base)`, `InventoryTable.tsx`, `AppSidebar.tsx`, `lucide-react`, `TabBar.tsx`, `DataTable.tsx`, `StockSummaryCards.tsx`, `MovementTable.tsx`, `EntityFormModal.tsx`, `shop.list.hook.ts`, `field.tsx`, `AppModal.tsx`, `SegmentTabs.tsx`, `FilterToolbar.tsx`, `AppButton.tsx`, `Topbar.tsx`, `MasterfileList.tsx`, `ItemDetailPanel.tsx`, `AppShell.tsx`, `SyncIssuesModal.tsx`, `SectionCard.tsx`, `ConfirmationModal.tsx`, `typography.styles.ts`, `Styling & Customization`, `Styling & Customization`, `Popover`, `TablePagination.tsx`, `InfoHint.tsx`, `SignInForm.tsx`, `3. The primitives — reuse before building`, `StatCard.tsx`, `Component Structure → [composition.md](./rules/composition.md)`, `format.utils.ts`, `class-variance-authority`, `SuccessModal.tsx`, `DateRangeFilter.tsx`, `ViewTabs.tsx`, `Component Composition`, `avatar.tsx`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `UserTable.tsx`, `cn`, `dropdown-menu.tsx`, `ContentView.tsx`, `inventory.form.hook.ts`, `Separator`, `cn.utils.ts`, `masterfile.form.hook.ts`, `category.form.hook.ts`, `select.tsx`, `shop.form.hook.ts`, `InventoryTable.tsx`, `dashboard.list.hook.ts`, `movement.form.hook.ts`, `VolumeRankingTable.tsx`, `lucide-react`, `TabBar.tsx`, `App.tsx`, `DataTable.tsx`, `StockSummaryCards.tsx`, `analyzer.list.hook.ts`, `package.json`, `navigation.hook.ts`, `EntityFormModal.tsx`, `shop.list.hook.ts`, `field.tsx`, `AppModal.tsx`, `SegmentTabs.tsx`, `movement.list.hook.ts`, `pagination.hook.ts`, `FilterToolbar.tsx`, `reset.store.ts`, `TransactionDetailModal.tsx`, `auth.session.hook.ts`, `AppButton.tsx`, `user.form.hook.ts`, `MasterfileList.tsx`, `ItemDetailPanel.tsx`, `AppShell.tsx`, `useModal`, `SectionCard.tsx`, `ConfirmationModal.tsx`, `typography.styles.ts`, `pwa.hook.ts`, `transaction.form.hook.ts`, `Popover`, `TablePagination.tsx`, `SignInForm.tsx`, `3. The primitives — reuse before building`, `StatCard.tsx`, `Component Structure → [composition.md](./rules/composition.md)`, `class-variance-authority`, `SuccessModal.tsx`, `ViewTabs.tsx`, `avatar.tsx`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `react`, `UserTable.tsx`, `cn`, `dropdown-menu.tsx`, `ContentView.tsx`, `RankingPanel.tsx`, `inventory.form.hook.ts`, `cn.utils.ts`, `masterfile.form.hook.ts`, `category.form.hook.ts`, `select.tsx`, `shop.form.hook.ts`, `ShopSettingsCard.tsx`, `InventoryTable.tsx`, `transaction.styles.ts`, `dashboard.list.hook.ts`, `AppSidebar.tsx`, `App.tsx`, `StockSummaryCards.tsx`, `MovementTable.tsx`, `package.json`, `navigation.hook.ts`, `shop.list.hook.ts`, `movement.list.hook.ts`, `FilterToolbar.tsx`, `TransactionDetailModal.tsx`, `AppButton.tsx`, `user.form.hook.ts`, `AccountCard.tsx`, `AccessBlocked.tsx`, `Topbar.tsx`, `MasterfileList.tsx`, `ItemDetailPanel.tsx`, `ShopTable.tsx`, `CartPanel.tsx`, `SyncIssuesModal.tsx`, `ConfirmationModal.tsx`, `pwa.hook.ts`, `TablePagination.tsx`, `InfoHint.tsx`, `SignInForm.tsx`, `SuccessModal.tsx`, `DateRangeFilter.tsx`, `TemporaryPasswordModal.tsx`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `cn()` (e.g. with `Use cn() for conditional classes` and `Styling & Tailwind → [styling.md](./rules/styling.md)`) actually correct?**
  _`cn()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `useActiveShop()` (e.g. with `Decisions log` and `selectActiveShopId()`) actually correct?**
  _`useActiveShop()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _618 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07756813417190776 - nodes in this community are weakly interconnected._