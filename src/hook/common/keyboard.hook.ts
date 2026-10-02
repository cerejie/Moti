import { useEffect } from "react";

// A keyboard is at least this tall; smaller gaps are browser chrome collapsing.
const keyboardMinPx = 120;

// iOS lays the keyboard over the page and shrinks only the visual viewport, so a bottom
// sheet would stay under it. Android resizes the page instead (interactive-widget in
// index.html), which leaves the gap at 0 and this hook idle.
export const useKeyboardInset = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let lastInset = 0;

    const update = () => {
      const gap = window.innerHeight - viewport.height - viewport.offsetTop;
      // Pinch zoom also shrinks the visual viewport; that is not a keyboard.
      const inset = viewport.scale <= 1.01 && gap >= keyboardMinPx ? Math.round(gap) : 0;
      if (inset === lastInset) return;
      lastInset = inset;

      if (inset === 0) {
        root.style.removeProperty("--keyboard-inset");
        root.style.removeProperty("--visible-height");
        return;
      }

      root.style.setProperty("--keyboard-inset", `${inset}px`);
      root.style.setProperty("--visible-height", `${Math.round(viewport.height)}px`);

      // The sheet just got shorter under the focused field; bring the field back into view.
      const field = document.activeElement;
      if (field instanceof HTMLElement && field.closest('[role="dialog"]')) {
        requestAnimationFrame(() => field.scrollIntoView({ block: "nearest" }));
      }
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      root.style.removeProperty("--keyboard-inset");
      root.style.removeProperty("--visible-height");
    };
  }, []);
};
