import { Skeleton } from "@/components/ui/skeleton";
import { skeletonCardTitle, skeletonStack } from "../../../styles/state/state.styles";
import SectionCard from "../card/SectionCard";
import ListSkeleton from "./ListSkeleton";

type IProps = {
  rows?: number;
  kind?: "line" | "field";
};

const CardSkeleton = ({ rows, kind }: IProps) => {
  return (
    <SectionCard>
      <div className={skeletonStack} aria-hidden>
        <Skeleton className={skeletonCardTitle} />
        <ListSkeleton rows={rows} kind={kind} />
      </div>
    </SectionCard>
  );
};

export default CardSkeleton;
