import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import type { InventorySort, InventoryTab } from "../../../enums/inventory.enum";
import { inventoryItemKey, inventoryListKey, scopedKey } from "../../../keys/query.keys";
import { inventoryStatusKey, inventoryTableKey } from "../../../keys/table.keys";
import type { IInventoryFilters } from "../../../models/data/inventory/inventory.request";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { ROUTES } from "../../../routes/route.paths";
import inventoryServices from "../../../services/data/inventory.services";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { usePermissions } from "../auth/auth.session.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type IToolbarFilters = { category_id?: string };
type IStatusFilters = { tab?: InventoryTab };

export const itemPath = (id: string) => ROUTES.inventoryItem.replace(":itemId", id);

export const useInventoryTab = () => {
  const { filters, setFilters } = useFilters<IStatusFilters>(inventoryStatusKey);
  const { setPagination } = usePagination(inventoryTableKey);

  return {
    tab: filters.tab ?? "all",
    setTab: (tab: InventoryTab) => {
      setFilters({ tab });
      setPagination({ pageNumber: 1 });
    },
  };
};

export const useInventorySort = () => {
  const { pagination, setPagination } = usePagination(inventoryTableKey);

  return {
    sort: (pagination.sort ?? "name") as InventorySort,
    setSort: (sort: InventorySort) => setPagination({ sort, pageNumber: 1 }),
  };
};

// Mounted once, by the inventory panel: it also sends the list back to page
// one when the category filter changes.
export const useInventoryList = () => {
  const { shopId } = useActiveShop();
  const { canManage, openItem } = useInventoryNavigation();
  const { pagination, setPagination } = usePagination(inventoryTableKey);
  const search = useDebouncedSearch(inventoryTableKey, inventoryTableKey);
  const { filters } = useFilters<IToolbarFilters>(inventoryTableKey);
  const { tab } = useInventoryTab();
  const { sort } = useInventorySort();

  const categoryId = filters.category_id;
  const lastCategoryId = useRef(categoryId);

  useEffect(() => {
    if (lastCategoryId.current === categoryId) return;
    lastCategoryId.current = categoryId;
    setPagination({ pageNumber: 1 });
  }, [categoryId, setPagination]);

  const listFilters: IInventoryFilters = { tab, categoryId, search, sort };

  const query = useQuery({
    queryKey: [scopedKey(inventoryListKey, shopId), listFilters, pagination],
    queryFn: ({ signal }) =>
      inventoryServices.getList(shopId ?? "", listFilters, pagination, signal),
    enabled: Boolean(shopId),
    placeholderData: keepPreviousData,
  });

  return { ...query, shopId, tab, canManage, openItem };
};

export const useInventoryNavigation = () => {
  const navigate = useNavigate();
  const { manageCatalog } = usePermissions();

  return {
    canManage: manageCatalog,
    openItem: (item: IInventoryItem) => navigate(itemPath(item.id)),
  };
};

// The item named in the URL of the item detail page.
export const useInventoryItem = () => {
  const { itemId } = useParams();
  const { canManage } = useInventoryNavigation();

  const query = useQuery({
    queryKey: [scopedKey(inventoryItemKey, itemId)],
    queryFn: ({ signal }) => (itemId ? inventoryServices.getById(itemId, signal) : null),
    enabled: Boolean(itemId),
  });

  return { ...query, canManage };
};
