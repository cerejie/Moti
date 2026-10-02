import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserRound,
  Users,
} from "lucide-react";
import type { IRoute } from "../models/common/route.model";
import { permissionLoader } from "./route.loader";
import { ROUTES } from "./route.paths";

// The one sidebar heading; every nav route falls under it unless it names a group.
export const menuGroup = "Menu";

// The sidebar, the bottom tab bar and the topbar title all map over this array;
// order here is the order they render in. `can` hides a route from roles without
// that permission, and its loader turns a typed URL away the same way.
// Every role can transact, so Transaction is where a refused URL lands.
// Each screen is its own chunk, fetched during navigation alongside its loader.
export const protectedViewRoutes: IRoute[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
    path: ROUTES.home,
    can: "viewDashboard",
    // Employees land on Transaction instead.
    loader: permissionLoader("viewDashboard", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Dashboard/DashboardView")).default },
  },
  {
    key: "transaction",
    label: "Transaction",
    shortLabel: "Sell",
    icon: ShoppingCart,
    path: ROUTES.transaction,
    can: "transact",
    lazy: { Component: async () => (await import("../pages/Transaction/TransactionView")).default },
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: Package,
    path: ROUTES.inventory,
    can: "browseInventory",
    loader: permissionLoader("browseInventory", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Inventory/InventoryView")).default },
  },
  {
    key: "masterfile",
    label: "Masterfile",
    path: ROUTES.masterfile,
    isNotNav: true,
    can: "manageInventory",
    loader: permissionLoader("manageInventory", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Masterfile/MasterfileView")).default },
  },
  {
    key: "movements",
    label: "Stock history",
    shortLabel: "Stock",
    icon: ArrowLeftRight,
    path: ROUTES.movements,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Movements/MovementsView")).default },
  },
  {
    key: "users",
    label: "Team",
    icon: Users,
    path: ROUTES.users,
    // Phones keep five tabs; Team opens from Account.
    tabParent: "account",
    can: "manageUsers",
    loader: permissionLoader("manageUsers", ROUTES.transaction),
    lazy: { Component: async () => (await import("../pages/Users/UsersView")).default },
  },
  {
    key: "account",
    label: "My account",
    shortLabel: "Account",
    icon: UserRound,
    path: ROUTES.account,
    group: "Settings",
    lazy: { Component: async () => (await import("../pages/Account/AccountView")).default },
  },
];
