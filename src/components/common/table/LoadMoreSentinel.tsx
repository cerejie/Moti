import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLoadMoreTrigger } from "../../../hook/common/load.more.hook";
import { tableLoadMore } from "../../../styles/table/table.styles";

type IProps = {
  loadedCount: number;
  totalCount: number;
  loading: boolean;
  failed?: boolean;
  onLoadMore: () => void;
  onRetry?: () => void;
};

const LoadMoreSentinel = ({
  loadedCount,
  totalCount,
  loading,
  failed = false,
  onLoadMore,
  onRetry,
}: IProps) => {
  const canLoad = loadedCount < totalCount && !loading && !failed;
  const sentinelRef = useLoadMoreTrigger(canLoad, loadedCount, onLoadMore);

  return (
    <div ref={sentinelRef} className={tableLoadMore} role="status">
      {loading ? <Spinner /> : null}
      <span>{`${loadedCount} of ${totalCount}`}</span>
      {failed && onRetry ? (
        <Button variant="outline" size="sm" onPress={onRetry}>
          <RotateCw />
          Retry
        </Button>
      ) : null}
    </div>
  );
};

export default LoadMoreSentinel;
