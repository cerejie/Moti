import { cn } from "@/utils/cn.utils";
import {
  brandMark,
  brandRoot,
  brandWordmark,
} from "../../../styles/view/brand.styles";

type IProps = {
  size?: "sm" | "lg";
  tone?: "default" | "hero";
  // Hides the wordmark, leaving only the tile.
  compact?: boolean;
  className?: string;
};

const BrandMark = ({ size = "sm", tone = "default", compact = false, className }: IProps) => (
  <div className={cn(brandRoot, className)}>
    <span className={brandMark({ size })} aria-hidden="true">
      M
    </span>
    {!compact && <span className={brandWordmark({ tone, size })}>Moti</span>}
  </div>
);

export default BrandMark;
