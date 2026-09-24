import type { Tone } from "../styles/common/tone.styles";

// Mirrors the stock_status column of the inventory_item_status view.
export type StockStatus = "in_stock" | "low" | "reorder" | "out_of_stock";

export const stockStatusLabels: Record<StockStatus, string> = {
  in_stock: "In stock",
  low: "Low",
  reorder: "Reorder",
  out_of_stock: "Out of stock",
};

export const stockStatusTones: Record<StockStatus, Tone> = {
  in_stock: "success",
  low: "info",
  reorder: "warning",
  out_of_stock: "danger",
};

// The inventory list's tabs: every status, plus archived items for managers.
export type InventoryTab = "all" | StockStatus | "archived";

export const inventoryTabLabels: Record<InventoryTab, string> = {
  all: "All",
  in_stock: "In stock",
  low: "Low",
  reorder: "Reorder",
  out_of_stock: "Out",
  archived: "Archived",
};

export type InventorySort = "name" | "stock_asc" | "stock_desc" | "updated";

export const inventorySortLabels: Record<InventorySort, string> = {
  name: "Name A–Z",
  stock_asc: "Stock: low to high",
  stock_desc: "Stock: high to low",
  updated: "Recently updated",
};
