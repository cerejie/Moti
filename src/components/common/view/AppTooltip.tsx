import type { ReactNode } from "react";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

type IProps = {
  label: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  // For a control that is icon-only at some widths and labelled at others.
  isDisabled?: boolean;
  // A single focusable element that accepts a ref, e.g. a Button.
  children: ReactNode;
};

// Short text hint for an icon-only control.
const AppTooltip = ({ label, side, isDisabled, children }: IProps) => {
  return (
    <TooltipTrigger isDisabled={isDisabled}>
      {children}
      <Tooltip placement={side}>{label}</Tooltip>
    </TooltipTrigger>
  );
};

export default AppTooltip;
