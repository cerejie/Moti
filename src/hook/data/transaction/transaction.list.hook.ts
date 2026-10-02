import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { TransactionStatus } from "../../../enums/transaction.enum";
import {
  inventoryListKey,
  transactionLinesKey,
  transactionListKey,
} from "../../../keys/query.keys";
import {
  transactionHistoryTableKey,
  transactionPickTableKey,
} from "../../../keys/table.keys";
import inventoryServices from "../../../services/data/inventory.services";
import transactionServices from "../../../services/data/transaction.services";
import { usePaginationStore } from "../../../store/common/pagination.store";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";

type IPickFilterValues = {
  categoryId?: string;
  brandId?: string;
};

// The items a transaction picks from: every active item, out-of-stock ones included
// so the seller sees why they cannot be added.
export const useTransactionItemList = () => {
  const { filters } = useFilters<IPickFilterValues>(transactionPickTableKey);
  const search = useDebouncedSearch(transactionPickTableKey, transactionPickTableKey);
  const { pagination } = usePagination(transactionPickTableKey);
  const setPaginationAt = usePaginationStore((state) => state.setPagination);
  const { categoryId, brandId } = filters;

  // A new filter is a new result set; the old page offset no longer applies.
  useEffect(() => {
    setPaginationAt(transactionPickTableKey, { pageNumber: 1 });
  }, [categoryId, brandId, setPaginationAt]);

  return useQuery({
    queryKey: [
      inventoryListKey,
      "pick",
      categoryId,
      brandId,
      search,
      pagination.pageNumber,
      pagination.pageSize,
    ],
    queryFn: ({ signal }) =>
      inventoryServices.getList(
        { view: "all", categoryId, brandId, search },
        pagination,
        signal,
      ),
    placeholderData: keepPreviousData,
  });
};

export const useTransactionHistory = () => {
  const { filters } = useFilters<{ status?: TransactionStatus }>(transactionHistoryTableKey);
  const { pagination } = usePagination(transactionHistoryTableKey);
  const setPaginationAt = usePaginationStore((state) => state.setPagination);
  const status = filters.status;

  useEffect(() => {
    setPaginationAt(transactionHistoryTableKey, { pageNumber: 1 });
  }, [status, setPaginationAt]);

  return useQuery({
    queryKey: [transactionListKey, status, pagination.pageNumber, pagination.pageSize],
    queryFn: ({ signal }) => transactionServices.getList({ status }, pagination, signal),
    placeholderData: keepPreviousData,
  });
};

export const useTransactionLines = (transactionId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: [transactionLinesKey, transactionId],
    queryFn: ({ signal }) => transactionServices.getLines(transactionId ?? "", signal),
    enabled: enabled && Boolean(transactionId),
  });
