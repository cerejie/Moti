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
import type { IDateRange } from "../../../models/data/analyzer/analyzer.request";
import type { IMovementFilters } from "../../../models/data/movement/movement.request";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import movementServices from "../../../services/data/movement.services";
import { dayEndInstant, dayStartInstant, todayIn } from "../../../utils/date.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { usePermissions } from "../auth/auth.session.hook";
import { itemPath } from "../inventory/inventory.list.hook";
import { useActiveShop, useShopTimezone } from "../shop/shop.list.hook";

type IToolbarFilters = { reason?: string; from?: string; to?: string };
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

// Shop-local dates; the toolbar's Clear resets them with the reason.
export const useMovementDateRange = () => {
  const { data: timezone } = useShopTimezone();
  const { filters, setFilters } = useFilters<IToolbarFilters>(movementTableKey);

  return {
    range: filters.from && filters.to ? { from: filters.from, to: filters.to } : null,
    today: timezone ? todayIn(timezone) : null,
    setRange: (range: IDateRange) => setFilters(range),
  };
};

// Mounted once, by the movements panel: it also sends the list back to page
// one when the reason or date filter changes.
export const useMovementList = () => {
  const navigate = useNavigate();
  const { shopId } = useActiveShop();
  const { pagination, setPagination } = usePagination(movementTableKey);
  const search = useDebouncedSearch(movementTableKey, movementTableKey);
  const { filters } = useFilters<IToolbarFilters>(movementTableKey);
  const { tab } = useMovementTab();
  const { data: timezone } = useShopTimezone();

  const reason = filters.reason;
  const filterSignature = `${reason ?? ""}|${filters.from ?? ""}|${filters.to ?? ""}`;
  const lastSignature = useRef(filterSignature);

  useEffect(() => {
    if (lastSignature.current === filterSignature) return;
    lastSignature.current = filterSignature;
    setPagination({ pageNumber: 1 });
  }, [filterSignature, setPagination]);

  const { from, to } = filters;
  const hasRange = Boolean(from && to);
  const occurred =
    from && to && timezone
      ? { occurredFrom: dayStartInstant(from, timezone), occurredBefore: dayEndInstant(to, timezone) }
      : {};
  const listFilters: IMovementFilters = { tab, reason, search, ...occurred };

  const query = useQuery({
    queryKey: [scopedKey(movementListKey, shopId), listFilters, pagination],
    queryFn: ({ signal }) =>
      movementServices.getList(shopId ?? "", listFilters, pagination, signal),
    // A date range is read in the shop's timezone, so it waits for it.
    enabled: Boolean(shopId) && (!hasRange || Boolean(timezone)),
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
