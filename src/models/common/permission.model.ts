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
  manageBranches: boolean;
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
    // An employee sees only their own sales (RLS), and cannot void them.
    viewTransactions: isStaff,
    voidTransaction: isOwner,
    browseInventory: isOwner,
    manageInventory: isOwner,
    viewMovements: isOwner,
    manageUsers: isOwner,
    manageBranches: isOwner,
    receiveStockAlerts: isOwner,
  };
};
