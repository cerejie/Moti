import { useMemo } from "react";
import {
  IPaginationFormValue,
  type IPaginationRequest,
} from "../../models/common/pagination.model";
import {
  selectPagination,
  usePaginationStore,
} from "../../store/common/pagination.store";

const basePagination = new IPaginationFormValue();

// `defaults` sit under whatever the key has stored, e.g. a table that pages twenty rows.
// Every caller of the same key passes the same defaults.
export const usePagination = (
  key: string,
  defaults?: Partial<IPaginationRequest>,
) => {
  const stored = usePaginationStore(selectPagination(key));
  const setPaginationAt = usePaginationStore((state) => state.setPagination);
  const resetPaginationAt = usePaginationStore((state) => state.resetPagination);

  return useMemo(() => {
    const pagination: IPaginationRequest = { ...basePagination, ...defaults, ...stored };

    return {
      pagination,
      setPagination: (patch: Partial<IPaginationRequest>) => setPaginationAt(key, patch),
      goToPage: (pageNumber: number, pageSize: number) =>
        setPaginationAt(key, { pageNumber, pageSize }),
      resetPagination: () => resetPaginationAt(key),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaults is a literal at the call site
  }, [stored, key, setPaginationAt, resetPaginationAt]);
};
