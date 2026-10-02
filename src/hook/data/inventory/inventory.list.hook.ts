import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { InventoryView } from "../../../enums/stock.enum";
import {
  inventoryListKey,
  inventorySummaryKey,
  stockAlertsKey,
} from "../../../keys/query.keys";
import { inventoryTableKey } from "../../../keys/table.keys";
import inventoryServices from "../../../services/data/inventory.services";
import { usePaginationStore } from "../../../store/common/pagination.store";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";

type IInventoryFilterValues = {
  view?: InventoryView;
  categoryId?: string;
};

// Alerts are the owner's monitor, so they refresh on their own while the app is open.
const alertsRefreshMs = 60_000;

export const useInventoryList = () => {
  const { filters, setFilters } = useFilters<IInventoryFilterValues>(inventoryTableKey);
  const search = useDebouncedSearch(inventoryTableKey, inventoryTableKey);
  const { pagination } = usePagination(inventoryTableKey);
  const setPaginationAt = usePaginationStore((state) => state.setPagination);

  const view = filters.view ?? "all";
  const categoryId = filters.categoryId;

  // A new filter is a new result set; the old page offset no longer applies.
  useEffect(() => {
    setPaginationAt(inventoryTableKey, { pageNumber: 1 });
  }, [view, categoryId, setPaginationAt]);

  const query = useQuery({
    queryKey: [
      inventoryListKey,
      view,
      categoryId,
      search,
      pagination.pageNumber,
      pagination.pageSize,
    ],
    queryFn: ({ signal }) =>
      inventoryServices.getList({ view, categoryId, search }, pagination, signal),
    placeholderData: keepPreviousData,
  });

  return {
    query,
    view,
    setView: (next: InventoryView) => setFilters({ view: next }),
  };
};

export const useInventorySummary = (enabled = true) =>
  useQuery({
    queryKey: [inventorySummaryKey],
    queryFn: ({ signal }) => inventoryServices.getSummary(signal),
    enabled,
  });

export const useStockAlerts = (enabled = true) =>
  useQuery({
    queryKey: [stockAlertsKey],
    queryFn: ({ signal }) => inventoryServices.getAlerts(signal),
    enabled,
    refetchInterval: alertsRefreshMs,
  });
