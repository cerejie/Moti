import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  defaultAnalysisPeriod,
  fastMoverLimit,
  orderNextLimit,
  type AnalysisPeriod,
} from "../../../enums/analyzer.enum";
import { stockAnalysisKey } from "../../../keys/query.keys";
import { reorderKey } from "../../../keys/table.keys";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import analyzerServices from "../../../services/data/analyzer.services";
import { useFilters } from "../../common/filter.hook";

export interface IStockAnalysisGroups {
  orderNow: IStockAnalysisRow[];
  lowSoon: IStockAnalysisRow[];
  fastMovers: IStockAnalysisRow[];
  slowStock: IStockAnalysisRow[];
}

const lastSoldTime = (row: IStockAnalysisRow) =>
  row.last_sold_at ? new Date(row.last_sold_at).getTime() : 0;

// The RPC already orders by days left; out-of-stock items still lead Order now.
const toGroups = (rows: IStockAnalysisRow[]): IStockAnalysisGroups => ({
  orderNow: rows
    .filter((row) => row.analysis_group === "order_now")
    .sort((a, b) => Number(b.stock_status === "out") - Number(a.stock_status === "out")),
  lowSoon: rows.filter((row) => row.analysis_group === "low_soon"),
  fastMovers: rows
    .filter((row) => row.sold_units > 0)
    .sort((a, b) => b.sold_units - a.sold_units || b.sale_count - a.sale_count)
    .slice(0, fastMoverLimit),
  // Longest without a sale first; never sold leads.
  slowStock: rows
    .filter((row) => row.analysis_group === "slow")
    .sort((a, b) => lastSoldTime(a) - lastSoldTime(b)),
});

const analysisQuery = (period: AnalysisPeriod) => ({
  queryKey: [stockAnalysisKey, "shop", period],
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    analyzerServices.getAnalysis({ period }, signal),
});

export const useStockAnalysis = () => {
  const { filters, setFilters } = useFilters<{ period?: AnalysisPeriod }>(reorderKey);
  const period = filters.period ?? defaultAnalysisPeriod;

  const query = useQuery({
    ...analysisQuery(period),
    select: toGroups,
    placeholderData: keepPreviousData,
  });

  return {
    query,
    period,
    setPeriod: (next: AnalysisPeriod) => setFilters({ period: next }),
  };
};

// Home's card always reads the default period, so it shares the Reorder view's cache there.
export const useOrderNext = (enabled = true) =>
  useQuery({
    ...analysisQuery(defaultAnalysisPeriod),
    select: (rows: IStockAnalysisRow[]) => toGroups(rows).orderNow.slice(0, orderNextLimit),
    enabled,
  });

export const useItemSalesPace = (itemId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: [stockAnalysisKey, "item", itemId],
    queryFn: ({ signal }) =>
      analyzerServices.getAnalysis({ period: defaultAnalysisPeriod, itemId }, signal),
    select: (rows: IStockAnalysisRow[]) => rows[0] ?? null,
    enabled: enabled && Boolean(itemId),
  });
