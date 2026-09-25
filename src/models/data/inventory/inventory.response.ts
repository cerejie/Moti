import type { StockStatus } from "../../../enums/inventory.enum";

// One row of the inventory_item_status view. brand, unit and location are the
// masterfile names behind the ids.
export interface IInventoryItem {
  id: string;
  shop_id: string;
  category_id: string | null;
  category_name: string | null;
  item_code: string;
  name: string;
  brand_id: string | null;
  brand: string | null;
  part_number: string | null;
  fitment: string | null;
  unit_id: string;
  unit: string;
  on_hand: number;
  reorder_level: number;
  selling_price: number | null;
  location_id: string | null;
  location: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  stock_status: StockStatus;
}
