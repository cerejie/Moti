import { useEffect, useRef } from "react";

// Calls onLoadMore when the sentinel scrolls into view; re-arms after each load.
export const useLoadMoreTrigger = (
  canLoad: boolean,
  loadedCount: number,
  onLoadMore: () => void,
) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef(onLoadMore);

  useEffect(() => {
    loadRef.current = onLoadMore;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!canLoad || !sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadRef.current();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoad, loadedCount]);

  return sentinelRef;
};
