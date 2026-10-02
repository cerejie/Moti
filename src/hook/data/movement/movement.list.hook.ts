import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { MovementType } from "../../../enums/stock.enum";
import { itemMovementsKey, movementListKey } from "../../../keys/query.keys";
import { movementTableKey } from "../../../keys/table.keys";
import movementServices from "../../../services/data/movement.services";
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

export const useItemMovements = (itemId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: [itemMovementsKey, itemId],
    queryFn: ({ signal }) => movementServices.getByItem(itemId ?? "", signal),
    enabled: enabled && Boolean(itemId),
  });
