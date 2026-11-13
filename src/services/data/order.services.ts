import type { IMutationResult } from "../../models/common/write.model";
import type { IOrderAddLine } from "../../models/data/order/order.request";
import type { IOrderList, IOrderListLine } from "../../models/data/order/order.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "order_lists";
const linesTable = "order_list_lines";
const columns =
  "id, created_at, lines:order_list_lines(id, item_id, quantity, item:inventory_items(name, item_code, unit, on_hand, category_id))";

const orderServices = {
  // Only one list is open at a time; none open means an empty list.
  getOpen: async (signal?: AbortSignal): Promise<IOrderList | null> => {
    let query = supabase
      .from(table)
      .select(columns)
      .eq("status", "open")
      .order("created_at", { referencedTable: "lines", ascending: true });
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.maybeSingle();
    if (error) throw toError(error);

    return data as unknown as IOrderList | null;
  },

  // Idempotent on the server (items already on the list are skipped), so a replay is harmless.
  addLines: (lines: readonly IOrderAddLine[]): Promise<IMutationResult> =>
    runWrite({
      kind: "rpc",
      fn: "add_to_order_list",
      label: `Add ${lines.length} item${lines.length === 1 ? "" : "s"} to the order list`,
      args: { p_lines: lines },
    }),

  setQuantity: (line: IOrderListLine, quantity: number): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table: linesTable,
      label: `Order ${quantity} × ${line.item.name}`,
      values: { quantity },
      match: { id: line.id },
    }),

  removeLine: (line: IOrderListLine): Promise<IMutationResult> =>
    runWrite({
      kind: "delete",
      table: linesTable,
      label: `Remove ${line.item.name} from the order list`,
      match: { id: line.id },
    }),
};

export default orderServices;
