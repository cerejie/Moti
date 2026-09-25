import {
  ArrowLeftRight,
  ChartColumnBig,
  House,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  UsersRound,
} from "lucide-react";
import type { IRoute } from "../models/common/route.model";
import HomeView from "../pages/Home/HomeView";
import { lazyPage } from "../utils/route.utils";
import { ROUTES } from "./route.paths";

// The one sidebar heading; every nav route falls under it.
export const menuGroup = "Menu";

// The sidebar, the bottom tab bar and the topbar title all map over this array;
// order here is the order they render in. `isNotNav` entries route but never
// appear in navigation. `can` hides an entry and blocks its URL for roles
// without that permission. A placeholder's `handle.note` says when its screen arrives.
// Home, the landing page, ships in the main bundle; every other page is its own
// chunk, and `skeleton` is the frame shown until that chunk arrives.
export const protectedViewRoutes: IRoute[] = [
  {
    key: "home",
    label: "Home",
    icon: House,
    path: ROUTES.home,
    Component: HomeView,
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
  {
    key: "movements",
    label: "Movements",
    icon: ArrowLeftRight,
    path: ROUTES.movements,
    can: "viewInsights",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Movements/MovementsView")),
  },
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
    key: "analyzer",
    label: "Analyzer",
    icon: ChartColumnBig,
    path: ROUTES.analyzer,
    can: "viewInsights",
    skeleton: "dashboard",
    ...lazyPage(() => import("../pages/Analyzer/AnalyzerView")),
  },
  {
    key: "shops",
    label: "Shops",
    icon: Store,
    path: ROUTES.shops,
    can: "manageShops",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Shops/ShopsView")),
  },
  {
    key: "users",
    label: "Users",
    icon: UsersRound,
    path: ROUTES.users,
    can: "manageEmployees",
    skeleton: "list",
    ...lazyPage(() => import("../pages/Users/UsersView")),
  },
  // Reached from the account menu, so it takes no tab-bar slot.
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    path: ROUTES.settings,
    isNotNav: true,
    skeleton: "form",
    ...lazyPage(() => import("../pages/Settings/SettingsView")),
  },
];
