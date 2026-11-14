import type { Tone } from "../styles/common/tone.styles";

export const transactionStatusValues = ["completed", "voided"] as const;
export type TransactionStatus = (typeof transactionStatusValues)[number];

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  completed: "Completed",
  voided: "Cancelled",
};

export const transactionStatusTones: Record<TransactionStatus, Tone> = {
  completed: "success",
  voided: "neutral",
};

// The Sales page's tabs; Sales history is the owner's (employees have My sales).
export const transactionTabValues = ["new", "history"] as const;
export type TransactionTab = (typeof transactionTabValues)[number];
