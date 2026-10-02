import type { EffectiveRole } from "../../enums/role.enum";

export interface IPermissions {
  role: EffectiveRole | null;
  isOwner: boolean;
  viewDashboard: boolean;
  transact: boolean;
  viewTransactions: boolean;
  voidTransaction: boolean;
  browseInventory: boolean;
  manageInventory: boolean;
  viewMovements: boolean;
  manageUsers: boolean;
  receiveStockAlerts: boolean;
}

// The UI mirror of the RLS rules; the database stays the real boundary.
// Employees sell through Transaction; everything else is the owner's.
export const derivePermissions = (role: EffectiveRole | null): IPermissions => {
  const isOwner = role === "developer" || role === "owner";
  const isStaff = role !== null;

  return {
    role,
    isOwner,
    viewDashboard: isOwner,
    transact: isStaff,
    viewTransactions: isOwner,
    voidTransaction: isOwner,
    browseInventory: isOwner,
    manageInventory: isOwner,
    viewMovements: isOwner,
    manageUsers: isOwner,
    receiveStockAlerts: isOwner,
  };
};
