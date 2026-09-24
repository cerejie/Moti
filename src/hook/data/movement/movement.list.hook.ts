import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { MovementTab } from "../../../enums/movement.enum";
import { movementItemKey, movementListKey, scopedKey } from "../../../keys/query.keys";
import {
  itemMovementTableKey,
  movementTableKey,
  movementTypeKey,
} from "../../../keys/table.keys";
import type { IMovementFilters } from "../../../models/data/movement/movement.request";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import movementServices from "../../../services/data/movement.services";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { usePermissions } from "../auth/auth.session.hook";
import { itemPath } from "../inventory/inventory.list.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type IToolbarFilters = { reason?: string };
type ITypeFilters = { tab?: MovementTab };

export const useMovementTab = () => {
  const { filters, setFilters } = useFilters<ITypeFilters>(movementTypeKey);
  // The store's default page size: TablePagination and the search reset read it without defaults.
  const { setPagination } = usePagination(movementTableKey);

  return {
    tab: filters.tab ?? "all",
    setTab: (tab: MovementTab) => {
      setFilters({ tab });
      setPagination({ pageNumber: 1 });
    },
  };
};

// Mounted once, by the movements panel: it also sends the list back to page
// one when the reason filter changes.
export const useMovementList = () => {
  const navigate = useNavigate();
  const { shopId } = useActiveShop();
  const { pagination, setPagination } = usePagination(movementTableKey);
  const search = useDebouncedSearch(movementTableKey, movementTableKey);
  const { filters } = useFilters<IToolbarFilters>(movementTableKey);
  const { tab } = useMovementTab();

  const reason = filters.reason;
  const lastReason = useRef(reason);

  useEffect(() => {
    if (lastReason.current === reason) return;
    lastReason.current = reason;
    setPagination({ pageNumber: 1 });
  }, [reason, setPagination]);

  const listFilters: IMovementFilters = { tab, reason, search };

  const query = useQuery({
    queryKey: [scopedKey(movementListKey, shopId), listFilters, pagination],
    queryFn: ({ signal }) =>
      movementServices.getList(shopId ?? "", listFilters, pagination, signal),
    enabled: Boolean(shopId),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    shopId,
    openItem: (movement: IStockMovement) => navigate(itemPath(movement.item_id)),
  };
};

// One item's ledger, for the item detail page. Managers only: RLS returns nothing to staff.
export const useItemMovements = (itemId: string) => {
  const { viewInsights } = usePermissions();
  const tableKey = scopedKey(itemMovementTableKey, itemId);
  const { pagination } = usePagination(tableKey);

  const query = useQuery({
    queryKey: [scopedKey(movementItemKey, itemId), pagination],
    queryFn: ({ signal }) => movementServices.getByItem(itemId, pagination, signal),
    enabled: viewInsights,
    placeholderData: keepPreviousData,
  });

  return { ...query, tableKey, canView: viewInsights };
};
