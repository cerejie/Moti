import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  movementViewReasons,
  type MovementView,
  type StockTab,
} from "../../../enums/stock.enum";
import { itemMovementsKey, movementListKey } from "../../../keys/query.keys";
import { movementTableKey, stockTabKey } from "../../../keys/table.keys";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import movementServices from "../../../services/data/movement.services";
import { findCachedRow } from "../../../utils/query.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";

type IMovementFilterValues = {
  view?: MovementView;
  personId?: string;
};

const recentLimit = 5;

// A ledger is read in long runs, so Stock history pages wider than the other tables.
export const movementPageDefaults = { pageSize: 20 } as const;

export const useMovementList = () => {
  const { filters, setFilters } = useFilters<IMovementFilterValues>(movementTableKey);
  const search = useDebouncedSearch(movementTableKey, movementTableKey);
  const { pagination } = usePagination(movementTableKey, movementPageDefaults);

  // Follows the header switcher; "All branches" lists every branch the account can see.
  const branchId = useActiveBranch().branch?.id;

  const view = filters.view ?? "changes";
  const personId = filters.personId;

  const query = useQuery({
    queryKey: [
      movementListKey,
      branchId,
      view,
      personId,
      search,
      pagination.pageNumber,
      pagination.pageSize,
    ],
    queryFn: ({ signal }) =>
      movementServices.getList(
        { reasons: movementViewReasons[view], personId, search, branchId },
        pagination,
        signal,
      ),
    placeholderData: keepPreviousData,
  });

  return {
    query,
    view,
    setView: (next: MovementView) => setFilters({ view: next }),
    // A search or a person narrowed the list, so an empty result is "no match", not "none yet".
    narrowed: search !== "" || Boolean(personId),
  };
};

// The Stock page's tab; Home's links set it before they open the page.
export const useStockTab = () => {
  const { filters, setFilters } = useFilters<{ tab?: StockTab }>(stockTabKey);

  return {
    tab: filters.tab ?? "reorder",
    setTab: (next: StockTab) => setFilters({ tab: next }),
  };
};

// Follows the switcher like Stock history.
export const useRecentMovements = (enabled = true) => {
  const branchId = useActiveBranch().branch?.id;

  return useQuery({
    queryKey: [movementListKey, "recent", branchId],
    queryFn: ({ signal }) => movementServices.getRecent(recentLimit, branchId, signal),
    enabled,
  });
};

// Keyed under the list prefix, so the invalidations after a stock change refresh it too.
export const useMovement = (movementId: string | undefined) => {
  const queryClient = useQueryClient();

  return useQuery<IStockMovement>({
    queryKey: [movementListKey, "detail", movementId],
    queryFn: ({ signal }) => movementServices.getById(movementId ?? "", signal),
    enabled: Boolean(movementId),
    placeholderData: () => findCachedRow<IStockMovement>(queryClient, movementListKey, movementId),
  });
};

// The same branch as the item page's hero, so each balance reads against the count above it.
export const useItemMovements = (itemId: string | undefined, enabled: boolean) => {
  const branchId = useActiveBranch().writeBranch?.id;

  return useQuery({
    queryKey: [itemMovementsKey, itemId, branchId],
    queryFn: ({ signal }) => movementServices.getByItem(itemId ?? "", branchId, signal),
    enabled: enabled && Boolean(itemId),
  });
};
