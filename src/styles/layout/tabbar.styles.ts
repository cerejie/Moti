import { cva } from "class-variance-authority";

// TARTAR's AppTabBar: a floating rounded bar, the last row of the compact shell,
// lifted clear of the home indicator. The active tab is the brand colour with a
// filled icon and a bar beneath it.
export const tabbarRoot =
  "shrink-0 px-3 pt-2 pb-safe select-none touch-callout-none [view-transition-name:app-tab-bar]";

export const tabbarList =
  "relative mx-auto grid max-w-xl auto-cols-fr grid-flow-col overflow-hidden rounded-panel bg-panel shadow-panel";

export const tabbarItem = cva(
  "relative flex h-16 w-full flex-col items-center justify-center gap-1 px-1 text-xs transition-[color,scale] duration-(--motion-fast) ease-(--motion-ease-standard) outline-none focus-visible:bg-muted active:scale-95 motion-reduce:active:scale-100",
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

// One indicator for the whole bar, one tab wide, sliding to the active tab.
export const tabbarIndicatorTrack = cva(
  "pointer-events-none absolute bottom-0 left-0 flex h-1 justify-center transition-[translate] duration-(--motion-slow) ease-(--motion-ease-spring) motion-reduce:transition-none",
  {
    variants: {
      count: { 2: "w-1/2", 3: "w-1/3", 4: "w-1/4", 5: "w-1/5", 6: "w-1/6" },
      index: {
        0: "translate-x-0",
        1: "translate-x-full",
        2: "translate-x-[200%]",
        3: "translate-x-[300%]",
        4: "translate-x-[400%]",
        5: "translate-x-[500%]",
      },
    },
    defaultVariants: { count: 5, index: 0 },
  },
);

export type ITabCount = 2 | 3 | 4 | 5 | 6;
export type ITabIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const tabbarIndicator = "h-full w-10 rounded-t-full bg-brand";
