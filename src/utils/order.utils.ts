import type { IStockAnalysisRow } from "../models/data/analyzer/analyzer.response";
import type { IOrderListLine } from "../models/data/order/order.response";
import { formatLongDate, formatNumber } from "./format.utils";

// The analyzer's suggestion; without one (too few sales), enough to clear the warning quantity.
export const orderQuantityFor = (row: IStockAnalysisRow): number => {
  if (row.suggested_quantity !== null && row.suggested_quantity > 0) return row.suggested_quantity;
  return Math.max(1, row.reorder_level - row.on_hand + 1);
};

// Plain text a supplier can read in any chat app.
export const toOrderListText = (lines: readonly IOrderListLine[], date: string): string =>
  [
    `Buying list — ${formatLongDate(date)}`,
    "",
    ...lines.map(
      ({ item, quantity }) =>
        `• ${item.name} (${item.item_code}) — ${formatNumber(quantity)} ${item.unit}`,
    ),
  ].join("\n");
