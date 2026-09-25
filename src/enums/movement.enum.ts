import type { Tone } from "../styles/common/tone.styles";

// Mirror the app.movement_type and app.movement_reason Postgres enums.
export type MovementType = "stock_in" | "stock_out";

export type MovementReason =
  | "restock"
  | "opening_balance"
  | "correction"
  | "sale"
  | "damaged"
  | "transaction_void";

export const movementReasonLabels: Record<MovementReason, string> = {
  restock: "Restock",
  opening_balance: "Opening balance",
  correction: "Correction",
  sale: "Sale",
  damaged: "Damaged",
  transaction_void: "Transaction void",
};

export const movementReasonTones: Record<MovementReason, Tone> = {
  restock: "success",
  opening_balance: "neutral",
  correction: "warning",
  sale: "info",
  damaged: "danger",
  transaction_void: "neutral",
};

// What the stock form records. Opening balance is written by item creation, sales
// and void returns by transactions, so none of them is picked by hand.
export type StockMovementMode = "stock_in" | "stock_out";

export const movementModeTitles: Record<StockMovementMode, string> = {
  stock_in: "Add stock",
  stock_out: "Deduct stock",
};

export const movementModeTypes: Record<StockMovementMode, MovementType> = {
  stock_in: "stock_in",
  stock_out: "stock_out",
};

export const movementModeReasons: Record<StockMovementMode, MovementReason[]> = {
  stock_in: ["restock", "correction"],
  stock_out: ["damaged", "correction"],
};

// The stock movements page's tabs.
export type MovementTab = "all" | MovementType;

export const movementTabLabels: Record<MovementTab, string> = {
  all: "All",
  stock_in: "Stock in",
  stock_out: "Stock out",
};
