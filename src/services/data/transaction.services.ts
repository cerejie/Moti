import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../models/common/pagination.model";
import { totalPages } from "../../models/common/pagination.model";
import type {
  ICartLine,
  ITransactionFilters,
  IVoidTransactionRequest,
} from "../../models/data/transaction/transaction.request";
import type {
  ICreateTransactionResult,
  ITransaction,
  ITransactionLine,
} from "../../models/data/transaction/transaction.response";
import { runWrite } from "../../store/common/sync.store";
import { formatTransactionNo } from "../../utils/format.utils";
import { supabase, toError } from "../../utils/supabase.utils";

const view = "transaction_history";
const columns =
  "id, shop_id, transaction_no, status, total_amount, line_count, occurred_at, created_by, created_by_name, voided_by, voided_by_name, voided_at, void_reason";
const lineColumns =
  "id, transaction_id, item_id, item_name, item_code, item_unit, quantity, unit_price, line_amount";

// "#12", "12" or "no. 12" all find transaction 12. Nine digits stays inside a Postgres integer.
const transactionNoOf = (search: string) => {
  const digits = search.replace(/\D/g, "").slice(0, 9);
  return digits === "" ? null : Number(digits);
};

const transactionServices = {
  getList: async (
    shopId: string,
    filters: ITransactionFilters,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<ITransaction>> => {
    const from = (pagination.pageNumber - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    let query = supabase
      .from(view)
      .select(columns, { count: "exact" })
      .eq("shop_id", shopId);

    if (filters.tab !== "all") query = query.eq("status", filters.tab);
    const transactionNo = transactionNoOf(filters.search);
    if (transactionNo !== null) query = query.eq("transaction_no", transactionNo);
    if (filters.occurredFrom) query = query.gte("occurred_at", filters.occurredFrom);
    if (filters.occurredBefore) query = query.lt("occurred_at", filters.occurredBefore);

    const { data, error, count } = await query
      .order("occurred_at", { ascending: false })
      .order("transaction_no", { ascending: false })
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    const totalCount = count ?? 0;
    return {
      data: (data ?? []) as ITransaction[],
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalPages: totalPages(totalCount, pagination.pageSize),
      totalCount,
    };
  },

  // A transaction holds at most 100 lines, so they are read in one go.
  getLines: async (transactionId: string, signal: AbortSignal): Promise<ITransactionLine[]> => {
    const { data, error } = await supabase
      .from("transaction_line_details")
      .select(lineColumns)
      .eq("transaction_id", transactionId)
      .order("item_name")
      .abortSignal(signal);
    if (error) throw toError(error);

    return (data ?? []) as ITransactionLine[];
  },

  // One write for the whole cart; client_id makes a replay return the saved transaction.
  create: async (
    shopId: string,
    clientId: string,
    lines: ICartLine[],
  ): Promise<ICreateTransactionResult> => {
    const units = lines.reduce((sum, line) => sum + line.quantity, 0);
    const result = await runWrite({
      kind: "rpc",
      fn: "create_transaction",
      label: `Transaction · ${units} ${units === 1 ? "item" : "items"}`,
      args: {
        p_client_id: clientId,
        p_shop_id: shopId,
        p_lines: lines.map((line) => ({
          item_id: line.item_id,
          quantity: line.quantity,
          unit_price: line.unit_price,
        })),
        // A queued transaction keeps the time it happened; the server clamps a future time to now.
        p_occurred_at: new Date().toISOString(),
      },
    });

    if (result.queued) return { queued: true, transactionNo: null };

    // The transaction is already saved; a failed read only costs the number on the success view.
    const { data } = await supabase
      .from("transactions")
      .select("transaction_no")
      .eq("client_id", clientId)
      .maybeSingle();

    return { queued: false, transactionNo: data?.transaction_no ?? null };
  },

  void: (transaction: ITransaction, values: IVoidTransactionRequest) =>
    runWrite({
      kind: "rpc",
      fn: "void_transaction",
      label: `Void ${formatTransactionNo(transaction.transaction_no)}`,
      args: { p_id: transaction.id, p_reason: values.reason.trim() },
    }),
};

export default transactionServices;
