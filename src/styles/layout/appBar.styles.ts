import { cva } from "class-variance-authority";

// TARTAR's compact app bar: under the status bar, ruled off only once the
// content scrolls beneath it.
export const appBar = cva(
  "box-content flex h-14 shrink-0 items-center gap-2 border-b bg-panel px-3 pt-safe transition-[border-color,box-shadow] select-none touch-callout-none [view-transition-name:app-bar] motion-reduce:transition-none",
  {
    variants: {
      scrolled: {
        true: "border-border shadow-sm",
        false: "border-transparent",
      },
    },
    defaultVariants: { scrolled: false },
  },
);

export const appBarLeading = "flex min-w-11 shrink-0 items-center";

export const appBarBack = "-ml-1 size-11 [&_svg:not([class*='size-'])]:size-5";

export const appBarTitle =
  "min-w-0 flex-1 truncate text-center font-heading text-base font-semibold text-foreground";

export const appBarActions = "flex shrink-0 items-center gap-1";
