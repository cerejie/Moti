import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

// Semantic tones shared by badges, alerts, steppers and timelines. A status colour
// is chosen here once, by meaning, so the same state never renders two different
// colours on two different screens.
export const tone = cva("", {
  variants: {
    tone: {
      neutral: "text-muted-foreground bg-muted border-border",
      brand: "text-primary bg-primary-soft border-primary-border",
      success: "text-success bg-success-bg border-success/40",
      warning: "text-warning bg-warning-bg border-warning/40",
      danger: "text-danger bg-danger-bg border-danger/40",
      info: "text-info bg-info-bg border-info/40",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type Tone = NonNullable<VariantProps<typeof tone>["tone"]>;

// Solid fills, for the one element per surface that carries emphasis.
export const toneSolid = cva("text-white", {
  variants: {
    tone: {
      neutral: "bg-muted-foreground",
      brand: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      info: "bg-info",
    },
  },
  defaultVariants: { tone: "brand" },
});

// Small round icon chip used by stat cards, timelines and step markers.
export const toneChip =
  "flex size-8 shrink-0 items-center justify-center rounded-md border";
