import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  TransactionSection,
  TransactionStatusTab,
} from "../../../enums/transaction.enum";
import {
  inventoryListKey,
  scopedKey,
  transactionLinesKey,
  transactionListKey,
} from "../../../keys/query.keys";
import {
  productTableKey,
  transactionSectionKey,
  transactionStatusKey,
  transactionTableKey,
} from "../../../keys/table.keys";
import type { IDateRange } from "../../../models/data/analyzer/analyzer.request";
import type { IInventoryFilters } from "../../../models/data/inventory/inventory.request";
import type { ITransactionFilters } from "../../../models/data/transaction/transaction.request";
import inventoryServices from "../../../services/data/inventory.services";
import transactionServices from "../../../services/data/transaction.services";
import { dayEndInstant, dayStartInstant, todayIn } from "../../../utils/date.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { useCategoryOptions } from "../category/category.list.hook";
import { useActiveShop, useShopTimezone } from "../shop/shop.list.hook";

type ISectionFilters = { section?: TransactionSection };
type IProductFilters = { category_id?: string };
type IStatusFilters = { tab?: TransactionStatusTab };
type IHistoryFilters = { from?: string; to?: string };

// The category chip that means "every category".
export const allCategories = "all";

export const useTransactionSection = () => {
  const { filters, setFilters } = useFilters<ISectionFilters>(transactionSectionKey);

  return {
    section: filters.section ?? "new",
    setSection: (section: TransactionSection) => setFilters({ section }),
  };
};

export const useProductCategory = () => {
  const { data: categories = [] } = useCategoryOptions();
  const { filters, setFilters } = useFilters<IProductFilters>(productTableKey);
  const { setPagination } = usePagination(productTableKey);

  return {
    categoryId: filters.category_id ?? allCategories,
    categories,
    setCategoryId: (categoryId: string) => {
      setFilters({ category_id: categoryId === allCategories ? undefined : categoryId });
      setPagination({ pageNumber: 1 });
    },
  };
};

// The items the cart picks from: active items only, by name. Keyed under the
// inventory prefix, so every stock change refreshes it.
export const useProductList = () => {
  const { shopId } = useActiveShop();
  const { pagination } = usePagination(productTableKey);
  const search = useDebouncedSearch(productTableKey, productTableKey);
  const { filters } = useFilters<IProductFilters>(productTableKey);

  const listFilters: IInventoryFilters = {
    tab: "all",
    categoryId: filters.category_id,
    search,
    sort: "name",
  };

  const query = useQuery({
    queryKey: [scopedKey(inventoryListKey, shopId, "products"), listFilters, pagination],
    queryFn: ({ signal }) =>
      inventoryServices.getList(shopId ?? "", listFilters, pagination, signal),
    enabled: Boolean(shopId),
    placeholderData: keepPreviousData,
  });

  return { ...query, shopId, search };
};

export const useTransactionStatusTab = () => {
  const { filters, setFilters } = useFilters<IStatusFilters>(transactionStatusKey);
  const { setPagination } = usePagination(transactionTableKey);

  return {
    tab: filters.tab ?? "all",
    setTab: (tab: TransactionStatusTab) => {
      setFilters({ tab });
      setPagination({ pageNumber: 1 });
    },
  };
};

// Shop-local dates; the toolbar's Clear resets them.
export const useTransactionDateRange = () => {
  const { data: timezone } = useShopTimezone();
  const { filters, setFilters } = useFilters<IHistoryFilters>(transactionTableKey);

  return {
    range: filters.from && filters.to ? { from: filters.from, to: filters.to } : null,
    today: timezone ? todayIn(timezone) : null,
    setRange: (range: IDateRange) => setFilters(range),
  };
};

// Mounted once, by the history panel: it also sends the list back to page one
// when the date range changes. RLS limits an employee to their own transactions.
export const useTransactionList = () => {
  const { shopId } = useActiveShop();
  const { pagination, setPagination } = usePagination(transactionTableKey);
  const search = useDebouncedSearch(transactionTableKey, transactionTableKey);
  const { filters } = useFilters<IHistoryFilters>(transactionTableKey);
  const { tab } = useTransactionStatusTab();
  const { data: timezone } = useShopTimezone();

  const rangeSignature = `${filters.from ?? ""}|${filters.to ?? ""}`;
  const lastSignature = useRef(rangeSignature);

  useEffect(() => {
    if (lastSignature.current === rangeSignature) return;
    lastSignature.current = rangeSignature;
    setPagination({ pageNumber: 1 });
  }, [rangeSignature, setPagination]);

  const { from, to } = filters;
  const hasRange = Boolean(from && to);
  const occurred =
    from && to && timezone
      ? { occurredFrom: dayStartInstant(from, timezone), occurredBefore: dayEndInstant(to, timezone) }
      : {};
  const listFilters: ITransactionFilters = { tab, search, ...occurred };

  const query = useQuery({
    queryKey: [scopedKey(transactionListKey, shopId), listFilters, pagination],
    queryFn: ({ signal }) =>
      transactionServices.getList(shopId ?? "", listFilters, pagination, signal),
    // A date range is read in the shop's timezone, so it waits for it.
    enabled: Boolean(shopId) && (!hasRange || Boolean(timezone)),
    placeholderData: keepPreviousData,
  });

  return { ...query, shopId };
};

export const useTransactionLines = (transactionId: string | null) =>
  useQuery({
    queryKey: [scopedKey(transactionLinesKey, transactionId)],
    queryFn: ({ signal }) => transactionServices.getLines(transactionId ?? "", signal),
    enabled: Boolean(transactionId),
  });
