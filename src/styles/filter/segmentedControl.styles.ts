import { cva } from "class-variance-authority";

// SegmentedControl. `sm` is the stock shadcn toggle group. `lg` is a full-width
// either-or: equal columns, the chosen one filled in.
export const segmentedControlRoot = cva("", {
  variants: {
    size: {
      sm: "",
      lg: "grid w-full grid-flow-col auto-cols-fr gap-1 rounded-pill border bg-card p-1",
    },
  },
  defaultVariants: { size: "sm" },
});

export const segmentedControlItem = cva("", {
  variants: {
    size: {
      sm: "",
      lg: "h-11 rounded-pill border-transparent px-3 text-sm font-semibold text-muted-foreground data-selected:bg-primary data-selected:text-primary-foreground data-selected:shadow-card-sm md:px-4 md:text-md",
    },
  },
  defaultVariants: { size: "sm" },
});
