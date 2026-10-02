import { useEffect } from "react";

const splashFadeMs = 400;

// The launch splash lives in index.html, outside React, so it paints before the bundle
// runs; the first route to render fades it out, then removes it.
export const useDismissSplash = () => {
  useEffect(() => {
    const splash = document.getElementById("splash");
    if (!splash) return;

    splash.dataset.state = "done";
    const timer = window.setTimeout(() => splash.remove(), splashFadeMs);
    return () => window.clearTimeout(timer);
  }, []);
};
