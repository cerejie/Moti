import { cva } from "class-variance-authority";

export const sectionCardRoot = cva("h-full", {
  variants: {
    flush: {
      true: "py-0",
      false: "",
    },
  },
  defaultVariants: { flush: false },
});

export const sectionCardTitle = "font-heading font-semibold";

// Stacked extras drop under the title on a phone and take the full row.
export const sectionCardExtra = cva("flex items-center gap-2", {
  variants: {
    stacked: {
      true: "compact:col-span-full compact:row-span-1 compact:row-start-3 compact:mt-2 compact:justify-self-stretch",
      false: "",
    },
  },
  defaultVariants: { stacked: false },
});

export const sectionCardBody = "flex-1";

// A flush body lets a table or list reach the card edge.
export const sectionCardFlushBody = "px-0";

// A flush card still pads its own header and footer.
export const sectionCardInset = "py-4";

export const sectionCardFooter = "flex-wrap gap-2 border-t";

export const sectionCardSkeleton = "h-56 w-full";
