import type { ReactNode } from "react";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { useCanHover } from "../../../hook/common/breakpoint.hook";

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
  // A touch-only screen never hovers away, so a tapped tooltip would stay up; aria-label still names the control.
  const canHover = useCanHover();

  return (
    <TooltipTrigger isDisabled={isDisabled || !canHover}>
      {children}
      <Tooltip placement={side}>{label}</Tooltip>
    </TooltipTrigger>
  );
};

export default AppTooltip;
