import { movementModeTypes, movementReasonLabels } from "../../enums/movement.enum";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../models/common/pagination.model";
import { totalPages } from "../../models/common/pagination.model";
import type { IInventoryItem } from "../../models/data/inventory/inventory.response";
import type {
  IMovementFilters,
  IStockMovementRequest,
} from "../../models/data/movement/movement.request";
import type { IStockMovement } from "../../models/data/movement/movement.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const view = "stock_movement_history";
const columns =
  "id, shop_id, item_id, item_name, item_sku, item_unit, movement_type, reason, quantity, balance_after, note, occurred_at, created_by, created_by_name";

// LIKE wildcards typed by the user are matched literally.
const likePattern = (search: string) =>
  `%${search.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;

const toPage = (
  data: unknown[] | null,
  count: number | null,
  pagination: IPaginationRequest,
): IPaginationResponse<IStockMovement> => {
  const totalCount = count ?? 0;
  return {
    data: (data ?? []) as IStockMovement[],
    currentPage: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalPages: totalPages(totalCount, pagination.pageSize),
    totalCount,
  };
};

const pageRange = (pagination: IPaginationRequest) => {
  const from = (pagination.pageNumber - 1) * pagination.pageSize;
  return [from, from + pagination.pageSize - 1] as const;
};

const movementServices = {
  getList: async (
    shopId: string,
    filters: IMovementFilters,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<IStockMovement>> => {
    const [from, to] = pageRange(pagination);

    let query = supabase
      .from(view)
      .select(columns, { count: "exact" })
      .eq("shop_id", shopId);

    if (filters.tab !== "all") query = query.eq("movement_type", filters.tab);
    if (filters.reason) query = query.eq("reason", filters.reason);
    if (filters.search) query = query.ilike("item_search_text", likePattern(filters.search));

    const { data, error, count } = await query
      .order("occurred_at", { ascending: false })
      .order("id")
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    return toPage(data, count, pagination);
  },

  getByItem: async (
    itemId: string,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<IStockMovement>> => {
    const [from, to] = pageRange(pagination);

    const { data, error, count } = await supabase
      .from(view)
      .select(columns, { count: "exact" })
      .eq("item_id", itemId)
      .order("occurred_at", { ascending: false })
      .order("id")
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    return toPage(data, count, pagination);
  },

  // client_id comes from the form, so a replay or a retried submit is ignored by the server.
  record: (item: IInventoryItem, values: IStockMovementRequest) =>
    runWrite({
      kind: "rpc",
      fn: "record_stock_movement",
      label: `${movementReasonLabels[values.reason]} · ${values.quantity} ${item.unit} ${item.name}`,
      args: {
        p_client_id: values.client_id,
        p_item_id: item.id,
        p_type: movementModeTypes[values.mode],
        p_reason: values.reason,
        p_quantity: Number(values.quantity),
        p_note: values.note.trim() === "" ? null : values.note.trim(),
        // A queued sale keeps the time it happened; the server clamps a future time to now.
        p_occurred_at: new Date().toISOString(),
      },
    }),
};

export default movementServices;
