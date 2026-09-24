import type { StockStatus } from "../../../enums/inventory.enum";

// One row of the inventory_stock_summary view: active items only.
export interface IStockSummary {
  shop_id: string;
  item_count: number;
  units_on_hand: number;
  in_stock_count: number;
  low_count: number;
  reorder_count: number;
  out_of_stock_count: number;
}

// One row of the inventory_attention_items view.
export interface IStockAlert {
  id: string;
  shop_id: string;
  category_name: string | null;
  sku: string;
  name: string;
  unit: string;
  on_hand: number;
  reorder_level: number;
  stock_status: StockStatus;
  // 1 out of stock, 2 reorder, 3 low.
  severity: number;
}

// The first rows by severity, plus how many need attention in total.
export interface IStockAlerts {
  data: IStockAlert[];
  totalCount: number;
}
