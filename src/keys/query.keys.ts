export const scopedKey = (...parts: (string | number | null | undefined)[]) =>
  parts.map((part) => part ?? "all").join(":");

// Every query key starts with one of these, so a mutation invalidates a whole
// family by prefix.
export const inventoryListKey = "inventory-list";
export const inventorySummaryKey = "inventory-summary";
export const stockAlertsKey = "stock-alerts";
export const categoryListKey = "category-list";
export const brandListKey = "brand-list";
export const transactionListKey = "transaction-list";
export const transactionLinesKey = "transaction-lines";
export const movementListKey = "movement-list";
export const itemMovementsKey = "item-movements";
export const userListKey = "user-list";

// Everything a stock change can move.
export const stockQueryKeys = [
  [inventoryListKey],
  [inventorySummaryKey],
  [stockAlertsKey],
  [movementListKey],
  [itemMovementsKey],
  [transactionListKey],
  [transactionLinesKey],
] as const;
