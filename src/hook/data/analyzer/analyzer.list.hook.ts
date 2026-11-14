import { useQuery } from "@tanstack/react-query";
import {
  defaultAnalysisPeriod,
  fastMoverLimit,
  orderNextLimit,
  type AnalysisPeriod,
  type CoverDays,
  type WhatToBuyView,
} from "../../../enums/analyzer.enum";
import { stockAnalysisKey } from "../../../keys/query.keys";
import { reorderKey } from "../../../keys/table.keys";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import analyzerServices from "../../../services/data/analyzer.services";
import { selectCoverDays, useAnalyzerStore } from "../../../store/data/analyzer/analyzer.store";
import { useFilters } from "../../common/filter.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";

export interface IStockAnalysisGroups {
  buySoon: IStockAnalysisRow[];
  mostSold: IStockAnalysisRow[];
  slowStock: IStockAnalysisRow[];
}

const lastSoldTime = (row: IStockAnalysisRow) =>
  row.last_sold_at ? new Date(row.last_sold_at).getTime() : 0;

// Out first, then Low (or short in a branch), then the fewest days left; the RPC already
// orders by days left, and Array.sort is stable.
const urgency = (row: IStockAnalysisRow) => {
  if (row.stock_status === "out") return 0;
  if (row.stock_status === "low" || (row.short_branches ?? 0) > 0) return 1;
  return 2;
};

const toGroups = (rows: IStockAnalysisRow[]): IStockAnalysisGroups => ({
  buySoon: [
    ...rows
      .filter((row) => row.analysis_group === "order_now")
      .sort((a, b) => urgency(a) - urgency(b)),
    ...rows.filter((row) => row.analysis_group === "low_soon"),
  ],
  // Units sold, never revenue or the number of sales.
  mostSold: rows
    .filter((row) => row.sold_units > 0)
    .sort((a, b) => b.sold_units - a.sold_units || b.sale_count - a.sale_count)
    .slice(0, fastMoverLimit),
  // Longest without a sale first; never sold leads.
  slowStock: rows
    .filter((row) => row.analysis_group === "slow")
    .sort((a, b) => lastSoldTime(a) - lastSoldTime(b)),
});

// The branch and cover target every analysis is worked out for; the branch matches Stocks.
export const useAnalysisScope = () => {
  const { writeBranch, multiple } = useActiveBranch();
  const coverDays = useAnalyzerStore(selectCoverDays);

  return {
    branchId: writeBranch?.id,
    // Named only when the shop has more than one branch.
    scopeLabel: multiple ? (writeBranch?.name ?? "All branches") : null,
    aggregate: multiple && !writeBranch,
    // The picked branch's name when it carries no products, so an empty list isn't read as "all fine".
    emptyBranch: writeBranch && (writeBranch.branch_stock[0]?.count ?? 0) === 0 ? writeBranch.name : null,
    coverDays,
  };
};

// The branch, period and cover target are all in the key, so one never reads another's cache.
const analysisQuery = (period: AnalysisPeriod, coverDays: CoverDays, branchId?: string) => ({
  queryKey: [stockAnalysisKey, "shop", branchId, period, coverDays],
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    analyzerServices.getAnalysis({ period, coverDays, branchId }, signal),
});

type IWhatToBuyFilters = { period?: AnalysisPeriod; view?: WhatToBuyView };

export const useStockAnalysis = () => {
  const { filters, setFilters } = useFilters<IWhatToBuyFilters>(reorderKey);
  const { branchId, coverDays } = useAnalysisScope();
  const period = filters.period ?? defaultAnalysisPeriod;
  const view = filters.view ?? "buy_soon";

  // No placeholder: a period change shows loading, never the old period's rows under the new label.
  const query = useQuery({
    ...analysisQuery(period, coverDays, branchId),
    select: toGroups,
  });

  return {
    query,
    period,
    view,
    coverDays,
    setPeriod: (next: AnalysisPeriod) => setFilters({ period: next }),
    setView: (next: WhatToBuyView) => setFilters({ view: next }),
  };
};

export const useOrderNext = (enabled = true) => {
  const { branchId, coverDays } = useAnalysisScope();

  return useQuery({
    ...analysisQuery(defaultAnalysisPeriod, coverDays, branchId),
    select: (rows: IStockAnalysisRow[]) => toGroups(rows).buySoon.slice(0, orderNextLimit),
    enabled,
  });
};

export const useItemSalesPace = (itemId: string | undefined, enabled: boolean) => {
  const { branchId, coverDays } = useAnalysisScope();

  const query = useQuery({
    queryKey: [stockAnalysisKey, "item", itemId, branchId, coverDays],
    queryFn: ({ signal }) =>
      analyzerServices.getAnalysis(
        { period: defaultAnalysisPeriod, coverDays, itemId, branchId },
        signal,
      ),
    select: (rows: IStockAnalysisRow[]) => rows[0] ?? null,
    enabled: enabled && Boolean(itemId),
  });

  return { query, coverDays };
};
