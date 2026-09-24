import { cva } from "class-variance-authority";

// AppAlert sits on shadcn's Alert; the surface colours come from the shared
// tone set, and the description follows the tone the way shadcn's destructive
// variant does, so the whole notice reads in one colour.
export const appAlertDescription = cva("", {
  variants: {
    tone: {
      neutral: "",
      brand: "*:data-[slot=alert-description]:text-primary/90",
      success: "*:data-[slot=alert-description]:text-success/90",
      warning: "*:data-[slot=alert-description]:text-warning/90",
      danger: "*:data-[slot=alert-description]:text-danger/90",
      info: "*:data-[slot=alert-description]:text-info/90",
    },
  },
  defaultVariants: { tone: "neutral" },
});

// Buttons under the text, aligned with it in the alert's second column.
export const appAlertActions = "col-start-2 mt-2 flex flex-wrap items-center gap-2";

// An icon-only dismiss button pinned to the alert's top-right corner.
export const appAlertDismiss = "absolute top-2 right-2";
