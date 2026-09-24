import { useMemo } from "react";
import type { IPaginationRequest } from "../../models/common/pagination.model";
import {
  selectPagination,
  usePaginationStore,
} from "../../store/common/pagination.store";

// `defaults` override the store's page size until the key has been written,
// e.g. a table fixed at ten rows.
export const usePagination = (
  key: string,
  defaults?: Partial<IPaginationRequest>,
) => {
  const stored = usePaginationStore(selectPagination(key));
  const hasEntry = usePaginationStore((state) => key in state.pagination);
  const setPaginationAt = usePaginationStore((state) => state.setPagination);
  const resetPaginationAt = usePaginationStore((state) => state.resetPagination);

  return useMemo(() => {
    const pagination = hasEntry ? stored : { ...stored, ...defaults };

    return {
      pagination,
      // The whole value is written so the first step keeps the defaults.
      setPagination: (patch: Partial<IPaginationRequest>) =>
        setPaginationAt(key, { ...pagination, ...patch }),
      goToPage: (pageNumber: number, pageSize: number) =>
        setPaginationAt(key, { pageNumber, pageSize }),
      resetPagination: () => resetPaginationAt(key),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaults is a literal at the call site
  }, [stored, hasEntry, key, setPaginationAt, resetPaginationAt]);
};
