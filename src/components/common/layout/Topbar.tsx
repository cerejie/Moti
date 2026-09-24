import { ArrowLeft, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useBreadcrumbTrail } from "../../../hook/layout/navigation.hook";
import {
  selectHeaderBack,
  useLayoutStore,
} from "../../../store/common/layout.store";
import { selectTheme, useThemeStore } from "../../../store/common/theme.store";
import {
  topbarAction,
  topbarBack,
  topbarBackLabel,
  topbarRoot,
  topbarSpacer,
  topbarTitle,
  topbarTrigger,
} from "../../../styles/layout/topbar.styles";
import AppButton from "../button/AppButton";
import ShopSwitcher from "./ShopSwitcher";
import StockAlertsButton from "./StockAlertsButton";
import SyncStatusButton from "./SyncStatusButton";

const Topbar = () => {
  const { current } = useBreadcrumbTrail();
  // A screen's own back action (a wizard step); a sub-page's route back link
  // lives in its ContentView instead.
  const headerBack = useLayoutStore(selectHeaderBack);
  const theme = useThemeStore(selectTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <header className={topbarRoot}>
      <SidebarTrigger size="icon-lg" className={topbarTrigger} />

      {/* ContentView owns the page's h1, so the bar's copy of the title is a span. */}
      <span className={topbarTitle}>{current}</span>

      {headerBack && (
        <AppButton
          onClick={headerBack.onPress}
          variant="ghost"
          size="lg"
          className={topbarBack}
        >
          <ArrowLeft />
          <span className={topbarBackLabel}>Back to {headerBack.label}</span>
        </AppButton>
      )}

      <div className={topbarSpacer} />

      <ShopSwitcher />

      <StockAlertsButton />

      <SyncStatusButton />

      <AppButton
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onPress={toggleTheme}
        className={topbarAction}
      >
        {isDark ? <Sun /> : <Moon />}
      </AppButton>
    </header>
  );
};

export default Topbar;
