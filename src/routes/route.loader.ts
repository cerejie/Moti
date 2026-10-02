import { redirect } from "react-router-dom";
import {
  derivePermissions,
  type IPermissions,
} from "../models/common/permission.model";
import { selectRole, useAccountStore } from "../store/data/account/account.store";

// A direct URL to a screen the role cannot use redirects instead of rendering.
export const permissionLoader =
  (can: keyof IPermissions, fallback: string) => () => {
    const permissions = derivePermissions(selectRole(useAccountStore.getState()));
    return permissions[can] ? null : redirect(fallback);
  };
