import { useEffect, useMemo } from "react";
import { usePaginationStore } from "../../store/common/pagination.store";
import { selectSearch, useViewStore } from "../../store/common/view.store";

export const useSearch = (key: string) => {
  const search = useViewStore(selectSearch(key));
  const setSearchAt = useViewStore((state) => state.setSearch);
  const resetSearchAt = useViewStore((state) => state.resetSearch);

  return useMemo(
    () => ({
      search,
      setSearch: (value: string) => setSearchAt(key, value),
      resetSearch: () => resetSearchAt(key),
    }),
    [search, key, setSearchAt, resetSearchAt],
  );
};

// The typed search, settled after `delayMs` of no typing and trimmed - what a
// server-side list should query with. The settled copy lives in the view store
// under its own key, so nothing here needs local state. A settled change also
// sends the paired table back to page one, since the old offset no longer
// applies to the new result set.
export const settledSearchKey = (key: string) => `${key}:settled`;

export const useDebouncedSearch = (
  key: string,
  paginationKey: string,
  delayMs = 400,
) => {
  const settledKey = settledSearchKey(key);
  const { search } = useSearch(key);
  const settled = useViewStore(selectSearch(settledKey));
  const setSearchAt = useViewStore((state) => state.setSearch);
  const setPaginationAt = usePaginationStore((state) => state.setPagination);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = search.trim();
      if (next === selectSearch(settledKey)(useViewStore.getState())) return;
      setSearchAt(settledKey, next);
      setPaginationAt(paginationKey, { pageNumber: 1 });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [search, settledKey, paginationKey, delayMs, setSearchAt, setPaginationAt]);

  return settled;
};
