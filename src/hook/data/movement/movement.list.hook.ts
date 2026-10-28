import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MovementType } from "../../../enums/stock.enum";
import { itemMovementsKey, movementListKey } from "../../../keys/query.keys";
import { movementTableKey } from "../../../keys/table.keys";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import movementServices from "../../../services/data/movement.services";
import { findCachedRow } from "../../../utils/query.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";

type IMovementFilterValues = {
  type?: MovementType;
};

const recentLimit = 8;

export const useMovementList = () => {
  const { filters } = useFilters<IMovementFilterValues>(movementTableKey);
  const { pagination } = usePagination(movementTableKey);
  const type = filters.type;

  return useQuery({
    queryKey: [movementListKey, type, pagination.pageNumber, pagination.pageSize],
    queryFn: ({ signal }) => movementServices.getList({ type }, pagination, signal),
    placeholderData: keepPreviousData,
  });
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
