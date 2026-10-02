import type { EffectiveRole } from "../../enums/role.enum";

export interface IPermissions {
  role: EffectiveRole | null;
  isOwner: boolean;
  viewDashboard: boolean;
  browseInventory: boolean;
  recordSale: boolean;
  manageInventory: boolean;
  viewMovements: boolean;
  manageUsers: boolean;
  receiveStockAlerts: boolean;
}

// The UI mirror of the RLS rules; the database stays the real boundary.
export const derivePermissions = (role: EffectiveRole | null): IPermissions => {
  const isOwner = role === "developer" || role === "owner";
  const isStaff = role !== null;

  return {
    role,
    isOwner,
    viewDashboard: isOwner,
    browseInventory: isStaff,
    recordSale: isStaff,
    manageInventory: isOwner,
    viewMovements: isOwner,
    manageUsers: isOwner,
    receiveStockAlerts: isOwner,
  };
};
