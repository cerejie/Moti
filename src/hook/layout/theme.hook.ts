import { useLayoutEffect } from "react";
import { selectTheme, useThemeStore } from "../../store/common/theme.store";

// Mirrors the theme onto <html> before paint so a dark session never flashes light,
// and tints the phone status bar from the --status-bar token to match.
export const useApplyTheme = () => {
  const theme = useThemeStore(selectTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    const statusBar = getComputedStyle(root).getPropertyValue("--status-bar").trim();
    if (statusBar) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", statusBar);
    }
  }, [theme]);
};
