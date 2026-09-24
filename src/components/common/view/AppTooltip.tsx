import type { ReactNode } from "react";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

type IProps = {
  label: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  // A single focusable element that accepts a ref, e.g. a Button.
  children: ReactNode;
};

// Short text hint for an icon-only control.
const AppTooltip = ({ label, side, children }: IProps) => {
  return (
    <TooltipTrigger>
      {children}
      <Tooltip placement={side}>{label}</Tooltip>
    </TooltipTrigger>
  );
};

export default AppTooltip;
