export interface IShopOption {
  id: string;
  name: string;
  is_active: boolean;
}

// One row of the superadmin's Shops list.
export interface IShop {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  // Every profile in the shop, owners and employees alike.
  staff_count: number;
}

export interface IShopSettings {
  shop_id: string;
  default_reorder_level: number;
  low_stock_margin_pct: number;
  timezone: string;
}
