import type { AnalysisGroup } from "../../../enums/analyzer.enum";
import type { StockStatus } from "../../../enums/stock.enum";

// pace, days_left and suggested_quantity are null when the item has too few sales to judge.
export interface IStockAnalysisRow {
  item_id: string;
  name: string;
  item_code: string;
  unit: string;
  on_hand: number;
  reorder_level: number;
  stock_status: StockStatus;
  sold_units: number;
  sale_count: number;
  pace: number | null;
  days_left: number | null;
  suggested_quantity: number | null;
  last_sold_at: string | null;
  // All branches: how many branches are Low or Out on it. Undefined before migration 14.
  short_branches?: number;
  analysis_group: AnalysisGroup;
}
