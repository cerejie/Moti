import type { Tone } from "../styles/common/tone.styles";

// Mirror the app.movement_type and app.movement_reason Postgres enums.
export type MovementType = "stock_in" | "stock_out";

export type MovementReason =
  | "restock"
  | "opening_balance"
  | "correction"
  | "sale"
  | "damaged";

export const movementReasonLabels: Record<MovementReason, string> = {
  restock: "Restock",
  opening_balance: "Opening balance",
  correction: "Correction",
  sale: "Sale",
  damaged: "Damaged",
};

export const movementReasonTones: Record<MovementReason, Tone> = {
  restock: "success",
  opening_balance: "neutral",
  correction: "warning",
  sale: "info",
  damaged: "danger",
};

// What the stock form records. Opening balance is never picked by hand: item creation writes it.
export type StockMovementMode = "sale" | "stock_in" | "stock_out";

export const movementModeTitles: Record<StockMovementMode, string> = {
  sale: "Record sale",
  stock_in: "Add stock",
  stock_out: "Deduct stock",
};

export const movementModeTypes: Record<StockMovementMode, MovementType> = {
  sale: "stock_out",
  stock_in: "stock_in",
  stock_out: "stock_out",
};

export const movementModeReasons: Record<StockMovementMode, MovementReason[]> = {
  sale: ["sale"],
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
