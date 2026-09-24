import { ArrowRight } from "lucide-react";
import { cn } from "../../../utils/cn.utils";
import { tone } from "../../../styles/common/tone.styles";
import {
  balanceArrow,
  balanceLabel,
  balancePreview,
  balanceSide,
  balanceValue,
} from "../../../styles/movement/movement.styles";

type IProps = {
  before: number;
  after: number;
  unit: string;
};

// On hand now and after this movement; turns red when the item would go below zero.
const BalancePreview = ({ before, after, unit }: IProps) => {
  const short = after < 0;

  return (
    <div
      className={cn(balancePreview, tone({ tone: short ? "danger" : "neutral" }))}
      aria-live="polite"
    >
      <div className={balanceSide}>
        <span className={balanceLabel}>On hand now</span>
        <span className={balanceValue}>
          {before} {unit}
        </span>
      </div>
      <ArrowRight className={balanceArrow} aria-hidden />
      <div className={balanceSide}>
        <span className={balanceLabel}>{short ? "Not enough stock" : "After"}</span>
        <span className={balanceValue}>
          {Math.max(after, 0)} {unit}
        </span>
      </div>
    </div>
  );
};

export default BalancePreview;
