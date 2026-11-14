import {
  Package,
  Receipt,
  ShoppingBasket,
  ShoppingCart,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import type { IRoute, IRouteHandle } from "../models/common/route.model";
import { homeLoader, permissionLoader } from "./route.loader";
import { ROUTES } from "./route.paths";

// The one sidebar heading; every nav route falls under it unless it names a group.
export const menuGroup = "Menu";

// Occasional administration, kept at the bottom of the sidebar and in the owner's profile menu.
export const settingsGroup = "Settings";

// The sidebar, the bottom tab bar and the app bar / header title all map over this array;
// order here is the order they render in. `can` hides a route from roles without
// that permission, and its loader turns a typed URL away the same way.
// Every role can sell, so Sales is where a refused URL lands.
// Each screen is its own chunk, fetched during navigation alongside its loader.
export const protectedViewRoutes: IRoute[] = [
  {
    key: "home",
    path: ROUTES.home,
    isNotNav: true,
    loader: homeLoader,
  },
  {
    key: "inventory",
    label: "Stocks",
    icon: Package,
    path: ROUTES.inventory,
    can: "browseInventory",
    loader: permissionLoader("browseInventory", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Inventory/InventoryView")).default },
  },
  {
    key: "transaction",
    label: "Sales",
    icon: ShoppingCart,
    path: ROUTES.transaction,
    can: "transact",
    lazy: { Component: async () => (await import("../pages/Transaction/TransactionView")).default },
  },
  {
    // The employee's own list; the owner reads Sales history inside Sales.
    key: "salesHistory",
    label: "My sales",
    icon: Receipt,
    path: ROUTES.salesHistory,
    can: "isEmployee",
    loader: permissionLoader("isEmployee", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/SalesHistory/SalesHistoryView")).default },
  },
  {
    key: "transactionDetail",
    label: "Sale",
    path: ROUTES.transactionDetail,
    isNotNav: true,
    handle: { pushed: true } satisfies IRouteHandle,
    can: "viewTransactions",
    loader: permissionLoader("viewTransactions", ROUTES.transaction),
    lazy: {
      Component: async () =>
        (await import("../pages/TransactionDetail/TransactionDetailView")).default,
    },
  },
  {
    key: "whatToBuy",
    label: "What to buy",
    shortLabel: "To buy",
    icon: ShoppingBasket,
    path: ROUTES.whatToBuy,
    can: "viewRecommendations",
    loader: permissionLoader("viewRecommendations", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/WhatToBuy/WhatToBuyView")).default },
  },
  {
    key: "masterfile",
    label: "Categories & brands",
    path: ROUTES.masterfile,
    isNotNav: true,
    handle: { pushed: true } satisfies IRouteHandle,
    can: "manageInventory",
    loader: permissionLoader("manageInventory", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Masterfile/MasterfileView")).default },
  },
  {
    key: "item",
    label: "Product",
    path: ROUTES.item,
    isNotNav: true,
    handle: { pushed: true } satisfies IRouteHandle,
    can: "browseInventory",
    loader: permissionLoader("browseInventory", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/ItemDetail/ItemDetailView")).default },
  },
  {
    key: "movements",
    label: "Stock history",
    path: ROUTES.movements,
    isNotNav: true,
    section: "inventory",
    handle: { pushed: true } satisfies IRouteHandle,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Movements/MovementsView")).default },
  },
  {
    key: "receiveDelivery",
    label: "Add stock",
    path: ROUTES.receiveDelivery,
    isNotNav: true,
    section: "inventory",
    handle: { pushed: true } satisfies IRouteHandle,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    lazy: {
      Component: async () => (await import("../pages/ReceiveDelivery/ReceiveDeliveryView")).default,
    },
  },
  {
    key: "stockCount",
    label: "Check stock count",
    path: ROUTES.stockCount,
    isNotNav: true,
    section: "inventory",
    handle: { pushed: true } satisfies IRouteHandle,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/StockCount/StockCountView")).default },
  },
  {
    key: "damagedStock",
    label: "Record damaged or lost stock",
    path: ROUTES.damagedStock,
    isNotNav: true,
    section: "inventory",
    handle: { pushed: true } satisfies IRouteHandle,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    lazy: {
      Component: async () => (await import("../pages/DamagedStock/DamagedStockView")).default,
    },
  },
  {
    key: "orderList",
    label: "Buying list",
    path: ROUTES.orderList,
    isNotNav: true,
    section: "whatToBuy",
    handle: { pushed: true } satisfies IRouteHandle,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/OrderList/OrderListView")).default },
  },
  {
    key: "movementDetail",
    label: "Stock change",
    path: ROUTES.movementDetail,
    isNotNav: true,
    section: "inventory",
    handle: { pushed: true } satisfies IRouteHandle,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    lazy: {
      Component: async () => (await import("../pages/MovementDetail/MovementDetailView")).default,
    },
  },
  {
    key: "account",
    label: "Account",
    icon: UserRound,
    path: ROUTES.account,
    group: settingsGroup,
    // Owners open it from the profile button in the header instead.
    tabCan: "isEmployee",
    lazy: { Component: async () => (await import("../pages/Account/AccountView")).default },
  },
  {
    key: "users",
    label: "Team",
    icon: Users,
    path: ROUTES.users,
    group: settingsGroup,
    tabParent: "account",
    can: "manageUsers",
    loader: permissionLoader("manageUsers", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Users/UsersView")).default },
  },
  {
    key: "userDetail",
    label: "Team member",
    path: ROUTES.userDetail,
    isNotNav: true,
    section: "users",
    handle: { pushed: true } satisfies IRouteHandle,
    can: "manageUsers",
    loader: permissionLoader("manageUsers", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/UserDetail/UserDetailView")).default },
  },
  {
    key: "branches",
    label: "Branches",
    icon: Store,
    path: ROUTES.branches,
    group: settingsGroup,
    tabParent: "account",
    can: "manageBranches",
    loader: permissionLoader("manageBranches", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Branches/BranchesView")).default },
  },
];
