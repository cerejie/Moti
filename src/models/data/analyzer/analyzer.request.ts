import type { AnalysisPeriod, CoverDays } from "../../../enums/analyzer.enum";

export interface IStockAnalysisFilters {
  period: AnalysisPeriod;
  coverDays: CoverDays;
  itemId?: string;
  // Set: that branch's sales, stock and status. Unset: All branches.
  branchId?: string;
}
