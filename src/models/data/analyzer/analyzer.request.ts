import type { AnalyzerMetric, SortDirection } from "../../../enums/analyzer.enum";
import type { StockStatus } from "../../../enums/inventory.enum";

// Calendar dates (YYYY-MM-DD) in the shop's timezone, both days included.
export interface IDateRange {
  from: string;
  to: string;
}

export interface IPeriodRequest extends IDateRange {
  metric: AnalyzerMetric;
}

export interface IRankingFilters extends IPeriodRequest {
  direction: SortDirection;
  categoryId?: string;
  status?: StockStatus;
}
