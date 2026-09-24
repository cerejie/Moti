import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../models/common/pagination.model";
import { totalPages } from "../../models/common/pagination.model";
import type {
  IPeriodRequest,
  IRankingFilters,
} from "../../models/data/analyzer/analyzer.request";
import type {
  IPeriodSummary,
  IReorderItem,
  IVolumeRank,
} from "../../models/data/analyzer/analyzer.response";
import { supabase, toError } from "../../utils/supabase.utils";

const rankingColumns =
  "rank, item_id, name, sku, unit, category_id, category_name, quantity, transaction_count, on_hand, reorder_level, stock_status";
const summaryColumns =
  "total_units, item_count, top_item_id, top_item_name, top_item_unit, top_item_quantity, unsold_stocked_count";
const reorderColumns =
  "id, category_name, sku, name, unit, on_hand, reorder_level, stock_status, severity, sold_30d";

const pageRange = (pagination: IPaginationRequest) => {
  const from = (pagination.pageNumber - 1) * pagination.pageSize;
  return [from, from + pagination.pageSize - 1] as const;
};

// The client is untyped, so an RPC's rows arrive as a row-or-rows union.
const toPage = <T>(
  data: unknown,
  count: number | null,
  pagination: IPaginationRequest,
): IPaginationResponse<T> => {
  const totalCount = count ?? 0;
  return {
    data: (data ?? []) as T[],
    currentPage: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalPages: totalPages(totalCount, pagination.pageSize),
    totalCount,
  };
};

const analyzerServices = {
  // Ranked on the server inside the filters; the direction only flips the order.
  getRanking: async (
    shopId: string,
    filters: IRankingFilters,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<IVolumeRank>> => {
    const [from, to] = pageRange(pagination);

    const { data, error, count } = await supabase
      .rpc(
        "analyzer_volume_ranking",
        {
          p_shop_id: shopId,
          p_from: filters.from,
          p_to: filters.to,
          p_metric: filters.metric,
          p_category_id: filters.categoryId ?? null,
          p_status: filters.status ?? null,
        },
        { count: "exact" },
      )
      .select(rankingColumns)
      .order("rank", { ascending: filters.direction === "desc" })
      .order("name")
      .order("item_id")
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    return toPage<IVolumeRank>(data, count, pagination);
  },

  getSummary: async (
    shopId: string,
    request: IPeriodRequest,
    signal: AbortSignal,
  ): Promise<IPeriodSummary> => {
    const { data, error } = await supabase
      .rpc("analyzer_period_summary", {
        p_shop_id: shopId,
        p_from: request.from,
        p_to: request.to,
        p_metric: request.metric,
      })
      .select(summaryColumns)
      .abortSignal(signal)
      .single();
    if (error) throw toError(error);
    return data as IPeriodSummary;
  },

  getReorderItems: async (
    shopId: string,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<IReorderItem>> => {
    const [from, to] = pageRange(pagination);

    const { data, error, count } = await supabase
      .rpc("analyzer_reorder_items", { p_shop_id: shopId }, { count: "exact" })
      .select(reorderColumns)
      .order("severity")
      .order("sold_30d", { ascending: false })
      .order("name")
      .order("id")
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    return toPage<IReorderItem>(data, count, pagination);
  },
};

export default analyzerServices;
