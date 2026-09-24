import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/utils/cn.utils";
import {
  segmentedControlItem,
  segmentedControlRoot,
} from "../../../styles/filter/segmentedControl.styles";

export type ISegmentedOption = {
  value: string;
  label: string;
  icon?: ReactNode;
};

type IProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: ISegmentedOption[];
  label: string;
  // lg spreads the control over the full width in equal columns, for a choice
  // that leads a section rather than sitting in a toolbar.
  size?: "sm" | "lg";
  className?: string;
};

const SegmentedControl = ({
  value,
  onValueChange,
  options,
  label,
  size = "sm",
  className,
}: IProps) => {
  // The joined, zero-spacing group is the toolbar control. The full-width one
  // is separate pills in a bordered track, which is the plain variant spaced.
  const isWide = size === "lg";

  return (
    <ToggleGroup
      variant={isWide ? "default" : "outline"}
      spacing={isWide ? 1 : 0}
      selectionMode="single"
      // A segmented control always has a selection.
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const [next] = keys;
        if (next !== undefined) onValueChange(String(next));
      }}
      aria-label={label}
      className={cn(segmentedControlRoot({ size }), className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          id={option.value}
          aria-label={option.label}
          className={segmentedControlItem({ size })}
        >
          {option.icon}
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default SegmentedControl;
