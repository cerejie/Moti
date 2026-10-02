import { cva } from "class-variance-authority";

// The Moti mark: a brand tile with a slanted "M", beside an italic wordmark —
// the one sporty flourish in an otherwise plain management UI.
export const brandRoot = "flex shrink-0 items-center gap-2.5";

export const brandMark = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg bg-primary font-black text-primary-foreground italic",
  {
    variants: {
      size: {
        sm: "size-9 text-lg",
        lg: "size-11 text-xl",
      },
    },
    defaultVariants: { size: "sm" },
  },
);

export const brandWordmark = cva("font-black tracking-widest uppercase italic", {
  variants: {
    tone: {
      default: "text-foreground",
      hero: "text-on-hero",
    },
    size: {
      sm: "text-lg",
      lg: "text-xl",
    },
  },
  defaultVariants: { tone: "default", size: "sm" },
});
