import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useBreadcrumbTrail } from "../../../hook/layout/navigation.hook";
import { selectHeaderBack, useLayoutStore } from "../../../store/common/layout.store";
import {
  headerActions,
  headerBack,
  headerBackLabel,
  headerDivider,
  headerRoot,
  headerTitle,
} from "../../../styles/layout/header.styles";
import AppButton from "../button/AppButton";
import SyncIndicator from "../status/SyncIndicator";
import BrandMark from "../view/BrandMark";

type IProps = {
  actions?: ReactNode;
};

// TARTAR's wide-screen header panel.
const AppHeader = ({ actions }: IProps) => {
  const { current } = useBreadcrumbTrail();
  // A screen's own back action (a wizard step); a sub-page's route back link
  // lives in its ContentView instead.
  const back = useLayoutStore(selectHeaderBack);

  return (
    <header className={headerRoot}>
      <BrandMark />
      <Separator orientation="vertical" className={headerDivider} />

      {back ? (
        <AppButton onPress={back.onPress} variant="ghost" className={headerBack}>
          <ArrowLeft />
          <span className={headerBackLabel}>Back to {back.label}</span>
        </AppButton>
      ) : (
        // ContentView owns the page's h1, so the header's copy of the title is a span.
        <span className={headerTitle}>{current}</span>
      )}

      <div className={headerActions}>
        <SyncIndicator />
        {actions}
      </div>
    </header>
  );
};

export default AppHeader;
