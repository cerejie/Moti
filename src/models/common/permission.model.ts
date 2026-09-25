import type { UserRole } from "../../enums/role.enum";

// One flag per row of the roadmap's role matrix. RLS enforces the same rules
// on the server; these only decide what the UI shows.
export interface IPermissions {
  role: UserRole | null;
  isSuperadmin: boolean;
  browseInventory: boolean;
  // Sell through the Transaction screen; employees see only their own history.
  takeTransaction: boolean;
  voidTransaction: boolean;
  adjustStock: boolean;
  manageCatalog: boolean;
  // Movement history, dashboard, alerts, analyzer and the reorder list.
  viewInsights: boolean;
  manageEmployees: boolean;
  manageShops: boolean;
  manageShopSettings: boolean;
}

export type IPermissionKey = Exclude<keyof IPermissions, "role">;

export const derivePermissions = (role: UserRole | null): IPermissions => {
  const isSuperadmin = role === "superadmin";
  const isManager = isSuperadmin || role === "owner";
  const isMember = role !== null;

  return {
    role,
    isSuperadmin,
    browseInventory: isMember,
    takeTransaction: isMember,
    voidTransaction: isManager,
    adjustStock: isManager,
    manageCatalog: isManager,
    viewInsights: isManager,
    manageEmployees: isManager,
    manageShops: isSuperadmin,
    manageShopSettings: isManager,
  };
};
