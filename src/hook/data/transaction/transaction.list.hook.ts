import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionStatus } from "../../../enums/transaction.enum";
import { transactionLinesKey, transactionListKey } from "../../../keys/query.keys";
import { transactionHistoryTableKey } from "../../../keys/table.keys";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import transactionServices from "../../../services/data/transaction.services";
import { findCachedRow } from "../../../utils/query.utils";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";

export const useTransactionHistory = () => {
  const { filters } = useFilters<{ status?: TransactionStatus }>(transactionHistoryTableKey);
  const { pagination } = usePagination(transactionHistoryTableKey);
  const status = filters.status;
  // Follows the header switcher; "All branches" lists every branch the account can see.
  const branchId = useActiveBranch().branch?.id;

  return useQuery({
    queryKey: [transactionListKey, status, branchId, pagination.pageNumber, pagination.pageSize],
    queryFn: ({ signal }) =>
      transactionServices.getList({ status, branchId }, pagination, signal),
    placeholderData: keepPreviousData,
  });
};

// Keyed under the list prefix, so checkout and void invalidations refresh it too.
export const useTransaction = (transactionId: string | undefined) => {
  const queryClient = useQueryClient();

  return useQuery<ITransaction>({
    queryKey: [transactionListKey, "detail", transactionId],
    queryFn: ({ signal }) => transactionServices.getById(transactionId ?? "", signal),
    enabled: Boolean(transactionId),
    placeholderData: () =>
      findCachedRow<ITransaction>(queryClient, transactionListKey, transactionId),
  });
};

export const useTransactionLines = (transactionId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: [transactionLinesKey, transactionId],
    queryFn: ({ signal }) => transactionServices.getLines(transactionId ?? "", signal),
    enabled: enabled && Boolean(transactionId),
  });
