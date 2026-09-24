export const scopedKey = (...parts: (string | number | null | undefined)[]) =>
  parts.map((part) => part ?? "all").join(":");

export const authMeKey = "auth-me";
export const shopOptionsKey = "shop-options";
export const inventoryListKey = "inventory-list";
export const inventoryItemKey = "inventory-item";
export const categoryOptionsKey = "category-options";
