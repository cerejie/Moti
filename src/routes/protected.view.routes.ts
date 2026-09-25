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
import AnalyzerView from "../pages/Analyzer/AnalyzerView";
import HomeView from "../pages/Home/HomeView";
import InventoryItemView from "../pages/Inventory/InventoryItemView";
import InventoryView from "../pages/Inventory/InventoryView";
import MovementsView from "../pages/Movements/MovementsView";
import DashboardView from "../pages/Dashboard/DashboardView";
import SettingsView from "../pages/Settings/SettingsView";
import ShopsView from "../pages/Shops/ShopsView";
import UsersView from "../pages/Users/UsersView";
import { ROUTES } from "./route.paths";

// The one sidebar heading; every nav route falls under it.
export const menuGroup = "Menu";

// The sidebar, the bottom tab bar and the topbar title all map over this array;
// order here is the order they render in. `isNotNav` entries route but never
// appear in navigation. `can` hides an entry and blocks its URL for roles
// without that permission. A placeholder's `handle.note` says when its screen arrives.
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
    Component: InventoryView,
  },
  {
    key: "inventory-item",
    label: "Item",
    path: ROUTES.inventoryItem,
    isNotNav: true,
    can: "browseInventory",
    Component: InventoryItemView,
  },
  {
    key: "movements",
    label: "Movements",
    icon: ArrowLeftRight,
    path: ROUTES.movements,
    can: "viewInsights",
    Component: MovementsView,
  },
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.dashboard,
    can: "viewInsights",
    badge: "stockAlerts",
    Component: DashboardView,
  },
  {
    key: "analyzer",
    label: "Analyzer",
    icon: ChartColumnBig,
    path: ROUTES.analyzer,
    can: "viewInsights",
    Component: AnalyzerView,
  },
  {
    key: "shops",
    label: "Shops",
    icon: Store,
    path: ROUTES.shops,
    can: "manageShops",
    Component: ShopsView,
  },
  {
    key: "users",
    label: "Users",
    icon: UsersRound,
    path: ROUTES.users,
    can: "manageEmployees",
    Component: UsersView,
  },
  // Reached from the account menu, so it takes no tab-bar slot.
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    path: ROUTES.settings,
    isNotNav: true,
    Component: SettingsView,
  },
];
