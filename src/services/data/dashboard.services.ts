import type {
  IStockAlert,
  IStockAlerts,
  IStockSummary,
} from "../../models/data/dashboard/dashboard.response";
import { supabase, toError } from "../../utils/supabase.utils";

const summaryView = "inventory_stock_summary";
const summaryColumns =
  "shop_id, item_count, units_on_hand, in_stock_count, low_count, reorder_count, out_of_stock_count";

const alertsView = "inventory_attention_items";
const alertColumns =
  "id, shop_id, category_name, sku, name, unit, on_hand, reorder_level, stock_status, severity";

const emptySummary = (shopId: string): IStockSummary => ({
  shop_id: shopId,
  item_count: 0,
  units_on_hand: 0,
  in_stock_count: 0,
  low_count: 0,
  reorder_count: 0,
  out_of_stock_count: 0,
});

const dashboardServices = {
  // A shop with no active items has no summary row.
  getSummary: async (shopId: string, signal: AbortSignal): Promise<IStockSummary> => {
    const { data, error } = await supabase
      .from(summaryView)
      .select(summaryColumns)
      .eq("shop_id", shopId)
      .abortSignal(signal)
      .maybeSingle();
    if (error) throw toError(error);
    return (data as IStockSummary | null) ?? emptySummary(shopId);
  },

  getAlerts: async (
    shopId: string,
    limit: number,
    signal: AbortSignal,
  ): Promise<IStockAlerts> => {
    const { data, error, count } = await supabase
      .from(alertsView)
      .select(alertColumns, { count: "exact" })
      .eq("shop_id", shopId)
      .order("severity")
      .order("on_hand")
      .order("name")
      .order("id")
      .range(0, limit - 1)
      .abortSignal(signal);
    if (error) throw toError(error);
    return { data: (data ?? []) as IStockAlert[], totalCount: count ?? 0 };
  },
};

export default dashboardServices;
