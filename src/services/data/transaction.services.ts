import type {
  ICartLine,
  ITransactionFilters,
} from "../../models/data/transaction/transaction.request";
import type {
  ITransaction,
  ITransactionLine,
} from "../../models/data/transaction/transaction.response";
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

const table = "transactions";
const columns =
  "id, number, status, line_count, total_quantity, total_amount, note, created_by_name, created_at, voided_at, voided_by_name, void_reason";
const lineColumns = "id, item_id, item:inventory_items(name, item_code, unit), quantity, unit_price";

const transactionServices = {
  getList: async (
    filters: ITransactionFilters,
    pagination: IPaginationRequest,
    signal?: AbortSignal,
  ): Promise<IPaginationResponse<ITransaction>> => {
    const [from, to] = pageRange(pagination);
    let query = supabase.from(table).select(columns, { count: "exact" });
    if (filters.status) query = query.eq("status", filters.status);
    if (signal) query = query.abortSignal(signal);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return toPage((data ?? []) as ITransaction[], count ?? 0, pagination);
  },

  getLines: async (transactionId: string, signal?: AbortSignal): Promise<ITransactionLine[]> => {
    let query = supabase
      .from("stock_movements")
      .select(lineColumns)
      .eq("transaction_id", transactionId)
      .eq("reason", "sale");
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("created_at");
    if (error) throw toError(error);

    return (data ?? []) as unknown as ITransactionLine[];
  },

  // The client id is fixed here, so a queued replay after a lost response is ignored.
  checkout: (lines: ICartLine[], note: string): Promise<IMutationResult> =>
    runWrite({
      kind: "rpc",
      fn: "record_transaction",
      label: `Transaction of ${lines.length} item${lines.length === 1 ? "" : "s"}`,
      args: {
        p_lines: lines.map((line) => ({ item_id: line.item.id, quantity: line.quantity })),
        p_note: note,
        p_client_id: newWriteId(),
      },
    }),

  void: (transaction: ITransaction, reason: string): Promise<IMutationResult> =>
    runWrite({
      kind: "rpc",
      fn: "void_transaction",
      label: `Void transaction #${transaction.number}`,
      args: { p_transaction_id: transaction.id, p_reason: reason },
    }),
};

export default transactionServices;
