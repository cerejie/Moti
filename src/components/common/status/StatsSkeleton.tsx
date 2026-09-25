import { Skeleton } from "@/components/ui/skeleton";
import {
  statsSkeletonGrid,
  statsSkeletonTile,
} from "../../../styles/state/state.styles";

type IProps = {
  count?: 4 | 5;
};

const StatsSkeleton = ({ count = 4 }: IProps) => {
  return (
    <div className={statsSkeletonGrid({ count })} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={statsSkeletonTile} />
      ))}
    </div>
  );
};

export default StatsSkeleton;
