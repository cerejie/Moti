import { useLayoutEffect } from "react";
import { selectTheme, useThemeStore } from "../../store/common/theme.store";

// Mirrors the theme onto <html> before paint so a dark session never flashes light.
export const useApplyTheme = () => {
  const theme = useThemeStore(selectTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
};
