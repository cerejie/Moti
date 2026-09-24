import { cva } from "class-variance-authority";

// Metric tile on shadcn's Item (outline). Item owns the layout, padding and
// focus ring; only the tone colours are layered on. Tones come from the
// shared semantic set so the same meaning is never two colours. `lg` is a
// summary row: roomier padding and a bigger icon chip and type.
export const statCardRoot = cva("", {
  variants: {
    tone: {
      neutral: "",
      brand: "border-primary/50 bg-primary/5",
      success: "border-success/60 bg-success/5",
      warning: "border-warning/50 bg-warning/5",
      danger: "border-danger/50 bg-danger/5",
      info: "border-link/50 bg-link/5",
    },
    size: {
      md: "",
      lg: "gap-4 px-6 py-5",
    },
  },
  defaultVariants: { tone: "neutral", size: "md" },
});

// Solid tone circle on the ItemMedia icon chip; the aria icon variant sizes
// only the svg, so the chip's own size lives here.
export const statCardIcon = cva("rounded-full border-transparent text-white", {
  variants: {
    tone: {
      neutral: "bg-muted-foreground",
      brand: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      info: "bg-info",
    },
    size: {
      md: "size-9 [&_svg:not([class*='size-'])]:size-5",
      lg: "size-12 [&_svg:not([class*='size-'])]:size-6",
    },
  },
  defaultVariants: { tone: "neutral", size: "md" },
});

export const statCardLabel = cva("", {
  variants: {
    tone: {
      neutral: "text-muted-foreground",
      brand: "text-primary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-info",
    },
    size: {
      md: "",
      lg: "text-md",
    },
  },
  defaultVariants: { tone: "neutral", size: "md" },
});

export const statCardValue = cva(
  "truncate font-semibold tabular-nums text-foreground",
  {
    variants: {
      size: {
        md: "text-md",
        lg: "text-xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export const statCardTrailing = "text-muted-foreground";
