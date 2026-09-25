import type { StockStatus } from "../../../enums/inventory.enum";

// One row of analyzer_volume_ranking.
export interface IVolumeRank {
  rank: number;
  item_id: string;
  name: string;
  item_code: string;
  unit: string;
  category_id: string | null;
  category_name: string | null;
  quantity: number;
  transaction_count: number;
  on_hand: number;
  reorder_level: number;
  stock_status: StockStatus;
}

// The single row of analyzer_period_summary; the top item is null when nothing moved.
export interface IPeriodSummary {
  total_units: number;
  item_count: number;
  top_item_id: string | null;
  top_item_name: string | null;
  top_item_unit: string | null;
  top_item_quantity: number | null;
  unsold_stocked_count: number;
}

// One row of analyzer_reorder_items.
export interface IReorderItem {
  id: string;
  category_name: string | null;
  item_code: string;
  name: string;
  unit: string;
  on_hand: number;
  reorder_level: number;
  stock_status: StockStatus;
  // 1 out of stock, 2 reorder, 3 low.
  severity: number;
  sold_30d: number;
}
