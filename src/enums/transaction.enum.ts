import type { Tone } from "../styles/common/tone.styles";

export const transactionStatusValues = ["completed", "voided"] as const;
export type TransactionStatus = (typeof transactionStatusValues)[number];

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  completed: "Completed",
  voided: "Voided",
};

export const transactionStatusTones: Record<TransactionStatus, Tone> = {
  completed: "success",
  voided: "neutral",
};

// The Transaction page's tabs; History is the owner's.
export const transactionTabValues = ["new", "history"] as const;
export type TransactionTab = (typeof transactionTabValues)[number];
