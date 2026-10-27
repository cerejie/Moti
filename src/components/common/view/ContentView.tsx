import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn.utils";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { usePushedRoute } from "../../../hook/layout/navigation.hook";
import type { ViewLayout } from "../../../models/common/view.model";
import {
  contentViewActions,
  contentViewBack,
  contentViewBody,
  contentViewHead,
  contentViewHeadActions,
  contentViewHeadDivider,
  contentViewHeading,
  contentViewRoot,
  contentViewTabs,
  contentViewTitle,
} from "../../../styles/view/contentView.styles";
import { pageSubtitle } from "../../../styles/common/typography.styles";
import AppButton from "../button/AppButton";
import BackButton from "../button/BackButton";

type IBackLink = {
  label: string;
  path: string;
};

type IProps = {
  title?: string;
  subtitle?: string;
  // A sub-page's link back to its section, shown above the title.
  back?: IBackLink | null;
  // A ContextSwitch for the whole page, beside the actions on wide screens.
  tabs?: ReactNode;
  actions?: ReactNode;
  layout?: ViewLayout;
  className?: string;
  children?: ReactNode;
};

const ContentView = ({
  title,
  subtitle,
  back,
  tabs,
  actions,
  layout = "stack",
  className,
  children,
}: IProps) => {
  const hasHeader = Boolean(title || back || tabs || actions);
  const isCompact = useIsCompact();
  const { pushed, goBack } = usePushedRoute();

  return (
    <div className={cn(contentViewRoot, className)}>
      {hasHeader && (
        <header className={contentViewHead}>
          <div className={contentViewHeading}>
            {/* A pushed phone screen has no app bar, so its back is a native-style pop. */}
            {back && pushed && isCompact && <BackButton label={back.label} onPress={goBack} />}
            {back && !(pushed && isCompact) && (
              <AppButton href={back.path} variant="ghost" size="lg" className={contentViewBack}>
                <ArrowLeft />
                Back to {back.label}
              </AppButton>
            )}
            {title && <h1 className={contentViewTitle}>{title}</h1>}
            {subtitle && <p className={pageSubtitle}>{subtitle}</p>}
          </div>

          {(tabs || actions) && (
            <div className={contentViewHeadActions}>
              {tabs && (
                <div data-slot="view-tabs" className={contentViewTabs}>
                  {tabs}
                </div>
              )}
              {tabs && actions && (
                <Separator orientation="vertical" className={contentViewHeadDivider} />
              )}
              {actions && <div className={contentViewActions}>{actions}</div>}
            </div>
          )}
        </header>
      )}

      <div className={contentViewBody({ layout })}>{children}</div>
    </div>
  );
};

export default ContentView;
