import type { AnalysisPeriod } from "../../../enums/analyzer.enum";

export interface IStockAnalysisFilters {
  period: AnalysisPeriod;
  itemId?: string;
}
