import { cva } from "class-variance-authority";

// Stock form, stock actions and the movement history tables.

// The item page's stock buttons: full width and thumb-sized on a phone, a row from sm up.
export const stockActions = "grid grid-cols-1 gap-2 sm:flex sm:flex-wrap";

export const stockActionButton = "min-h-touch";

// Before → after preview under the stock form's fields.
export const balancePreview =
  "flex items-center justify-between gap-3 rounded-md border px-3 py-2";

export const balanceSide = "flex flex-col";

export const balanceLabel = "text-xs text-muted-foreground";

export const balanceValue = "text-lg font-semibold tabular-nums";

export const balanceArrow = "size-4 shrink-0 text-muted-foreground";

export const movementToolbar = "flex flex-col gap-3";

// Item column and phone rows: a main line, then a muted meta line.
export const movementCell = "flex min-w-0 flex-col gap-0.5 whitespace-normal";

export const movementTitle = "font-medium text-foreground";

export const movementMeta = "text-xs text-muted-foreground";

export const movementNote = "whitespace-normal text-sm text-muted-foreground";

// Phone rows fold the signed quantity and the balance after into one stack.
export const movementQuantityStack = "flex flex-col items-end gap-0.5";

export const movementQuantity = cva("font-semibold tabular-nums", {
  variants: {
    direction: {
      in: "text-success",
      out: "text-danger",
    },
  },
});

export const movementBalance = "text-xs tabular-nums text-muted-foreground";
