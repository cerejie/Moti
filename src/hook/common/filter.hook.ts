import { useMemo } from "react";
import type { IFilterValues } from "../../models/common/filter.model";
import { selectFilters, useFilterStore } from "../../store/common/filter.store";
import { usePaginationStore } from "../../store/common/pagination.store";

// A filter shares its key with its table, so a new filter resets that table in the same
// update: back to page one at its first size, so a list grown by scrolling starts small again.
export const useFilters = <TFilters extends IFilterValues = IFilterValues>(
  key: string,
) => {
  const filters = useFilterStore(selectFilters(key)) as TFilters;
  const setFiltersAt = useFilterStore((state) => state.setFilters);
  const resetFiltersAt = useFilterStore((state) => state.resetFilters);
  const resetPaginationAt = usePaginationStore((state) => state.resetPagination);

  return useMemo(
    () => ({
      filters,
      setFilters: (patch: Partial<TFilters>) => {
        setFiltersAt(key, patch);
        resetPaginationAt(key);
      },
      resetFilters: () => {
        resetFiltersAt(key);
        resetPaginationAt(key);
      },
    }),
    [filters, key, setFiltersAt, resetFiltersAt, resetPaginationAt],
  );
};
