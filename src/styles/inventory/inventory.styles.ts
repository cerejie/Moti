import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn.utils";
import { moneyLevel } from "../common/money.styles";
import { pageSubtitle, pageTitle } from "../common/typography.styles";

// Item name over its item code / brand line, in table cells and cards alike.
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
      md: "text-body",
      lg: "text-2xl",
      xl: "text-hero",
    },
  },
  defaultVariants: { status: "in_stock", size: "md" },
});

export const onHandUnit = "ml-1 text-xs font-medium text-muted-foreground";

export const priceText = moneyLevel({ level: "supporting" });

export const mutedText = "text-muted-foreground";

export const rowActions = "flex items-center justify-end gap-1";

// Phone row status under the on-hand figure: only a problem gets a colour.
export const stockStatusText = cva("text-xs font-medium", {
  variants: {
    status: {
      in_stock: "text-muted-foreground",
      low: "text-warning",
      out: "text-danger",
      archived: "text-muted-foreground",
    },
  },
  defaultVariants: { status: "in_stock" },
});

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

// Item detail page: one readable column of grouped sections, like a native detail screen.
export const itemDetailPage = "flex w-full flex-col gap-6 wide:max-w-2xl";

// The name is the page title and wraps rather than truncates.
export const itemDetailHeading = "flex min-w-0 flex-col gap-1";

export const itemDetailTitle = cn(pageTitle, "break-words");

export const itemDetailMeta = pageSubtitle;

export const itemDetailSection = "flex flex-col gap-2";

export const itemDetailSectionTitle =
  "px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase";

// Lifts the grouped rows off the page backdrop.
export const itemDetailSurface = "overflow-hidden rounded-card bg-card";

// The stock hero: the number the owner opens the page for, with its two actions.
export const itemStockBody = "flex flex-col gap-4";

export const itemStockTop = "flex items-start justify-between gap-3";

export const itemStockFigure = "flex flex-col gap-1";

export const itemStockLabel = "text-xs font-medium tracking-wide text-muted-foreground uppercase";

export const itemStockHint = "text-sm text-muted-foreground";

export const itemStockActions = "grid grid-cols-2 gap-2";

export const itemMovementList =
  "flex flex-col divide-y overflow-hidden rounded-card border bg-card";

export const itemMovementRow = "flex items-center gap-3 px-4 py-3";

export const itemMovementText = "flex min-w-0 flex-1 flex-col gap-0.5";

// Direction is carried by the arrow and the sign as well as the colour.
export const itemMovementIcon = cva(
  "flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
  {
    variants: {
      direction: {
        in: "bg-success-bg text-success",
        out: "bg-danger-bg text-danger",
      },
    },
  },
);

export const itemManageActions = "flex flex-col gap-2";

export const itemManageButton = "w-full";

export const itemManageHint = "px-1 text-sm text-muted-foreground";
