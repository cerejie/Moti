import type { Tone } from "../styles/common/tone.styles";

// Mirrors the app.transaction_status Postgres enum.
export type TransactionStatus = "confirmed" | "voided";

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  confirmed: "Confirmed",
  voided: "Voided",
};

export const transactionStatusTones: Record<TransactionStatus, Tone> = {
  confirmed: "success",
  voided: "danger",
};

// The Transaction screen's New / History tabs.
export type TransactionSection = "new" | "history";

export const transactionSectionLabels: Record<TransactionSection, string> = {
  new: "New",
  history: "History",
};

// The history list's status tabs.
export type TransactionStatusTab = "all" | TransactionStatus;

export const transactionStatusTabLabels: Record<TransactionStatusTab, string> = {
  all: "All",
  confirmed: "Confirmed",
  voided: "Voided",
};
