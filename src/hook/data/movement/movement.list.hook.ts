import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { movementViewReasons, type MovementView } from "../../../enums/stock.enum";
import { itemMovementsKey, movementListKey } from "../../../keys/query.keys";
import { movementTableKey } from "../../../keys/table.keys";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import movementServices from "../../../services/data/movement.services";
import { findCachedRow } from "../../../utils/query.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";

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

  const view = filters.view ?? "changes";
  const personId = filters.personId;

  const query = useQuery({
    queryKey: [
      movementListKey,
      view,
      personId,
      search,
      pagination.pageNumber,
      pagination.pageSize,
    ],
    queryFn: ({ signal }) =>
      movementServices.getList(
        { reasons: movementViewReasons[view], personId, search },
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

export const useRecentMovements = (enabled = true) =>
  useQuery({
    queryKey: [movementListKey, "recent"],
    queryFn: ({ signal }) => movementServices.getRecent(recentLimit, signal),
    enabled,
  });

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

export const useItemMovements = (itemId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: [itemMovementsKey, itemId],
    queryFn: ({ signal }) => movementServices.getByItem(itemId ?? "", signal),
    enabled: enabled && Boolean(itemId),
  });
