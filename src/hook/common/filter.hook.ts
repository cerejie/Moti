import { useMemo } from "react";
import type { IFilterValues } from "../../models/common/filter.model";
import { selectFilters, useFilterStore } from "../../store/common/filter.store";

export const useFilters = <TFilters extends IFilterValues = IFilterValues>(
  key: string,
) => {
  const filters = useFilterStore(selectFilters(key)) as TFilters;
  const setFiltersAt = useFilterStore((state) => state.setFilters);
  const resetFiltersAt = useFilterStore((state) => state.resetFilters);

  return useMemo(
    () => ({
      filters,
      setFilters: (patch: Partial<TFilters>) => setFiltersAt(key, patch),
      resetFilters: () => resetFiltersAt(key),
    }),
    [filters, key, setFiltersAt, resetFiltersAt],
  );
};
