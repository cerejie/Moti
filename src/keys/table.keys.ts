export const inventoryTableKey = "inventory";
export const movementTableKey = "movements";
export const categoryTableKey = "categories";
export const brandTableKey = "brands";
// Filter-store keys that hold a page's selected tab.
export const masterfileTabKey = "masterfile-tab";
export const transactionTabKey = "transaction-tab";
export const stockTabKey = "stock-tab";
// Holds the Reorder view's sales period.
export const reorderKey = "reorder";
export const transactionPickTableKey = "transaction-pick";
export const deliveryPickTableKey = "delivery-pick";
export const countPickTableKey = "count-pick";
export const damagedPickTableKey = "damaged-pick";
export const transactionHistoryTableKey = "transaction-history";
export const userTableKey = "users";
// Lists that follow the header branch switcher; switching sends each back to page 1.
export const branchScopedTableKeys = [transactionHistoryTableKey] as const;
