// Mirror the p_metric argument of the analyzer SQL functions.
export type AnalyzerMetric = "sold" | "added";

export const analyzerMetricLabels: Record<AnalyzerMetric, string> = {
  sold: "Sold",
  added: "Added",
};

export type AnalyzerPeriod = "week" | "month" | "custom";

export const analyzerPeriodLabels: Record<AnalyzerPeriod, string> = {
  week: "Week",
  month: "Month",
  custom: "Custom",
};

export type AnalyzerTab = "ranking" | "reorder";

export const analyzerTabLabels: Record<AnalyzerTab, string> = {
  ranking: "Volume ranking",
  reorder: "Needs reorder",
};

// Highest → lowest is the ranking's natural order.
export type SortDirection = "desc" | "asc";

export const sortDirectionLabels: Record<SortDirection, string> = {
  desc: "Highest first",
  asc: "Lowest first",
};

// The formula behind each analyzer number, shown in its info hint.
export const quantityFormulas: Record<AnalyzerMetric, string> = {
  sold: "Sum of the units in every Sale in the period.",
  added: "Sum of the units in every stock-in (restock, opening balance, correction) in the period.",
};

export const itemCountFormulas: Record<AnalyzerMetric, string> = {
  sold: "Active items with at least one Sale in the period.",
  added: "Active items with at least one stock-in in the period.",
};

export const topItemFormula = "The item with the most units in the period; ties go to the name first A–Z.";

export const unsoldStockedFormula =
  "Active items with stock on hand now and no Sale in the period.";

export const rankFormula =
  "Position by quantity, highest first. Items with the same quantity share a rank.";

export const transactionFormulas: Record<AnalyzerMetric, string> = {
  sold: "Number of Sale records in the period.",
  added: "Number of stock-in records in the period.",
};

export const sold30dFormula =
  "Sum of the units in every Sale over the last 30 days, today included.";

export const reorderOrderFormula =
  "Out of stock first, then Reorder, then Low; within each, the most sold in 30 days first.";

export const periodDaysFormula = "Dates follow the shop's timezone; weeks run Monday to Sunday.";
