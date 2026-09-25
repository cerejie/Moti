import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PageSkeletonVariant } from "../../../models/common/route.model";
import {
  skeletonAnnounce,
  skeletonBackLink,
  skeletonPageSubtitle,
  skeletonPageTitle,
  skeletonStack,
} from "../../../styles/state/state.styles";
import {
  contentViewBody,
  contentViewHeader,
  contentViewHeading,
  contentViewRoot,
} from "../../../styles/view/contentView.styles";
import CardSkeleton from "./CardSkeleton";
import StatsSkeleton from "./StatsSkeleton";
import TableSkeleton from "./TableSkeleton";

type IProps = {
  variant?: PageSkeletonVariant;
  // Off when the page's own header is already on screen and only its body loads.
  header?: boolean;
};

const bodies: Record<PageSkeletonVariant, ReactNode> = {
  list: <TableSkeleton rows={8} />,
  dashboard: (
    <>
      <StatsSkeleton />
      <TableSkeleton rows={4} />
      <TableSkeleton rows={4} />
    </>
  ),
  detail: (
    <>
      <CardSkeleton rows={2} />
      <CardSkeleton rows={4} />
      <TableSkeleton rows={4} />
    </>
  ),
  form: (
    <>
      <CardSkeleton rows={2} kind="field" />
      <CardSkeleton rows={3} kind="field" />
    </>
  ),
};

// The frame of a ContentView page, shown while the page's code or record loads.
const PageSkeleton = ({ variant = "list", header = true }: IProps) => {
  return (
    <div className={contentViewRoot} role="status" aria-busy>
      <span className={skeletonAnnounce}>Loading…</span>

      {header && (
        <header className={contentViewHeader} aria-hidden>
          {variant === "detail" ? (
            <Skeleton className={skeletonBackLink} />
          ) : (
            <div className={contentViewHeading}>
              <Skeleton className={skeletonPageTitle} />
              <Skeleton className={skeletonPageSubtitle} />
            </div>
          )}
        </header>
      )}

      <div className={contentViewBody()}>
        <div className={skeletonStack}>{bodies[variant]}</div>
      </div>
    </div>
  );
};

export default PageSkeleton;
