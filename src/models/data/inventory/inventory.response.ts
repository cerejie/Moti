import type { StockStatus } from "../../../enums/stock.enum";
import type { ItemUnit } from "../../../enums/unit.enum";

export interface IInventoryItem {
  id: string;
  item_code: string;
  name: string;
  category_id: string | null;
  category: { name: string } | null;
  brand_id: string | null;
  brand: { name: string } | null;
  unit: ItemUnit;
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
