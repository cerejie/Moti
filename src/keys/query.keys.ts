export const scopedKey = (...parts: (string | number | null | undefined)[]) =>
  parts.map((part) => part ?? "all").join(":");

export const authMeKey = "auth-me";
export const shopOptionsKey = "shop-options";
export const inventoryListKey = "inventory-list";
export const inventoryItemKey = "inventory-item";
export const categoryOptionsKey = "category-options";
// Both movement keys share the "movement" prefix, so one invalidation refreshes them.
export const movementListKey = "movement-list";
export const movementItemKey = "movement-item";
// Both dashboard keys share the "dashboard" prefix, so one invalidation refreshes them.
export const dashboardSummaryKey = "dashboard-summary";
export const dashboardAlertsKey = "dashboard-alerts";
// All three analyzer keys share the "analyzer" prefix.
export const analyzerRankingKey = "analyzer-ranking";
export const analyzerSummaryKey = "analyzer-summary";
export const analyzerReorderKey = "analyzer-reorder";
export const shopTimezoneKey = "shop-timezone";
export const shopListKey = "shop-list";
export const shopSettingsKey = "shop-settings";
export const userListKey = "user-list";
