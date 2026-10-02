import { ArrowLeftRight, LayoutDashboard, Package, UserRound, Users } from "lucide-react";
import type { IRoute } from "../models/common/route.model";
import AccountView from "../pages/Account/AccountView";
import CategoriesView from "../pages/Categories/CategoriesView";
import DashboardView from "../pages/Dashboard/DashboardView";
import InventoryView from "../pages/Inventory/InventoryView";
import MovementsView from "../pages/Movements/MovementsView";
import UsersView from "../pages/Users/UsersView";
import { permissionLoader } from "./route.loader";
import { ROUTES } from "./route.paths";

// The one sidebar heading; every nav route falls under it unless it names a group.
export const menuGroup = "Menu";

// The sidebar, the bottom tab bar and the topbar title all map over this array;
// order here is the order they render in. `can` hides a route from roles without
// that permission, and its loader turns a typed URL away the same way.
export const protectedViewRoutes: IRoute[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
    path: ROUTES.home,
    can: "viewDashboard",
    // Employees land on inventory instead.
    loader: permissionLoader("viewDashboard", ROUTES.inventory),
    Component: DashboardView,
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
    key: "categories",
    label: "Categories",
    path: ROUTES.categories,
    isNotNav: true,
    can: "manageInventory",
    loader: permissionLoader("manageInventory", ROUTES.inventory),
    Component: CategoriesView,
  },
  {
    key: "movements",
    label: "Stock history",
    shortLabel: "History",
    icon: ArrowLeftRight,
    path: ROUTES.movements,
    can: "viewMovements",
    loader: permissionLoader("viewMovements", ROUTES.inventory),
    Component: MovementsView,
  },
  {
    key: "users",
    label: "Team",
    icon: Users,
    path: ROUTES.users,
    can: "manageUsers",
    loader: permissionLoader("manageUsers", ROUTES.inventory),
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
