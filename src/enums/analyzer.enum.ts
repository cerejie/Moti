// The stock analyzer's rules, passed to the stock_analysis RPC so they live in one place.
export const analysisSlowDays = 60;
export const analysisMinSales = 3;
export const fastMoverLimit = 10;
export const orderNextLimit = 5;

// How many days of stock a suggestion aims to cover; the owner can change it on this device.
export const coverDayValues = [7, 14, 21, 30] as const;
export type CoverDays = (typeof coverDayValues)[number];
export const defaultCoverDays: CoverDays = 14;

// The sales period a pace is worked out over.
export const analysisPeriodValues = ["7", "30", "90"] as const;
export type AnalysisPeriod = (typeof analysisPeriodValues)[number];
export const defaultAnalysisPeriod: AnalysisPeriod = "30";

export const analysisPeriodLabels: Record<AnalysisPeriod, string> = {
  "7": "7 days",
  "30": "30 days",
  "90": "90 days",
};

// Decided in the database; every item lands in exactly one.
export const analysisGroupValues = ["order_now", "low_soon", "slow", "ok"] as const;
export type AnalysisGroup = (typeof analysisGroupValues)[number];

// What to buy's two questions: what needs restocking, and what sells the most.
export const whatToBuyViewValues = ["buy_soon", "most_sold"] as const;
export type WhatToBuyView = (typeof whatToBuyViewValues)[number];

export const whatToBuyViewLabels: Record<WhatToBuyView, string> = {
  buy_soon: "Buy soon",
  most_sold: "Most sold",
};

// How a list of analysed items reads its rows.
export type AnalysisListKind = "order" | "fast" | "slow";
