import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserRound,
  Users,
} from "lucide-react";
import type { IRoute } from "../models/common/route.model";
import AccountView from "../pages/Account/AccountView";
import DashboardView from "../pages/Dashboard/DashboardView";
import InventoryView from "../pages/Inventory/InventoryView";
import MasterfileView from "../pages/Masterfile/MasterfileView";
import MovementsView from "../pages/Movements/MovementsView";
import TransactionView from "../pages/Transaction/TransactionView";
import UsersView from "../pages/Users/UsersView";
import { permissionLoader } from "./route.loader";
import { ROUTES } from "./route.paths";

// The one sidebar heading; every nav route falls under it unless it names a group.
export const menuGroup = "Menu";

// The sidebar, the bottom tab bar and the topbar title all map over this array;
// order here is the order they render in. `can` hides a route from roles without
// that permission, and its loader turns a typed URL away the same way.
// Every role can transact, so Transaction is where a refused URL lands.
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
    Component: DashboardView,
  },
  {
    key: "transaction",
    label: "Transaction",
    shortLabel: "Sell",
    icon: ShoppingCart,
    path: ROUTES.transaction,
    can: "transact",
    Component: TransactionView,
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: Package,
    path: ROUTES.inventory,
    can: "browseInventory",
    loader: permissionLoader("browseInventory", ROUTES.transaction),
    Component: InventoryView,
  },
  {
    key: "masterfile",
    label: "Masterfile",
    path: ROUTES.masterfile,
    isNotNav: true,
    can: "manageInventory",
    loader: permissionLoader("manageInventory", ROUTES.transaction),
    Component: MasterfileView,
  },
  {
    key: "movements",
    label: "Stock history",
    shortLabel: "Stock",
    icon: ArrowLeftRight,
    path: ROUTES.movements,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.transaction),
    Component: MovementsView,
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
    Component: UsersView,
  },
  {
    key: "account",
    label: "My account",
    shortLabel: "Account",
    icon: UserRound,
    path: ROUTES.account,
    group: "Settings",
    Component: AccountView,
  },
];
