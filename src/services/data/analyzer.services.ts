import {
  analysisCoverDays,
  analysisMinSales,
  analysisSlowDays,
} from "../../enums/analyzer.enum";
import type { IStockAnalysisFilters } from "../../models/data/analyzer/analyzer.request";
import type { IStockAnalysisRow } from "../../models/data/analyzer/analyzer.response";
import { supabase, toError } from "../../utils/supabase.utils";

type IRawAnalysisRow = Omit<IStockAnalysisRow, "pace" | "days_left"> & {
  pace: number | string | null;
  days_left: number | string | null;
};

// numeric columns can arrive as strings.
const toNumberOrNull = (value: number | string | null) => (value === null ? null : Number(value));

const analyzerServices = {
  getAnalysis: async (
    filters: IStockAnalysisFilters,
    signal?: AbortSignal,
  ): Promise<IStockAnalysisRow[]> => {
    let query = supabase.rpc("stock_analysis", {
      p_days: Number(filters.period),
      p_cover_days: analysisCoverDays,
      p_slow_days: analysisSlowDays,
      p_min_sales: analysisMinSales,
      p_item_id: filters.itemId ?? null,
    });
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw toError(error);

    return ((data ?? []) as IRawAnalysisRow[]).map((row) => ({
      ...row,
      pace: toNumberOrNull(row.pace),
      days_left: toNumberOrNull(row.days_left),
    }));
  },
};

export default analyzerServices;
