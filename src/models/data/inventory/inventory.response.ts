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

// One branch's count of an item, for the item page's "By branch" list.
export interface IItemBranchStock {
  branch_id: string;
  on_hand: number;
  stock_status: StockStatus;
  branch: { name: string; sort: number } | null;
}

// One branch's low or out shelf: the item at that branch's count, status and warning level.
export interface IStockAlert extends IInventoryItem {
  stock_id: string;
  branch_id: string;
  branch: { name: string } | null;
}

export interface IInventorySummary {
  item_count: number;
  units_on_hand: number;
  low_count: number;
  out_count: number;
}
