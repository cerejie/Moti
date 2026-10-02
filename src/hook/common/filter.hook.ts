import { useMemo } from "react";
import type { IFilterValues } from "../../models/common/filter.model";
import { selectFilters, useFilterStore } from "../../store/common/filter.store";
import { usePaginationStore } from "../../store/common/pagination.store";

// A filter shares its key with its table, so a new filter sends that table back to
// page one in the same update; the old offset never reaches the query.
export const useFilters = <TFilters extends IFilterValues = IFilterValues>(
  key: string,
) => {
  const filters = useFilterStore(selectFilters(key)) as TFilters;
  const setFiltersAt = useFilterStore((state) => state.setFilters);
  const resetFiltersAt = useFilterStore((state) => state.resetFilters);
  const setPaginationAt = usePaginationStore((state) => state.setPagination);

  return useMemo(
    () => ({
      filters,
      setFilters: (patch: Partial<TFilters>) => {
        setFiltersAt(key, patch);
        setPaginationAt(key, { pageNumber: 1 });
      },
      resetFilters: () => {
        resetFiltersAt(key);
        setPaginationAt(key, { pageNumber: 1 });
      },
    }),
    [filters, key, setFiltersAt, resetFiltersAt, setPaginationAt],
  );
};
