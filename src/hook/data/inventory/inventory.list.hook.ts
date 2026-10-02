import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { InventoryView } from "../../../enums/stock.enum";
import {
  inventoryListKey,
  inventorySummaryKey,
  stockAlertsKey,
} from "../../../keys/query.keys";
import { inventoryTableKey } from "../../../keys/table.keys";
import inventoryServices from "../../../services/data/inventory.services";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";

type IInventoryFilterValues = {
  view?: InventoryView;
  categoryId?: string;
  brandId?: string;
};

// Alerts are the owner's monitor, so they refresh on their own while the app is open.
const alertsRefreshMs = 60_000;

export const useInventoryList = () => {
  const { filters, setFilters } = useFilters<IInventoryFilterValues>(inventoryTableKey);
  const search = useDebouncedSearch(inventoryTableKey, inventoryTableKey);
  const { pagination } = usePagination(inventoryTableKey);

  const view = filters.view ?? "all";
  const categoryId = filters.categoryId;
  const brandId = filters.brandId;

  const query = useQuery({
    queryKey: [
      inventoryListKey,
      view,
      categoryId,
      brandId,
      search,
      pagination.pageNumber,
      pagination.pageSize,
    ],
    queryFn: ({ signal }) =>
      inventoryServices.getList({ view, categoryId, brandId, search }, pagination, signal),
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
