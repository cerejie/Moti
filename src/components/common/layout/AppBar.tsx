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

// The bar is ruled off once the content has scrolled this far beneath it.
const scrolledOffset = 4;

// TARTAR's compact app bar. ContentView hides its h1 on compact screens, so the
// bar always carries the page title.
const AppBar = ({ actions }: IProps) => {
  const { current } = useBreadcrumbTrail();
  const headerBack = useLayoutStore(selectHeaderBack);
  const scrolled = useScrolledPast(scrolledOffset);

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

      <span className={appBarTitle}>{current}</span>

      <div className={appBarActions}>
        <SyncIndicator />
        {actions}
      </div>
    </header>
  );
};

export default AppBar;
