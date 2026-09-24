import { cva } from "class-variance-authority";

// SegmentTabs - the stock shadcn tabs as a segmented either-or. `md` renders
// as the registry ships it: muted track, selected tab lifted on the card colour.
// `lg` is a prominent choice - a taller track on the muted ground, each tab led by its icon, with the
// selected tab as the primary pill.
export const segmentTabsList = cva(
  "inline-flex w-fit justify-center text-muted-foreground",
  {
    variants: {
      size: {
        md: "h-12 items-center rounded-lg p-1",
        lg: "h-18! items-stretch rounded-lg border border-border bg-muted p-1.5 shadow-card-sm",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// `lg` swaps the registry's selected colour for the primary pair and keeps the
// hover from undoing it; `md` only sizes the stock trigger.
export const segmentTabsTrigger = cva("cursor-pointer", {
  variants: {
    size: {
      md: "px-5 text-base font-semibold [&_svg:not([class*='size-'])]:size-5",
      lg: "h-full gap-3 px-4 text-lg font-semibold text-foreground hover:text-primary data-selected:bg-primary data-selected:text-primary-foreground data-selected:shadow-sm data-selected:hover:text-primary-foreground dark:data-selected:border-transparent dark:data-selected:bg-primary [&_svg:not([class*='size-'])]:size-6",
    },
  },
  defaultVariants: { size: "md" },
});

export const segmentTabsContent = "flex flex-col gap-3";

// Fill mode: the list takes its container and the tabs split it evenly.
export const segmentTabsListFill = "flex w-full";

export const segmentTabsTriggerFill = "flex-1";
