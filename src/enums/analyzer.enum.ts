// The stock analyzer's rules, passed to the stock_analysis RPC so they live in one place.
export const analysisCoverDays = 14;
export const analysisSlowDays = 60;
export const analysisMinSales = 3;
export const fastMoverLimit = 10;
export const orderNextLimit = 5;

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

// How a list of analysed items reads its rows.
export type AnalysisListKind = "order" | "fast" | "slow";
