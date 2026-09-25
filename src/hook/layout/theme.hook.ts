import { useLayoutEffect } from "react";
import { selectTheme, useThemeStore, type Theme } from "../../store/common/theme.store";

// Mirrors --sidebar in theme.css (the topbar surface), so the phone status bar
// blends into the topbar in both themes.
const statusBarColor: Record<Theme, string> = { light: "#fafafa", dark: "#171717" };

// Mirrors the theme onto <html> before paint so a dark session never flashes light.
export const useApplyTheme = () => {
  const theme = useThemeStore(selectTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", statusBarColor[theme]);
  }, [theme]);
};
