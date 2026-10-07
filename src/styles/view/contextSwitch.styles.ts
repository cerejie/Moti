import { cva } from "class-variance-authority";

// TARTAR's ContextSwitch: up to four options are a segmented track with a
// sliding thumb; more become a scrolling row of chips.
export const contextSwitch = cva("", {
  variants: {
    presentation: {
      segmented: "grid w-full auto-cols-fr grid-flow-col gap-0 rounded-pill bg-muted p-1 wide:w-fit",
      chips:
        "max-w-full flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none]",
    },
  },
});

export const contextSwitchItem = cva("", {
  variants: {
    presentation: {
      segmented:
        "relative h-9 min-w-0 rounded-pill px-2 text-muted-foreground sm:px-3 hover:bg-transparent data-selected:bg-transparent data-selected:text-foreground",
      chips:
        "shrink-0 rounded-pill px-4 data-selected:border-brand data-selected:bg-brand data-selected:text-on-brand data-selected:hover:bg-brand-deep data-selected:hover:text-on-brand data-selected:focus-visible:text-on-brand dark:data-selected:text-on-brand",
    },
    dense: {
      true: "max-sm:text-xs max-sm:group-data-[spacing=0]/toggle-group:px-1",
      false: "",
    },
  },
  defaultVariants: {
    dense: false,
  },
});

export const contextSwitchThumb =
  "absolute inset-0 rounded-pill bg-panel shadow-sm transition-[translate,width] duration-200 ease-out motion-reduce:transition-none";

export const contextSwitchLabel = "relative truncate";

export const contextSwitchCount =
  "relative rounded-pill bg-track px-1.5 text-xs tabular-nums text-muted-foreground";
