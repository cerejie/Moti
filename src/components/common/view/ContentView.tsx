import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import type {
  ViewLayout,
  ViewSurface,
} from "../../../models/common/view.model";
import {
  contentViewActions,
  contentViewActionsMobile,
  contentViewBack,
  contentViewBody,
  contentViewCard,
  contentViewCardBody,
  contentViewCardFrame,
  contentViewHeader,
  contentViewHeading,
  contentViewRoot,
} from "../../../styles/view/contentView.styles";
import {
  pageSubtitle,
  pageTitle,
} from "../../../styles/common/typography.styles";
import AppButton from "../button/AppButton";

type IBackLink = {
  label: string;
  path: string;
};

type IProps = {
  title?: string;
  subtitle?: string;
  // A sub-page's link back to its section, shown in place of the heading.
  back?: IBackLink | null;
  actions?: ReactNode;
  layout?: ViewLayout;
  surface?: ViewSurface;
  className?: string;
  children?: ReactNode;
};

const ContentView = ({
  title,
  subtitle,
  back,
  actions,
  layout = "stack",
  surface = "plain",
  className,
  children,
}: IProps) => {
  const isMobile = useIsMobile();

  // A headerless page (no title, back link or actions) skips the header row
  // outright, so the body starts at the top of the surface instead of after
  // the gap an empty header would leave.
  const hasHeader = Boolean(title || back || actions);

  const shell = (
    <>
      {hasHeader && (
        <header className={contentViewHeader}>
          {back ? (
            <AppButton
              href={back.path}
              variant="ghost"
              size="lg"
              className={contentViewBack}
            >
              <ArrowLeft />
              Back to {back.label}
            </AppButton>
          ) : (
            <div className={contentViewHeading}>
              <h1 className={pageTitle}>{title}</h1>
              {subtitle && <p className={pageSubtitle}>{subtitle}</p>}
            </div>
          )}

          {actions && (
            <div
              className={cn(
                contentViewActions,
                isMobile && contentViewActionsMobile,
              )}
            >
              {actions}
            </div>
          )}
        </header>
      )}

      <div className={contentViewBody({ layout })}>{children}</div>
    </>
  );

  if (surface === "card") {
    return (
      <div className={contentViewCardFrame}>
        <Card className={cn(contentViewCard, className)}>
          <CardContent className={contentViewCardBody}>{shell}</CardContent>
        </Card>
      </div>
    );
  }

  return <div className={cn(contentViewRoot, className)}>{shell}</div>;
};

export default ContentView;
