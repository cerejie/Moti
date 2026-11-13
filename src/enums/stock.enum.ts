import { z } from "zod";
import type { Tone } from "../styles/common/tone.styles";

// Derived in the database: out (0), low (<= warning low stock quantity), in stock.
export const stockStatusValues = ["in_stock", "low", "out"] as const;
export type StockStatus = (typeof stockStatusValues)[number];

export const stockStatusLabels: Record<StockStatus, string> = {
  in_stock: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

export const stockStatusTones: Record<StockStatus, Tone> = {
  in_stock: "success",
  low: "warning",
  out: "danger",
};

// The inventory list's tabs: the three statuses plus archived items.
export const inventoryViewValues = ["all", "low", "out", "archived"] as const;
export type InventoryView = (typeof inventoryViewValues)[number];

export const inventoryViewLabels: Record<InventoryView, string> = {
  all: "All",
  low: "Low",
  out: "Out",
  archived: "Archived",
};

export const movementTypeValues = ["stock_in", "stock_out"] as const;
export const movementTypeSchema = z.enum(movementTypeValues);
export type MovementType = z.infer<typeof movementTypeSchema>;

export const movementReasonValues = [
  "sale",
  "void",
  "restock",
  "opening_balance",
  "damaged",
  "correction",
] as const;
export const movementReasonSchema = z.enum(movementReasonValues);
export type MovementReason = z.infer<typeof movementReasonSchema>;

export const movementReasonLabels: Record<MovementReason, string> = {
  sale: "Sale",
  void: "Voided sale",
  restock: "Delivery",
  opening_balance: "Opening stock",
  damaged: "Damaged or lost",
  correction: "Stock count",
};

export const movementReasonTones: Record<MovementReason, Tone> = {
  sale: "brand",
  void: "warning",
  restock: "success",
  opening_balance: "info",
  damaged: "danger",
  correction: "neutral",
};

// Stock history's chips. Sales already have their own history, so the list opens without them.
export const movementViewValues = ["changes", "deliveries", "counts", "damaged", "sales"] as const;
export type MovementView = (typeof movementViewValues)[number];

export const movementViewLabels: Record<MovementView, string> = {
  changes: "Stock changes",
  deliveries: "Deliveries",
  counts: "Counts",
  damaged: "Damaged or lost",
  sales: "Sales",
};

export const movementViewReasons: Record<MovementView, readonly MovementReason[]> = {
  changes: ["restock", "opening_balance", "damaged", "correction"],
  deliveries: ["restock"],
  counts: ["correction"],
  damaged: ["damaged"],
  sales: ["sale", "void"],
};

// The Stock page's tabs: what to order first, then the ledger.
export const stockTabValues = ["reorder", "history"] as const;
export type StockTab = (typeof stockTabValues)[number];
