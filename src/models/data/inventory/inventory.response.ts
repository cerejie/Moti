import type { StockStatus } from "../../../enums/stock.enum";

export interface IInventoryItem {
  id: string;
  sku: string;
  name: string;
  category_id: string | null;
  category: { name: string } | null;
  brand_id: string | null;
  brand: { name: string } | null;
  part_number: string | null;
  unit: string;
  on_hand: number;
  reorder_level: number;
  selling_price: number | null;
  location: string | null;
  stock_status: StockStatus;
  archived_at: string | null;
  updated_at: string;
}

export interface IInventorySummary {
  item_count: number;
  units_on_hand: number;
  low_count: number;
  out_count: number;
}
