import { z } from "zod";
import type { Tone } from "../styles/common/tone.styles";

// Derived in the database: out (0), low (<= reorder level), in stock.
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

export const movementTypeLabels: Record<MovementType, string> = {
  stock_in: "Stock in",
  stock_out: "Stock out",
};

export const movementReasonValues = [
  "sale",
  "restock",
  "opening_balance",
  "damaged",
  "correction",
] as const;
export const movementReasonSchema = z.enum(movementReasonValues);
export type MovementReason = z.infer<typeof movementReasonSchema>;

export const movementReasonLabels: Record<MovementReason, string> = {
  sale: "Sale",
  restock: "Restock",
  opening_balance: "Opening stock",
  damaged: "Damaged",
  correction: "Correction",
};

export const movementReasonTones: Record<MovementReason, Tone> = {
  sale: "brand",
  restock: "success",
  opening_balance: "info",
  damaged: "danger",
  correction: "neutral",
};

// Mirrors stock_movements_reason_check; opening stock is only set by create_item.
export const reasonsByType: Record<MovementType, readonly MovementReason[]> = {
  stock_in: ["restock", "correction"],
  stock_out: ["sale", "damaged", "correction"],
};

// What the stock dialog was opened for. Employees only ever get "sale".
export type StockAction = "sale" | "stock_in" | "stock_out";

export const stockActionTitles: Record<StockAction, string> = {
  sale: "Record sale",
  stock_in: "Add stock",
  stock_out: "Deduct stock",
};
