import { cva } from "class-variance-authority";

// The notification center: action, stock alerts and updates stacked.
export const inboxCenter = "flex flex-col gap-5";

export const inboxSection = "flex flex-col gap-1";

export const inboxSectionHeader = "flex min-h-11 items-center justify-between gap-2";

export const inboxSectionTitle =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

export const inboxList = "flex flex-col divide-y";

// A whole row is the touch target, so the ghost button drops its fixed height.
export const inboxRow =
  "h-auto w-full items-start justify-start gap-3 rounded-lg px-2 py-3 text-left whitespace-normal";

export const inboxRowIcon = cva(
  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-pill [&_svg]:size-4",
  {
    variants: {
      pending: {
        true: "bg-warning-bg text-warning",
        false: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { pending: false },
  },
);

export const inboxRowText = "flex min-w-0 flex-1 flex-col gap-0.5";

export const inboxRowTitle = cva("text-sm", {
  variants: {
    unread: {
      true: "font-semibold text-foreground",
      false: "font-medium text-muted-foreground",
    },
  },
  defaultVariants: { unread: false },
});

export const inboxRowBody = "line-clamp-2 text-sm text-muted-foreground";

export const inboxRowMeta = "text-xs text-muted-foreground";

export const inboxUnreadDot = "mt-2 size-2 shrink-0 rounded-pill bg-primary";
