import { cva } from "class-variance-authority";

// Native phone list: one surface for the whole list, rows split by hairlines.
export const listGroup = "flex flex-col divide-y divide-border overflow-hidden rounded-xl border bg-card";

export const listGroupItem = "list-none";

// text-base: a list inside tabs would otherwise inherit their smaller text.
export const listRow =
  "flex min-h-14 w-full cursor-default items-center gap-3 px-4 py-2.5 text-left text-base outline-none transition-colors data-[pressed]:bg-muted data-[focus-visible]:ring-3 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ring/50";

// A row with its own control (Add, stepper, ⋮) beside it, outside the row's button.
export const listRowShell = "flex items-center gap-1 pr-2";

export const listRowWithAction = "min-w-0 flex-1 pr-2";

// Keeps a ⋮-wide column when a row has no menu (your own account), so trailing values line up.
export const listRowAction = "flex min-w-11 shrink-0 items-center justify-center";

export const listRowText = "flex min-w-0 flex-1 flex-col gap-0.5";

export const listRowTitle = "truncate font-semibold text-foreground";

export const listRowSubtitle = "truncate text-xs text-muted-foreground";

export const listRowTrailing = "flex shrink-0 flex-col items-end gap-0.5 text-right";

// A small line in the trailing slot; only a state that needs attention gets a colour.
export const listRowNote = cva("text-xs font-medium", {
  variants: {
    tone: {
      muted: "text-muted-foreground",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-info",
    },
  },
  defaultVariants: { tone: "muted" },
});

export const listRowChevron = "size-4 shrink-0 text-muted-foreground";

export const listSkeletonRow = "flex min-h-14 items-center px-4";

export const listSkeletonBar = "h-8 w-full";
