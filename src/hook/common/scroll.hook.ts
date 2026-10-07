import type { UIEvent } from "react";
import { useLocation } from "react-router-dom";
import { selectIsScrolledPast, useScrollStore } from "../../store/common/scroll.store";

// Records the shell's scroll offset per page; positions are tracked, not restored.
export const useScrollTracker = () => {
  const { pathname } = useLocation();
  const setPosition = useScrollStore((state) => state.setPosition);

  const handleScroll = (event: UIEvent<HTMLElement>) =>
    setPosition(pathname, event.currentTarget.scrollTop);

  return { pathname, handleScroll };
};

export const useScrolledPast = (top: number) => {
  const { pathname } = useLocation();

  return useScrollStore(selectIsScrolledPast(pathname, top));
};
