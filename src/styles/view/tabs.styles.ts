import { cva } from "class-variance-authority";

// Row that pairs a tab list with a panel's own actions, e.g. an Add button
// sitting beside the Grid / List tabs.
export const viewTabsBar = "flex flex-wrap items-center justify-between gap-3";

// The list keeps its stock width in that row so the actions stay at the end.
export const viewTabsListInline = "w-fit";

// ViewTabs. `underline` is a section switcher; `chip` is a scrolling strip,
// one tab per item. Each is the stock shadcn `line` tab list;
// these add layout only. A segmented either-or is SegmentTabs.
export const viewTabsList = cva("w-full", {
  variants: {
    variant: {
      underline: "justify-start",
      chip: "snap-x snap-proximity justify-start overflow-x-auto",
    },
  },
  defaultVariants: { variant: "underline" },
});

export const viewTabsTrigger = cva("", {
  variants: {
    variant: {
      underline: "flex-none",
      chip: "max-w-64 flex-none snap-start",
    },
  },
  defaultVariants: { variant: "underline" },
});

export const viewTabsContent = cva("", {
  variants: {
    variant: {
      underline: "p-6",
      chip: "flex flex-col gap-3",
    },
  },
  defaultVariants: { variant: "underline" },
});
