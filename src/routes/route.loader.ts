import { redirect } from "react-router-dom";
import {
  derivePermissions,
  type IPermissions,
} from "../models/common/permission.model";
import { selectRole, useAccountStore } from "../store/data/account/account.store";
import { ROUTES } from "./route.paths";

const currentPermissions = () => derivePermissions(selectRole(useAccountStore.getState()));

// A direct URL to a screen the role cannot use redirects instead of rendering.
export const permissionLoader =
  (can: keyof IPermissions, fallback: string) => () =>
    currentPermissions()[can] ? null : redirect(fallback);

// "/" has no screen of its own: owners land on Stocks, everyone else on Sales.
export const homeLoader = () =>
  redirect(currentPermissions().browseInventory ? ROUTES.inventory : ROUTES.transaction);
