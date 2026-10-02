import { cva } from "class-variance-authority";

// The not-synced sheet: one row per write still on this device.
export const syncQueueList = "flex flex-col divide-y";

export const syncQueueRow = "flex items-start gap-3 py-3";

export const syncQueueRowText = "flex min-w-0 flex-1 flex-col gap-0.5";

export const syncQueueRowTitle = "text-sm font-medium text-foreground";

export const syncQueueRowStatus = cva("text-xs", {
  variants: {
    failed: {
      true: "text-danger",
      false: "text-muted-foreground",
    },
  },
  defaultVariants: { failed: false },
});
