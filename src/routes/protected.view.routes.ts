import {
  ChartColumnBig,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import type { IRoute } from "../models/common/route.model";
import { lazyPage } from "../utils/route.utils";
import { ROUTES } from "./route.paths";

// The one sidebar heading; every nav route falls under it.
export const menuGroup = "Menu";

// The sidebar, the bottom tab bar and the topbar title all map over this array;
// order here is the order they render in. `isNotNav` entries route but never
// appear in navigation. `can` hides an entry and blocks its URL for roles
// without that permission. A placeholder's `handle.note` says when its screen arrives.
// Every page is its own chunk, and `skeleton` is the frame shown until that
// chunk arrives. "/" is no page: protected.routes.ts sends it to the role's landing page.
export const protectedViewRoutes: IRoute[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.dashboard,
    can: "viewInsights",
    badge: "stockAlerts",
    skeleton: "dashboard",
    ...lazyPage(() => import("../pages/Dashboard/DashboardView")),
  },
  {
    key: "transaction",
    label: "Transaction",
    shortLabel: "Sell",
    icon: ShoppingCart,
    path: ROUTES.transaction,
    can: "takeTransaction",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Transaction/TransactionView")),
  },
  {
    key: "analyzer",
    label: "Analyzer",
    icon: ChartColumnBig,
    path: ROUTES.analyzer,
    can: "viewInsights",
    skeleton: "dashboard",
    ...lazyPage(() => import("../pages/Analyzer/AnalyzerView")),
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: Package,
    path: ROUTES.inventory,
    can: "browseInventory",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Inventory/InventoryView")),
  },
  {
    key: "inventory-item",
    label: "Item",
    path: ROUTES.inventoryItem,
    isNotNav: true,
    can: "browseInventory",
    skeleton: "detail",
    ...lazyPage(() => import("../pages/Inventory/InventoryItemView")),
  },
  // The hub for the account, shop defaults and the screens below it.
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    path: ROUTES.settings,
    skeleton: "form",
    ...lazyPage(() => import("../pages/Settings/SettingsView")),
  },
  {
    key: "masterfile",
    label: "Masterfile",
    path: ROUTES.masterfile,
    isNotNav: true,
    can: "manageCatalog",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Masterfile/MasterfileView")),
  },
  {
    key: "users",
    label: "Users",
    path: ROUTES.users,
    isNotNav: true,
    can: "manageEmployees",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Users/UsersView")),
  },
  {
    key: "shops",
    label: "Shops",
    path: ROUTES.shops,
    isNotNav: true,
    can: "manageShops",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Shops/ShopsView")),
  },
];
