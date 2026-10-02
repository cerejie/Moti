import type {
  IMovementFilters,
  IMovementFormInput,
} from "../../models/data/movement/movement.request";
import type { IStockMovement } from "../../models/data/movement/movement.response";
import {
  pageRange,
  toPage,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { IMutationResult } from "../../models/common/write.model";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";
import { newWriteId } from "../../utils/write.utils";

const table = "stock_movements";
const columns =
  "id, item_id, item:inventory_items(name, item_code, unit), type, reason, quantity, balance_after, note, created_by_name, created_at";
const itemHistoryLimit = 20;

const movementServices = {
  getList: async (
    filters: IMovementFilters,
    pagination: IPaginationRequest,
    signal?: AbortSignal,
  ): Promise<IPaginationResponse<IStockMovement>> => {
    const [from, to] = pageRange(pagination);
    let query = supabase.from(table).select(columns, { count: "exact" });
    if (filters.type) query = query.eq("type", filters.type);
    if (signal) query = query.abortSignal(signal);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return toPage((data ?? []) as unknown as IStockMovement[], count ?? 0, pagination);
  },

  getRecent: async (limit: number, signal?: AbortSignal): Promise<IStockMovement[]> => {
    let query = supabase.from(table).select(columns);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) throw toError(error);

    return (data ?? []) as unknown as IStockMovement[];
  },

  getByItem: async (itemId: string, signal?: AbortSignal): Promise<IStockMovement[]> => {
    let query = supabase.from(table).select(columns).eq("item_id", itemId);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(itemHistoryLimit);
    if (error) throw toError(error);

    return (data ?? []) as unknown as IStockMovement[];
  },

  // The client id is fixed here, so a queued replay after a lost response is ignored.
  record: (
    itemId: string,
    itemName: string,
    values: IMovementFormInput,
  ): Promise<IMutationResult> =>
    runWrite({
      kind: "rpc",
      fn: "record_movement",
      label: `${values.type === "stock_in" ? "Add" : "Deduct"} ${values.quantity} × ${itemName}`,
      args: {
        p_item_id: itemId,
        p_type: values.type,
        p_reason: values.reason,
        p_quantity: Number(values.quantity),
        p_note: values.note,
        p_client_id: newWriteId(),
      },
    }),
};

export default movementServices;
