import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type {
  AnalyzerMetric,
  AnalyzerPeriod,
  AnalyzerTab,
  SortDirection,
} from "../../../enums/analyzer.enum";
import type { StockStatus } from "../../../enums/inventory.enum";
import {
  analyzerRankingKey,
  analyzerReorderKey,
  analyzerSummaryKey,
  scopedKey,
} from "../../../keys/query.keys";
import {
  analyzerPeriodKey,
  analyzerTableKey,
  reorderTableKey,
} from "../../../keys/table.keys";
import type {
  IDateRange,
  IPeriodRequest,
  IRankingFilters,
} from "../../../models/data/analyzer/analyzer.request";
import type { IReorderItem, IVolumeRank } from "../../../models/data/analyzer/analyzer.response";
import analyzerServices from "../../../services/data/analyzer.services";
import { periodRange, todayIn } from "../../../utils/date.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { itemPath } from "../inventory/inventory.list.hook";
import { useActiveShop, useShopTimezone } from "../shop/shop.list.hook";

type IViewFilters = {
  tab?: AnalyzerTab;
  period?: AnalyzerPeriod;
  offset?: number;
  from?: string;
  to?: string;
  metric?: AnalyzerMetric;
  direction?: SortDirection;
};

type IToolbarFilters = { category_id?: string; stock_status?: StockStatus };

// The period on screen. Null until the shop's timezone has loaded, because
// "this week" depends on it.
export const useAnalyzerPeriod = () => {
  const { data: timezone } = useShopTimezone();
  const { filters, setFilters } = useFilters<IViewFilters>(analyzerPeriodKey);
  // The store's default page size: TablePagination reads it without defaults.
  const { setPagination } = usePagination(analyzerTableKey);

  const period = filters.period ?? "week";
  const offset = filters.offset ?? 0;

  const range: IDateRange | null = !timezone
    ? null
    : period === "custom" && filters.from && filters.to
      ? { from: filters.from, to: filters.to }
      : periodRange(period === "month" ? "month" : "week", offset, timezone);

  const toFirstPage = () => setPagination({ pageNumber: 1 });

  return {
    period,
    offset,
    range,
    today: timezone ? todayIn(timezone) : null,
    // Custom starts from the range already on screen.
    setPeriod: (next: AnalyzerPeriod) => {
      setFilters(
        next === "custom"
          ? { period: next, from: range?.from, to: range?.to }
          : { period: next, offset: 0 },
      );
      toFirstPage();
    },
    // Never past the current period: there is nothing to rank in the future.
    step: (delta: number) => {
      setFilters({ offset: Math.min(0, offset + delta) });
      toFirstPage();
    },
    setCustomRange: (next: IDateRange) => {
      setFilters(next);
      toFirstPage();
    },
  };
};

export const useAnalyzerView = () => {
  const { filters, setFilters } = useFilters<IViewFilters>(analyzerPeriodKey);
  const { setPagination } = usePagination(analyzerTableKey);

  return {
    tab: filters.tab ?? "ranking",
    metric: filters.metric ?? "sold",
    direction: filters.direction ?? "desc",
    setTab: (tab: AnalyzerTab) => setFilters({ tab }),
    setMetric: (metric: AnalyzerMetric) => {
      setFilters({ metric });
      setPagination({ pageNumber: 1 });
    },
    setDirection: (direction: SortDirection) => {
      setFilters({ direction });
      setPagination({ pageNumber: 1 });
    },
  };
};

// Mounted once, by the ranking panel: it also sends the list back to page one
// when the category or status filter changes.
export const useVolumeRanking = () => {
  const navigate = useNavigate();
  const { shopId } = useActiveShop();
  const { range } = useAnalyzerPeriod();
  const { metric, direction } = useAnalyzerView();
  const { pagination, setPagination } = usePagination(analyzerTableKey);
  const { filters } = useFilters<IToolbarFilters>(analyzerTableKey);

  const filterSignature = `${filters.category_id ?? ""}|${filters.stock_status ?? ""}`;
  const lastSignature = useRef(filterSignature);

  useEffect(() => {
    if (lastSignature.current === filterSignature) return;
    lastSignature.current = filterSignature;
    setPagination({ pageNumber: 1 });
  }, [filterSignature, setPagination]);

  const rankingFilters: IRankingFilters = {
    from: range?.from ?? "",
    to: range?.to ?? "",
    metric,
    direction,
    categoryId: filters.category_id,
    status: filters.stock_status,
  };

  const query = useQuery({
    queryKey: [scopedKey(analyzerRankingKey, shopId), rankingFilters, pagination],
    queryFn: ({ signal }) =>
      analyzerServices.getRanking(shopId ?? "", rankingFilters, pagination, signal),
    enabled: Boolean(shopId && range),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    // Still loading while the period waits on the shop's timezone.
    isLoading: query.isLoading || !range,
    range,
    metric,
    openItem: (row: IVolumeRank) => navigate(itemPath(row.item_id)),
  };
};

// Whole-shop totals for the period; the ranking's filters do not apply.
export const usePeriodSummary = () => {
  const { shopId } = useActiveShop();
  const { range } = useAnalyzerPeriod();
  const { metric } = useAnalyzerView();

  const request: IPeriodRequest = { from: range?.from ?? "", to: range?.to ?? "", metric };

  const query = useQuery({
    queryKey: [scopedKey(analyzerSummaryKey, shopId), request],
    queryFn: ({ signal }) => analyzerServices.getSummary(shopId ?? "", request, signal),
    enabled: Boolean(shopId && range),
    placeholderData: keepPreviousData,
  });

  return { ...query, isLoading: query.isLoading || !range, metric };
};

export const useReorderItems = () => {
  const navigate = useNavigate();
  const { shopId } = useActiveShop();
  const { pagination } = usePagination(reorderTableKey);

  const query = useQuery({
    queryKey: [scopedKey(analyzerReorderKey, shopId), pagination],
    queryFn: ({ signal }) =>
      analyzerServices.getReorderItems(shopId ?? "", pagination, signal),
    enabled: Boolean(shopId),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    openItem: (row: IReorderItem) => navigate(itemPath(row.id)),
  };
};
