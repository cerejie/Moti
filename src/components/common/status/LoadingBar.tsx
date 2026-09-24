import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import { loadingBar } from "../../../styles/state/state.styles";

type IProps = {
  className?: string;
};

const LoadingBar = ({ className }: IProps) => {
  return <Skeleton className={cn(loadingBar, className)} />;
};

export default LoadingBar;
