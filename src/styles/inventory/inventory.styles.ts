import { cva } from "class-variance-authority";

// Item name over its SKU / brand line, in table cells and cards alike.
export const itemIdentity = "flex min-w-0 flex-col gap-0.5";

export const itemName = "truncate font-semibold text-foreground";

export const itemMeta = "truncate text-xs text-muted-foreground";

// The on-hand figure is the number the counter reads at a glance.
export const onHandValue = cva("font-bold tabular-nums", {
  variants: {
    status: {
      in_stock: "text-foreground",
      low: "text-warning",
      out: "text-danger",
    },
    size: {
      md: "text-md",
      lg: "text-2xl",
    },
  },
  defaultVariants: { status: "in_stock", size: "md" },
});

export const onHandUnit = "ml-1 text-xs font-medium text-muted-foreground";

export const priceText = "tabular-nums text-foreground";

export const mutedText = "text-muted-foreground";

export const rowActions = "flex items-center justify-end gap-1";

// Phone card row.
export const itemCard =
  "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card-sm active:border-primary";

export const itemCardTop = "flex items-start justify-between gap-3";

export const itemCardBottom = "flex items-center justify-between gap-3";

export const itemCardStock = "flex items-baseline";

export const itemCardActions = "flex items-center gap-1";

export const itemCardOpen = "min-w-0 flex-1 text-left";

// Toolbar tabs sit on their own row on phones, beside the selects from md up.
export const inventoryViewTabs = "w-full md:w-auto";

// Stock dialog: what is being moved, and the before → after preview.
export const stockSummary = "flex items-center justify-between gap-3 rounded-xl bg-muted p-3";

export const stockPreview = cva(
  "flex items-center justify-center gap-3 rounded-xl border p-3 text-lg font-bold tabular-nums",
  {
    variants: {
      tone: {
        default: "border-border text-foreground",
        warning: "border-warning/40 bg-warning-bg text-warning",
        danger: "border-danger/40 bg-danger-bg text-danger",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export const stockPreviewArrow = "size-5 text-muted-foreground";

export const stockForm = "flex flex-col gap-4";

// Item detail: its movement history under the facts.
export const historyList = "flex flex-col divide-y rounded-xl border";

export const historyRow = "flex items-center justify-between gap-3 px-3 py-2.5";

export const historyText = "flex min-w-0 flex-col gap-0.5";

export const historyQuantity = cva("shrink-0 font-bold tabular-nums", {
  variants: {
    direction: {
      in: "text-success",
      out: "text-danger",
    },
  },
});

export const detailActions = "flex flex-wrap gap-2";
