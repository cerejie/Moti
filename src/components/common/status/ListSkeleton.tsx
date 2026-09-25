import { Skeleton } from "@/components/ui/skeleton";
import {
  skeletonField,
  skeletonFieldControl,
  skeletonFieldLabel,
  skeletonLine,
  skeletonLineShort,
  skeletonStack,
} from "../../../styles/state/state.styles";

type IProps = {
  rows?: number;
  // `field` draws a label over an input, for a form still loading its values.
  kind?: "line" | "field";
};

const ListSkeleton = ({ rows = 3, kind = "line" }: IProps) => {
  return (
    <div className={skeletonStack} aria-hidden>
      {Array.from({ length: rows }).map((_, index) =>
        kind === "field" ? (
          <div key={index} className={skeletonField}>
            <Skeleton className={skeletonFieldLabel} />
            <Skeleton className={skeletonFieldControl} />
          </div>
        ) : (
          <Skeleton
            key={index}
            className={index === rows - 1 ? skeletonLineShort : skeletonLine}
          />
        ),
      )}
    </div>
  );
};

export default ListSkeleton;
