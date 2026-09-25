# Graph Report - Moti  (2026-09-25)

## Corpus Check
- 384 files · ~192,070 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .example 1, .ico 1)

## Summary
- 2222 nodes · 6226 edges · 114 communities (110 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 393 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b1dd6fc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- FormField.tsx
- user.form.hook.ts
- cn
- Component Structure → [composition.md](./rules/composition.md)
- PageSkeleton.tsx
- RankingPanel.tsx
- inventory.list.hook.ts
- Separator
- Component Selection
- react
- masterfile.form.hook.ts
- inventory.form.hook.ts
- Button
- shop.list.hook.ts
- ShopSettingsCard.tsx
- Composition: asChild (radix) vs render (base)
- InventoryTable.tsx
- InventoryItemView.tsx
- dashboard.list.hook.ts
- movement.form.hook.ts
- VolumeRankingTable.tsx
- AppSidebar.tsx
- lucide-react
- TabBar.tsx
- runWrite
- App.tsx
- DataTable.tsx
- StockAlertTable.tsx
- MovementTable.tsx
- analyzer.list.hook.ts
- package.json
- react-router-dom
- ContentView.tsx
- table.keys.ts
- field.tsx
- Roadmap
- AppModal.tsx
- SegmentTabs.tsx
- movement.list.hook.ts
- usePagination
- dependencies
- FilterToolbar.tsx
- reset.store.ts
- AppAlert.tsx
- compilerOptions
- auth.session.hook.ts
- AppButton.tsx
- category.form.hook.ts
- SignInForm.tsx
- route.guard.tsx
- Topbar.tsx
- MasterfileList.tsx
- components.json
- devDependencies
- DetailModal.tsx
- manage-staff/index.ts
- ShopTable.tsx
- navigation.hook.ts
- compilerOptions
- pwa.store.ts
- useAppMutation
- AppLayout.tsx
- useModal
- CLAUDE.md — Moti
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
- FormSection.tsx
- confirmation.hook.ts
- sync.store.ts
- Token Efficiency
- AppShell.tsx
- TablePagination.tsx
- InfoHint.tsx
- auth.styles.ts
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
- PWA Conventions
- format.utils.ts
- vercel.json
- Moti release checklist
- Naming & Pathing Conventions
- SegmentedControl.tsx
- SuccessModal.tsx
- Graphify Workflow
- scripts
- StatusBadge.tsx
- shadcn CLI Reference
- Customizing Components
- Icons
- shadcn CLI Reference
- Customizing Components
- Icons
- tsconfig.json
- vite-env.d.ts
- pwa-assets.config.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 284 edges
2. `react` - 92 edges
3. `lucide-react` - 71 edges
4. `useActiveShop()` - 48 edges
5. `useModal()` - 38 edges
6. `AppButton()` - 32 edges
7. `Button()` - 31 edges
8. `usePermissions()` - 31 edges
9. `scopedKey()` - 31 edges
10. `class-variance-authority` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Forms` --references--> `EntityFormModal()`  [INFERRED]
  CLAUDE.md → src/components/common/form/EntityFormModal.tsx
- `Icons → [icons.md](./rules/icons.md)` --references--> `Button()`  [INFERRED]
  .agents/skills/shadcn/SKILL.md → src/components/ui/button.tsx
- `Icons → [icons.md](./rules/icons.md)` --references--> `Button()`  [INFERRED]
  .claude/skills/shadcn/SKILL.md → src/components/ui/button.tsx
- `Scrollable threads use MessageScroller` --references--> `ScrollArea()`  [INFERRED]
  .agents/skills/shadcn/rules/chat.md → src/components/ui/scroll-area.tsx
- `Scrollable threads use MessageScroller` --references--> `ScrollArea()`  [INFERRED]
  .claude/skills/shadcn/rules/chat.md → src/components/ui/scroll-area.tsx

## Import Cycles
- None detected.

## Communities (114 total, 4 thin omitted)

### Community 0 - "FormField.tsx"
Cohesion: 0.06
Nodes (58): 7. Forms, EntityFormModal(), IProps, asChecked(), asList(), asText(), FormField(), IProps (+50 more)

### Community 1 - "user.form.hook.ts"
Cohesion: 0.07
Nodes (53): IFilterControl, ShopSwitcher(), TemporaryPasswordModal(), UserFormModal(), UserActions(), statusOptions, UsersPanel(), column (+45 more)

### Community 2 - "cn"
Cohesion: 0.06
Nodes (58): AlertDialogAction(), AlertDialogCancel(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay(), AlertDialogTitle() (+50 more)

### Community 3 - "Component Structure → [composition.md](./rules/composition.md)"
Cohesion: 0.07
Nodes (54): Avatar always needs AvatarFallback, Button has no isPending or isLoading prop, Callouts use Alert, Card structure, Component Composition, Contents, Dialog, Sheet, and Drawer always need a Title, Empty states use Empty component (+46 more)

### Community 4 - "PageSkeleton.tsx"
Cohesion: 0.08
Nodes (37): CardSkeleton(), IProps, IProps, ListSkeleton(), IProps, LoadingBar(), bodies, IProps (+29 more)

### Community 5 - "RankingPanel.tsx"
Cohesion: 0.08
Nodes (38): AnalyzerSummaryCards(), formulaHint(), AnalyzerPanel(), AnalyzerToolbar(), metricOptions, periodOptions, RankingPanel(), directionOptions (+30 more)

### Community 6 - "inventory.list.hook.ts"
Cohesion: 0.09
Nodes (33): InventoryPanel(), InventorySections(), InventoryToolbar(), IProps, sortOptions, statusTabs, InventorySection, inventorySectionLabels (+25 more)

### Community 7 - "Separator"
Cohesion: 0.06
Nodes (40): Attachments use Attachment, Chat & Messaging, Contents, Escape hatch: the scroller hooks, Message rows use Message, Message surfaces use Bubble, Scrollable threads use MessageScroller, Streaming, anchoring, and jump-to-latest are built in (+32 more)

### Community 8 - "Component Selection"
Cohesion: 0.12
Nodes (38): Choosing between overlay components, Buttons inside inputs use InputGroup + InputGroupAddon, Contents, Field validation and disabled states, Forms & Inputs, Forms use FieldGroup + Field, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2–7 choices) use ToggleGroup (+30 more)

### Community 9 - "react"
Cohesion: 0.08
Nodes (28): react, IProps, IProps, AppAvatar(), IProps, BentoCell(), IProps, BentoGrid() (+20 more)

### Community 10 - "masterfile.form.hook.ts"
Cohesion: 0.11
Nodes (29): IProps, MasterfileFormModal(), placeholders, emptyStates, IProps, MasterfileEntryPanel(), MasterfilePanel(), MasterfileKind (+21 more)

### Community 11 - "inventory.form.hook.ts"
Cohesion: 0.12
Nodes (29): ref_hookform_resolvers_zod, InventoryActions(), BrandListPanel(), CategoryListPanel(), MasterfileList(), affectedKeys, IBrandModal, ISaveBrand (+21 more)

### Community 12 - "Button"
Cohesion: 0.10
Nodes (26): class-variance-authority, @internationalized/date, react-aria-components, IProps, Button(), buttonVariants, LinkButton(), Calendar() (+18 more)

### Community 13 - "shop.list.hook.ts"
Cohesion: 0.12
Nodes (26): ShopFormModal(), ShopActions(), ShopStatus, ISaveShop, settingsKeys, shopKeys, toSettingsRequest(), useShopForm() (+18 more)

### Community 14 - "ShopSettingsCard.tsx"
Cohesion: 0.12
Nodes (24): FormFieldGrid(), IProps, FormRoot(), IProps, AccountCard(), fields, InstallAppCard(), ISettingsLink (+16 more)

### Community 15 - "Composition: asChild (radix) vs render (base)"
Cohesion: 0.09
Nodes (28): Accordion, Base vs Radix, Button / trigger as non-button element (base only), Composition: asChild (radix) vs render (base), Contents, Select, Select — multiple selection and object values (base only), Slider (+20 more)

### Community 16 - "InventoryTable.tsx"
Cohesion: 0.12
Nodes (26): IProps, ItemSummaryCard(), column, InventoryTable(), IProps, metaLine(), IProps, StockActions() (+18 more)

### Community 17 - "InventoryItemView.tsx"
Cohesion: 0.14
Nodes (17): Masterfile: `category`, `brand`, `masterfile` (units + locations) (Phase 9), zod, BrandFormModal(), CategoryFormModal(), ItemFormModal(), StockMovementModal(), useBrandForm(), useCategoryForm() (+9 more)

### Community 18 - "dashboard.list.hook.ts"
Cohesion: 0.09
Nodes (22): @supabase/supabase-js, alertsPreviewSize, useRecentMovements(), useStockSummary(), brandFormModalKey, categoryFormModalKey, itemFormModalKey, masterfileFormModalKey (+14 more)

### Community 19 - "movement.form.hook.ts"
Cohesion: 0.13
Nodes (22): movementModeReasons, movementModeTitles, movementModeTypes, MovementReason, movementReasonLabels, MovementTab, MovementType, StockMovementMode (+14 more)

### Community 20 - "VolumeRankingTable.tsx"
Cohesion: 0.15
Nodes (25): column, IProps, metaLine(), ReorderTable(), statusBadge(), column, countLabel(), IProps (+17 more)

### Community 21 - "AppSidebar.tsx"
Cohesion: 0.13
Nodes (23): SidebarGroup(), SidebarGroupLabel(), SidebarMenu(), SidebarMenuBadge(), SidebarMenuItem(), sidebarBadgeLabel, sidebarBrandButton, sidebarBrandLogo (+15 more)

### Community 22 - "lucide-react"
Cohesion: 0.15
Nodes (18): lucide-react, ref_virtual_pwa_register_react, InstallBanner(), IosInstallSteps(), OfflineBanner(), UpdatePrompt(), InstallBody(), useAppUpdate() (+10 more)

### Community 23 - "TabBar.tsx"
Cohesion: 0.15
Nodes (22): AppSidebar(), IBadge, IProps, TabContent(), TabBarMoreModal(), tabBarMoreModalKey, toneChip, toneSolid (+14 more)

### Community 24 - "runWrite"
Cohesion: 0.10
Nodes (23): A. Understand, then plan, C. House rules, Codebase Engineering, D. Comments — short, and one line, E. Do not overengineer, F. Confirm before important changes, G. Validate, H. After a successful change — mandatory close-out (+15 more)

### Community 25 - "App.tsx"
Cohesion: 0.14
Nodes (19): next-themes, ref_react_dom_client, sonner, @tanstack/react-query-devtools, App(), Topbar(), AppToaster(), Toaster() (+11 more)

### Community 26 - "DataTable.tsx"
Cohesion: 0.14
Nodes (22): @tanstack/react-table, dataTableFeatures, IDataTableColumn, IProps, dataTableCell, dataTableCellEnds, dataTableCellExpanded, dataTableGrid (+14 more)

### Community 27 - "StockAlertTable.tsx"
Cohesion: 0.14
Nodes (18): StockAlertsCard(), StockSummaryCards(), DashboardPanel(), column, IProps, metaLine(), StockAlertTable(), alertCell (+10 more)

### Community 28 - "MovementTable.tsx"
Cohesion: 0.13
Nodes (22): BalancePreview(), IProps, column, IProps, MovementTable(), quantityText(), reasonBadge(), movementReasonTones (+14 more)

### Community 29 - "analyzer.list.hook.ts"
Cohesion: 0.19
Nodes (19): AnalyzerMetric, SortDirection, StockStatus, IToolbarFilters, IViewFilters, useAnalyzerPeriod(), usePeriodSummary(), useReorderItems() (+11 more)

### Community 30 - "package.json"
Cohesion: 0.09
Nodes (22): name, private, type, version, clsx, eslint, @hookform/resolvers, ref_node_url (+14 more)

### Community 31 - "react-router-dom"
Cohesion: 0.12
Nodes (17): react-router-dom, RouteRoot(), AuthLayout(), derivePermissions(), IPermissionKey, IHeaderBack, IRoute, PageSkeletonVariant (+9 more)

### Community 32 - "ContentView.tsx"
Cohesion: 0.14
Nodes (18): ContentView(), IBackLink, IProps, CardTone, ViewLayout, ViewSurface, ComingSoonView(), noteOf() (+10 more)

### Community 33 - "table.keys.ts"
Cohesion: 0.13
Nodes (19): Decisions log, B. Nearest existing pattern — always copy, never invent, FilterToolbar(), TablePagination(), TablePanel(), InfoHint(), RecentMovementsCard(), ShopsPanel() (+11 more)

### Community 34 - "field.tsx"
Cohesion: 0.16
Nodes (18): FieldSet + FieldLegend for grouping related fields, Forms & Inputs → [forms.md](./rules/forms.md), FieldSet + FieldLegend for grouping related fields, Forms & Inputs → [forms.md](./rules/forms.md), IProps, Field(), FieldContent(), FieldDescription() (+10 more)

### Community 35 - "Roadmap"
Cohesion: 0.09
Nodes (21): Data model (V1), Moti V1 roadmap: multi-tenant, inventory only, Phase 0: Foundation, Phase 10: Transaction ordering and final navigation, Phase 1: Multi-tenant auth and roles, Phase 2: Inventory catalog, Phase 3: Stock transactions, Phase 4: Dashboard and alerts (+13 more)

### Community 36 - "AppModal.tsx"
Cohesion: 0.15
Nodes (20): 3. The shadcn boundary, TextInput(), AppModal(), IProps, drawerBody, drawerCloseBar, drawerContent, drawerFooter (+12 more)

### Community 37 - "SegmentTabs.tsx"
Cohesion: 0.16
Nodes (18): IProps, ISegmentTab, SegmentTabs(), IProps, IViewTab, IViewTabVariant, ViewTabs(), TabsContent() (+10 more)

### Community 38 - "movement.list.hook.ts"
Cohesion: 0.16
Nodes (18): IProps, ItemMovementsCard(), MovementsPanel(), MovementToolbar(), reasonOptions, tabs, movementTabLabels, IToolbarFilters (+10 more)

### Community 39 - "usePagination"
Cohesion: 0.17
Nodes (16): usePagination(), settledSearchKey(), useDebouncedSearch(), useSearch(), useOpenStockStatus(), IPaginationFormValue, IPaginationRequest, IPaginationResponse (+8 more)

### Community 40 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, clsx, @hookform/resolvers, @internationalized/date, lucide-react, next-themes, react (+13 more)

### Community 41 - "FilterToolbar.tsx"
Cohesion: 0.17
Nodes (16): IProps, useFilters(), hasActiveFilter(), IFilterValue, IFilterValues, Actions, emptyFilters, initialValues (+8 more)

### Community 42 - "reset.store.ts"
Cohesion: 0.14
Nodes (16): PasswordInput(), useDisclosure(), rowExpansionPersistProps, useRowExpansion(), Actions, initialValues, selectCollapsingRow(), selectExpandedRow() (+8 more)

### Community 43 - "AppAlert.tsx"
Cohesion: 0.17
Nodes (14): AppAlert(), defaultIcon, IProps, IProps, HomeWelcome(), PasswordReminder(), HomeView(), selectMustChangePassword() (+6 more)

### Community 44 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 45 - "auth.session.hook.ts"
Cohesion: 0.22
Nodes (16): zustand, useOwnQueue(), useSyncIssues(), useSyncStatus(), signOutAnywhere(), useLiveRefresh(), authMeKey, Actions (+8 more)

### Community 46 - "AppButton.tsx"
Cohesion: 0.18
Nodes (14): 5. Data views — four states, always, AppButton(), IProps, SyncIssuesModal(), ErrorState(), StateBox(), IStatusTile, statusTiles (+6 more)

### Community 47 - "category.form.hook.ts"
Cohesion: 0.15
Nodes (13): react-hook-form, @tanstack/react-query, IOptions, queuedMessage, affectedKeys, emptyCategory, ICategoryModal, ISaveCategory (+5 more)

### Community 48 - "SignInForm.tsx"
Cohesion: 0.19
Nodes (12): fields, SignInForm(), emptyPassword, useSignInForm(), changePasswordSchema, IChangePasswordRequest, ISignInRequest, signInSchema (+4 more)

### Community 49 - "route.guard.tsx"
Cohesion: 0.19
Nodes (15): AccessBlocked(), describeBlock(), IProps, SidebarUserMenu(), useMe(), useSignOut(), ProtectedRoute(), PublicRoute() (+7 more)

### Community 50 - "Topbar.tsx"
Cohesion: 0.19
Nodes (16): StockAlertsButton(), SyncStatusButton(), StockAlertsModal(), alertTone(), useStockAlerts(), useStockAlertsModal(), topbarAction, topbarAlertsButton (+8 more)

### Community 51 - "MasterfileList.tsx"
Cohesion: 0.18
Nodes (14): IProps, RowActionMenu(), IProps, IRow, IRowAction, masterfileCount, masterfileList, masterfileMeta (+6 more)

### Community 52 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 53 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, shadcn, @tanstack/react-query-devtools (+10 more)

### Community 54 - "DetailModal.tsx"
Cohesion: 0.18
Nodes (14): 6. Modals — one frame, never rebuilt, ConfirmationModal(), DetailModal(), IProps, SuccessModal(), IDetailItem, IDetailSection, ModalSize (+6 more)

### Community 55 - "manage-staff/index.ts"
Cohesion: 0.21
Nodes (14): ref_npm_supabase_supabase_js_2, admin, assertCanManage(), corsHeaders, createStaff(), ICaller, internalError(), ITarget (+6 more)

### Community 56 - "ShopTable.tsx"
Cohesion: 0.19
Nodes (14): column, IProps, ShopTable(), staffLine(), shopStatusLabels, shopStatusOf(), shopStatusTones, shopCell (+6 more)

### Community 57 - "navigation.hook.ts"
Cohesion: 0.21
Nodes (14): INavRoute, navigationRoutes, useActiveNavRoute(), useBackRoute(), useBreadcrumbTrail(), useHeaderBack(), useNavigationGroups(), useNavigationMenu() (+6 more)

### Community 58 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 59 - "pwa.store.ts"
Cohesion: 0.16
Nodes (12): ref_zustand_middleware, activeShopStorageKey, installDismissedStorageKey, syncStorageKey, themeStorageKey, IBeforeInstallPromptEvent, Actions, initialValues (+4 more)

### Community 60 - "useAppMutation"
Cohesion: 0.17
Nodes (14): Fourth slice: `analyzer` (Phase 5), Infrastructure, Project map — domain to path, Reference module: `inventory`, Second slice: `movement` (Phase 3), Sibling references (read-only, outside this repo), Third slice: `dashboard` (Phase 4), UserTable() (+6 more)

### Community 61 - "AppLayout.tsx"
Cohesion: 0.18
Nodes (10): ErrorBoundary, IProps, IState, useNetwork(), useActivePage(), usePreloadPages(), useRouteAllowed(), useScrollReset() (+2 more)

### Community 62 - "useModal"
Cohesion: 0.23
Nodes (11): useModal(), useModalActions(), ConfirmKind, IModalFormValue, IModalRequest, Actions, closedModal, initialValues (+3 more)

### Community 63 - "CLAUDE.md — Moti"
Cohesion: 0.14
Nodes (13): CLAUDE.md — Moti, Code rules, Commands — yarn only, Completion checklist, Folder law — every file has exactly one home, Forms, Rules that hold everywhere, Skill router (+5 more)

### Community 64 - "SyncIssuesModal.tsx"
Cohesion: 0.26
Nodes (11): syncIssuesModalKey, syncButton, syncCount, syncCountFailed, syncError, syncIntro, syncLabel, syncList (+3 more)

### Community 65 - "SectionCard.tsx"
Cohesion: 0.27
Nodes (11): IProps, SectionCard(), CardAction(), sectionCardActions, sectionCardBody, sectionCardFill, sectionCardFlush, sectionCardFooter (+3 more)

### Community 66 - "ConfirmationModal.tsx"
Cohesion: 0.29
Nodes (11): confirmBody, confirmClose, confirmCloseLabel, confirmDescription, confirmFooter, confirmItem, confirmLead, confirmLeadText (+3 more)

### Community 67 - "typography.styles.ts"
Cohesion: 0.15
Nodes (12): cardTitle, detailLabel, detailValue, fieldError, fieldHint, fieldLabel, link, money (+4 more)

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

### Community 74 - "FormSection.tsx"
Cohesion: 0.21
Nodes (10): FormSection(), IProps, sectionTitle, formFieldFull, formFieldGrid, formFieldHalf, formSectionDescription, formSectionHeader (+2 more)

### Community 75 - "confirmation.hook.ts"
Cohesion: 0.29
Nodes (10): useConfirmation(), IConfirmRequest, Actions, closedConfirm, initialValues, selectConfirm(), selectConfirmPhrase(), selectConfirmRunning() (+2 more)

### Community 76 - "sync.store.ts"
Cohesion: 0.26
Nodes (9): emptyMovement(), DistributiveOmit, IMutationResult, IQueuedWrite, IQueuedWriteInput, Actions, initialValues, States (+1 more)

### Community 77 - "Token Efficiency"
Cohesion: 0.18
Nodes (10): 1. Size it before you read it, 2. Read regions, not files, 3. Always exclude the noise, 4. Batch independent calls, 5. Validate at the narrowest scope, 6. Do not re-read what you already know, 7. Write once, in the right shape, 8. Answer at one altitude (+2 more)

### Community 78 - "AppShell.tsx"
Cohesion: 0.25
Nodes (9): AppShell(), IProps, SidebarInset(), SidebarProvider(), appShellContent, appShellContentInner, appShellGutterBleed, appShellInset (+1 more)

### Community 79 - "TablePagination.tsx"
Cohesion: 0.31
Nodes (9): IProps, paginationControls, paginationRoot, paginationSizeGroup, paginationSizeLabel, paginationSizeTrigger, paginationStep, paginationStepDisabled (+1 more)

### Community 80 - "InfoHint.tsx"
Cohesion: 0.31
Nodes (9): IInfoHintItem, IProps, infoHintDialog, infoHintItem, infoHintList, infoHintPopover, infoHintTerm, infoHintText (+1 more)

### Community 81 - "auth.styles.ts"
Cohesion: 0.27
Nodes (9): IProps, authBrand, authBrandLogo, authBrandName, authColumn, authForm, authHint, authScreen (+1 more)

### Community 82 - "3. The primitives — reuse before building"
Cohesion: 0.22
Nodes (9): 1. The library — shadcn/ui on React Aria, nothing else, 2. Tokens and styling — non-negotiable, 3. The primitives — reuse before building, 4. Page shell, 8. Mobile-first — Moti is a PWA, 9. Verify, UI & Design Conventions, TextArea() (+1 more)

### Community 83 - "eslint.config.js"
Cohesion: 0.20
Nodes (9): GENERATED, RETIRED_BASE_PATTERNS, RETIRED_BASES, ref_eslint_config, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+1 more)

### Community 84 - "StatCard.tsx"
Cohesion: 0.42
Nodes (8): IProps, StatCard(), statCardIcon, statCardLabel, statCardRoot, statCardTrailing, statCardValue, statCardValueLoading

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
Cohesion: 0.22
Nodes (9): Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates, Color Variables, Contents, Customization & Theming, Dark Mode (+1 more)

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
Cohesion: 0.25
Nodes (7): 1. Where each responsibility belongs, 2. The component tree, 4. Extract when, 5. Keep it inline when, 6. Guardrails on load-bearing files, 7. Splitting an existing large file, Componentization

### Community 95 - "PWA Conventions"
Cohesion: 0.25
Nodes (7): 1. vite-plugin-pwa, 2. Caching — what the service worker may hold, 3. index.html, 4. Online / offline state, 5. Install and update, 6. Verify, PWA Conventions

### Community 96 - "format.utils.ts"
Cohesion: 0.25
Nodes (6): countFormatter, dateFormatter, dateRangeFormatter, dateTimeFormatter, pesoFormatter, shortDateFormatter

### Community 97 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 98 - "Moti release checklist"
Cohesion: 0.29
Nodes (6): 1. Tests pass locally first, 2. Production Supabase project, 3. Vercel, 4. Smoke test on production, 5. Later releases, Moti release checklist

### Community 99 - "Naming & Pathing Conventions"
Cohesion: 0.29
Nodes (6): Database naming (Supabase / Postgres), Do not, Names inside files, Naming & Pathing Conventions, Reuse before creating, Where a new file goes

### Community 100 - "SegmentedControl.tsx"
Cohesion: 0.48
Nodes (5): IProps, ISegmentedOption, SegmentedControl(), segmentedControlItem, segmentedControlRoot

### Community 101 - "SuccessModal.tsx"
Cohesion: 0.48
Nodes (5): IProps, successBadge, successBody, successText, successTitle

### Community 102 - "Graphify Workflow"
Cohesion: 0.33
Nodes (5): Commands, Do not use it when, Graphify Workflow, The refresh is the user's to run, Use it when

### Community 103 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, generate-pwa-assets, lint, preview

### Community 104 - "StatusBadge.tsx"
Cohesion: 0.47
Nodes (4): IProps, StatusBadge(), statusBadgeDot, statusBadgeRoot

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

### Community 109 - "Customizing Components"
Cohesion: 0.40
Nodes (5): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Customizing Components

### Community 110 - "Icons"
Cohesion: 0.40
Nodes (4): Icons, Icons in Button use data-icon attribute, No sizing classes on icons inside components, Pass icons as component objects, not string keys

### Community 111 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

## Knowledge Gaps
- **596 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+591 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 659 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `FormField.tsx`, `user.form.hook.ts`, `cn`, `Component Structure → [composition.md](./rules/composition.md)`, `PageSkeleton.tsx`, `inventory.list.hook.ts`, `Separator`, `masterfile.form.hook.ts`, `inventory.form.hook.ts`, `Button`, `shop.list.hook.ts`, `ShopSettingsCard.tsx`, `Composition: asChild (radix) vs render (base)`, `InventoryTable.tsx`, `movement.form.hook.ts`, `lucide-react`, `TabBar.tsx`, `App.tsx`, `DataTable.tsx`, `analyzer.list.hook.ts`, `package.json`, `ContentView.tsx`, `field.tsx`, `AppModal.tsx`, `SegmentTabs.tsx`, `movement.list.hook.ts`, `usePagination`, `FilterToolbar.tsx`, `reset.store.ts`, `AppAlert.tsx`, `auth.session.hook.ts`, `AppButton.tsx`, `category.form.hook.ts`, `MasterfileList.tsx`, `DetailModal.tsx`, `navigation.hook.ts`, `AppLayout.tsx`, `useModal`, `SectionCard.tsx`, `FormSection.tsx`, `AppShell.tsx`, `auth.styles.ts`, `StatCard.tsx`, `SegmentedControl.tsx`, `SuccessModal.tsx`, `StatusBadge.tsx`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `FormField.tsx`, `Component Structure → [composition.md](./rules/composition.md)`, `PageSkeleton.tsx`, `RankingPanel.tsx`, `Separator`, `Component Selection`, `react`, `Button`, `ShopSettingsCard.tsx`, `Composition: asChild (radix) vs render (base)`, `VolumeRankingTable.tsx`, `AppSidebar.tsx`, `lucide-react`, `TabBar.tsx`, `DataTable.tsx`, `MovementTable.tsx`, `ContentView.tsx`, `table.keys.ts`, `field.tsx`, `AppModal.tsx`, `SegmentTabs.tsx`, `FilterToolbar.tsx`, `AppAlert.tsx`, `AppButton.tsx`, `Topbar.tsx`, `MasterfileList.tsx`, `DetailModal.tsx`, `SyncIssuesModal.tsx`, `SectionCard.tsx`, `Styling & Customization`, `Styling & Customization`, `FormSection.tsx`, `AppShell.tsx`, `TablePagination.tsx`, `InfoHint.tsx`, `auth.styles.ts`, `3. The primitives — reuse before building`, `StatCard.tsx`, `SegmentedControl.tsx`, `StatusBadge.tsx`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `FormField.tsx`, `user.form.hook.ts`, `cn`, `Component Structure → [composition.md](./rules/composition.md)`, `RankingPanel.tsx`, `inventory.list.hook.ts`, `Component Selection`, `react`, `masterfile.form.hook.ts`, `inventory.form.hook.ts`, `Button`, `ShopSettingsCard.tsx`, `InventoryTable.tsx`, `AppSidebar.tsx`, `TabBar.tsx`, `App.tsx`, `StockAlertTable.tsx`, `MovementTable.tsx`, `package.json`, `react-router-dom`, `ContentView.tsx`, `table.keys.ts`, `movement.list.hook.ts`, `FilterToolbar.tsx`, `AppAlert.tsx`, `AppButton.tsx`, `route.guard.tsx`, `Topbar.tsx`, `MasterfileList.tsx`, `ShopTable.tsx`, `navigation.hook.ts`, `SyncIssuesModal.tsx`, `ConfirmationModal.tsx`, `InfoHint.tsx`, `auth.styles.ts`, `SuccessModal.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `cn()` (e.g. with `Use cn() for conditional classes` and `Styling & Tailwind → [styling.md](./rules/styling.md)`) actually correct?**
  _`cn()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `useActiveShop()` (e.g. with `Decisions log` and `selectActiveShopId()`) actually correct?**
  _`useActiveShop()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _596 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `FormField.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._