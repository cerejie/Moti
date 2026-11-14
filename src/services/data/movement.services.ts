import type { ICountLine } from "../../models/data/count/count.request";
import type { IDeliveryLine } from "../../models/data/delivery/delivery.request";
import type {
  IDamagedFormInput,
  IMovementFilters,
} from "../../models/data/movement/movement.request";
import type { IStockMovement } from "../../models/data/movement/movement.response";
import {
  pageRange,
  toPage,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { IMutationResult } from "../../models/common/write.model";
import { movementViewReasons } from "../../enums/stock.enum";
import { runWrite } from "../../store/common/sync.store";
import { toIlikePattern } from "../../utils/search.utils";
import { supabase, toError } from "../../utils/supabase.utils";
import { newWriteId } from "../../utils/write.utils";

const table = "stock_movements";
const itemAlias = "item";
const columnsWith = (itemJoin: string) =>
  `id, item_id, branch_id, branch:branches(name), transaction_id, ${itemAlias}:${itemJoin}(name, item_code, unit), type, reason, quantity, balance_after, note, created_by_name, created_at`;
const columns = columnsWith("inventory_items");
// An inner join, so a filter on the item's name or code narrows the movements too.
const searchColumns = columnsWith("inventory_items!inner");
const itemHistoryLimit = 20;

const movementServices = {
  getList: async (
    filters: IMovementFilters,
    pagination: IPaginationRequest,
    signal?: AbortSignal,
  ): Promise<IPaginationResponse<IStockMovement>> => {
    const [from, to] = pageRange(pagination);
    const pattern = toIlikePattern(filters.search);
    let query = supabase
      .from(table)
      .select(pattern ? searchColumns : columns, { count: "exact" })
      .in("reason", filters.reasons);
    if (filters.personId) query = query.eq("created_by", filters.personId);
    if (filters.branchId) query = query.eq("branch_id", filters.branchId);
    if (pattern) {
      query = query.or(`name.ilike.${pattern},item_code.ilike.${pattern}`, {
        referencedTable: itemAlias,
      });
    }
    if (signal) query = query.abortSignal(signal);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return toPage((data ?? []) as unknown as IStockMovement[], count ?? 0, pagination);
  },

  // Home's recent list: the same rows Stock history opens on, sales left out.
  getRecent: async (limit: number, signal?: AbortSignal): Promise<IStockMovement[]> => {
    let query = supabase.from(table).select(columns).in("reason", movementViewReasons.changes);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) throw toError(error);

    return (data ?? []) as unknown as IStockMovement[];
  },

  getById: async (id: string, signal?: AbortSignal): Promise<IStockMovement> => {
    let query = supabase.from(table).select(columns).eq("id", id);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.maybeSingle();
    if (error) throw toError(error);
    // RLS hides another shop's movement exactly like a missing id.
    if (!data) throw new Error("This stock change doesn't exist or was removed.");

    return data as unknown as IStockMovement;
  },

  getByItem: async (
    itemId: string,
    branchId?: string,
    signal?: AbortSignal,
  ): Promise<IStockMovement[]> => {
    let query = supabase.from(table).select(columns).eq("item_id", itemId);
    if (branchId) query = query.eq("branch_id", branchId);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(itemHistoryLimit);
    if (error) throw toError(error);

    return (data ?? []) as unknown as IStockMovement[];
  },

  // The client id and branch are fixed here, so a queued replay is ignored, not applied twice.
  recordDamaged: (
    branchId: string,
    itemId: string,
    itemName: string,
    values: IDamagedFormInput,
  ): Promise<IMutationResult> =>
    runWrite({
      kind: "rpc",
      fn: "record_movement",
      label: `Damaged or lost: ${values.quantity} × ${itemName}`,
      args: {
        p_item_id: itemId,
        p_type: "stock_out",
        p_reason: "damaged",
        p_quantity: Number(values.quantity),
        p_note: values.note,
        p_client_id: newWriteId(),
        p_branch_id: branchId,
      },
    }),

  // From an order list, the same save also takes what arrived off that list.
  receiveDelivery: (
    branchId: string,
    lines: readonly IDeliveryLine[],
    note: string,
    orderListId: string | null,
  ): Promise<IMutationResult> => {
    const args = {
      p_lines: lines.map((line) => ({ item_id: line.item.id, quantity: line.quantity })),
      p_note: note,
      p_client_id: newWriteId(),
      p_branch_id: branchId,
    };
    const label = `Receive delivery of ${lines.length} item${lines.length === 1 ? "" : "s"}`;

    return orderListId
      ? runWrite({
          kind: "rpc",
          fn: "receive_order_list",
          label,
          args: { ...args, p_list_id: orderListId },
        })
      : runWrite({ kind: "rpc", fn: "receive_delivery", label, args });
  },

  // Only the lines that differ are sent; on_hand_seen is what the screen showed.
  recordCount: (
    branchId: string,
    lines: readonly ICountLine[],
    note: string,
  ): Promise<IMutationResult> =>
    runWrite({
      kind: "rpc",
      fn: "record_stock_count",
      label: `Stock count of ${lines.length} item${lines.length === 1 ? "" : "s"}`,
      args: {
        p_lines: lines.map((line) => ({
          item_id: line.item.id,
          counted: line.counted,
          on_hand_seen: line.item.on_hand,
        })),
        p_note: note,
        p_client_id: newWriteId(),
        p_branch_id: branchId,
      },
    }),
};

export default movementServices;
