import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryView } from "../../../enums/stock.enum";
import {
  inventoryListKey,
  inventorySummaryKey,
  stockAlertsKey,
} from "../../../keys/query.keys";
import { inventoryTableKey } from "../../../keys/table.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import inventoryServices from "../../../services/data/inventory.services";
import { findCachedRow } from "../../../utils/query.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";

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

  // One branch (picked, or the only one in reach) lists what it carries; else the totals.
  const branchId = useActiveBranch().writeBranch?.id;

  const view = filters.view ?? "all";
  const categoryId = filters.categoryId;
  const brandId = filters.brandId;

  const query = useQuery({
    queryKey: [
      inventoryListKey,
      branchId,
      view,
      categoryId,
      brandId,
      search,
      pagination.pageNumber,
      pagination.pageSize,
    ],
    queryFn: ({ signal }) =>
      inventoryServices.getList(
        { view, categoryId, brandId, search, branchId, carriedOnly: true },
        pagination,
        signal,
      ),
    placeholderData: keepPreviousData,
  });

  return {
    query,
    view,
    setView: (next: InventoryView) => setFilters({ view: next }),
  };
};

type IPickFilterValues = {
  categoryId?: string;
  brandId?: string;
};

// The items a sale, delivery, count or write-off picks from: every active item, out-of-stock
// ones included. Each picker keeps its own search, filters and page under its table key.
// With a branch, the stock shown is that branch's (the Sell picker); without, the total.
export const useItemPickList = (
  tableKey: string,
  topSellersFirst = false,
  branchId?: string,
) => {
  const { filters } = useFilters<IPickFilterValues>(tableKey);
  const search = useDebouncedSearch(tableKey, tableKey);
  const { pagination } = usePagination(tableKey);
  const { categoryId, brandId } = filters;

  const query = useQuery({
    queryKey: [
      inventoryListKey,
      "pick",
      tableKey,
      topSellersFirst,
      branchId,
      categoryId,
      brandId,
      search,
      pagination.pageNumber,
      pagination.pageSize,
    ],
    queryFn: ({ signal }) =>
      inventoryServices.getList(
        { view: "all", categoryId, brandId, search, topSellersFirst, branchId },
        pagination,
        signal,
      ),
    placeholderData: keepPreviousData,
  });

  return { query, categoryId };
};

// Keyed under the list prefix, so every stock, edit and archive invalidation refreshes it too.
// The cached row shown first may hold another branch's count until the fetch lands.
export const useInventoryItem = (itemId: string | undefined) => {
  const queryClient = useQueryClient();
  const branchId = useActiveBranch().writeBranch?.id;

  return useQuery<IInventoryItem>({
    queryKey: [inventoryListKey, "item", itemId, branchId],
    queryFn: ({ signal }) => inventoryServices.getById(itemId ?? "", branchId, signal),
    enabled: Boolean(itemId),
    placeholderData: () => findCachedRow<IInventoryItem>(queryClient, inventoryListKey, itemId),
  });
};

export const useItemBranchStock = (itemId: string) =>
  useQuery({
    queryKey: [inventoryListKey, "by-branch", itemId],
    queryFn: ({ signal }) => inventoryServices.getBranchStock(itemId, signal),
  });

// The same branch as the inventory list: one branch's carried items, else the totals.
export const useInventorySummary = (enabled = true) => {
  const branchId = useActiveBranch().writeBranch?.id;

  return useQuery({
    queryKey: [inventorySummaryKey, branchId],
    queryFn: ({ signal }) => inventoryServices.getSummary(branchId, signal),
    enabled,
  });
};

// Without a branch, one row per low or out shelf in every branch in reach.
export const useStockAlerts = (enabled = true) => {
  const branchId = useActiveBranch().writeBranch?.id;

  return useQuery({
    queryKey: [stockAlertsKey, branchId],
    queryFn: ({ signal }) => inventoryServices.getAlerts(branchId, signal),
    enabled,
    refetchInterval: alertsRefreshMs,
  });
};
