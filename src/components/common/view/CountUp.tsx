import { cn } from "@/utils/cn.utils";
import { useCountUp } from "../../../hook/common/countUp.hook";
import { countUpBump } from "../../../styles/common/motion.styles";

type IProps = {
  value: number;
  format: (value: number) => string;
  // Springs on every change, e.g. a cart total as items are added.
  bump?: boolean;
  className?: string;
};

// A figure that counts to its value when it appears or changes.
const CountUp = ({ value, format, bump = false, className }: IProps) => {
  const ref = useCountUp<HTMLSpanElement>(value, format, bump);

  return (
    <span ref={ref} className={cn(bump && countUpBump, className)}>
      {format(value)}
    </span>
  );
};

export default CountUp;
