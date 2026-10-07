import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useScrolledPast } from "../../../hook/common/scroll.hook";
import { useBreadcrumbTrail } from "../../../hook/layout/navigation.hook";
import { selectHeaderBack, useLayoutStore } from "../../../store/common/layout.store";
import {
  appBar,
  appBarActions,
  appBarBack,
  appBarLeading,
  appBarTitle,
} from "../../../styles/layout/appBar.styles";
import AppButton from "../button/AppButton";
import SyncIndicator from "../status/SyncIndicator";
import BrandMark from "../view/BrandMark";

type IProps = {
  actions?: ReactNode;
};

// Roughly the height of ContentView's large title: once it scrolls away, the bar takes over.
const compactTitleOffset = 44;

// TARTAR's compact app bar: ruled off and titled only after the page title scrolls beneath it.
const AppBar = ({ actions }: IProps) => {
  const { current } = useBreadcrumbTrail();
  const headerBack = useLayoutStore(selectHeaderBack);
  const scrolled = useScrolledPast(compactTitleOffset);

  return (
    <header className={appBar({ scrolled })}>
      <div className={appBarLeading}>
        {headerBack ? (
          <AppButton
            variant="ghost"
            size="icon"
            aria-label={`Back to ${headerBack.label}`}
            onPress={headerBack.onPress}
            className={appBarBack}
          >
            <ArrowLeft />
          </AppButton>
        ) : (
          <BrandMark compact />
        )}
      </div>

      {scrolled && <span className={appBarTitle}>{current}</span>}

      <div className={appBarActions}>
        <SyncIndicator />
        {actions}
      </div>
    </header>
  );
};

export default AppBar;
