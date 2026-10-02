import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useBreadcrumbTrail } from "../../../hook/layout/navigation.hook";
import { selectHeaderBack, useLayoutStore } from "../../../store/common/layout.store";
import {
  topbarActions,
  topbarBack,
  topbarBackLabel,
  topbarBrandDesktop,
  topbarBrandPhone,
  topbarDivider,
  topbarRoot,
  topbarTitle,
} from "../../../styles/layout/topbar.styles";
import AppButton from "../button/AppButton";
import SyncIndicator from "../status/SyncIndicator";
import BrandMark from "../view/BrandMark";

type IProps = {
  actions?: ReactNode;
};

const Topbar = ({ actions }: IProps) => {
  const { current } = useBreadcrumbTrail();
  // A screen's own back action (a wizard step); a sub-page's route back link
  // lives in its ContentView instead.
  const headerBack = useLayoutStore(selectHeaderBack);

  return (
    <header className={topbarRoot}>
      <BrandMark className={topbarBrandDesktop} />
      <BrandMark compact className={topbarBrandPhone} />
      <Separator orientation="vertical" className={topbarDivider} />

      {headerBack ? (
        <AppButton onPress={headerBack.onPress} variant="ghost" className={topbarBack}>
          <ArrowLeft />
          <span className={topbarBackLabel}>Back to {headerBack.label}</span>
        </AppButton>
      ) : (
        // ContentView owns the page's h1, so the bar's copy of the title is a span.
        <span className={topbarTitle}>{current}</span>
      )}

      <div className={topbarActions}>
        <SyncIndicator />
        {actions}
      </div>
    </header>
  );
};

export default Topbar;
