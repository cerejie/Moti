import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import {
  skeletonTableRow,
  skeletonTableRows,
  skeletonToolbar,
} from "../../../styles/state/state.styles";
import {
  tablePanelBody,
  tablePanelRoot,
  tablePanelToolbar,
} from "../../../styles/table/tablePanel.styles";
import SectionCard from "../card/SectionCard";

type IProps = {
  rows?: number;
};

// A TablePanel before its screen has loaded: toolbar row, then table rows.
const TableSkeleton = ({ rows = 5 }: IProps) => {
  return (
    <SectionCard padded={false} className={tablePanelRoot}>
      <div className={tablePanelToolbar} aria-hidden>
        <Skeleton className={skeletonToolbar} />
      </div>
      <div className={cn(tablePanelBody, skeletonTableRows)} aria-hidden>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className={skeletonTableRow} />
        ))}
      </div>
    </SectionCard>
  );
};

export default TableSkeleton;
