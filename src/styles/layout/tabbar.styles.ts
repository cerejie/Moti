import { cva } from "class-variance-authority";

// TARTAR's AppTabBar: a floating rounded bar, the last row of the compact shell,
// lifted clear of the home indicator. The active tab is the brand colour with a
// filled icon and a bar beneath it.
export const tabbarRoot =
  "shrink-0 px-3 pt-2 pb-safe select-none touch-callout-none [view-transition-name:app-tab-bar]";

export const tabbarList =
  "mx-auto grid max-w-xl auto-cols-fr grid-flow-col overflow-hidden rounded-panel bg-panel shadow-panel";

export const tabbarItem = cva(
  "relative flex h-16 w-full flex-col items-center justify-center gap-1 px-1 text-xs transition-colors outline-none focus-visible:bg-muted",
  {
    variants: {
      active: {
        true: "font-semibold text-brand [&_svg]:fill-current",
        false: "font-medium text-muted-foreground",
      },
    },
    defaultVariants: { active: false },
  },
);

export const tabbarIcon = "relative flex h-7 w-10 items-center justify-center [&_svg]:size-5";

export const tabbarLabel = "max-w-full truncate";

export const tabbarIndicator =
  "absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-t-full bg-brand";
