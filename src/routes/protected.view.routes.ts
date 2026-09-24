import { House, LayoutDashboard, Package, Store } from "lucide-react";
import type { IRoute } from "../models/common/route.model";
import HomeView from "../pages/Home/HomeView";
import InventoryItemView from "../pages/Inventory/InventoryItemView";
import InventoryView from "../pages/Inventory/InventoryView";
import ComingSoonView from "../pages/Placeholder/ComingSoonView";
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
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.dashboard,
    can: "viewInsights",
    handle: { note: "The owner dashboard arrives in Phase 4." },
    Component: ComingSoonView,
  },
  {
    key: "shops",
    label: "Shops",
    icon: Store,
    path: ROUTES.shops,
    can: "manageShops",
    handle: { note: "Shop management arrives in Phase 6." },
    Component: ComingSoonView,
  },
];
