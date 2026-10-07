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

// A figure's own colour: only gains, losses and warnings tint it, the rest stay ink.
export const toneText = cva("", {
  variants: {
    tone: {
      neutral: "text-foreground",
      brand: "text-foreground",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});

// Soft icon chip beside a figure.
export const toneChip = cva("", {
  variants: {
    tone: {
      neutral: "bg-muted text-foreground",
      brand: "bg-brand-soft text-brand",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      danger: "bg-danger-bg text-danger",
      info: "bg-info-soft text-info",
    },
  },
  defaultVariants: { tone: "neutral" },
});

// Solid fill for bars, dots and progress indicators.
export const toneFill = cva("", {
  variants: {
    tone: {
      neutral: "bg-primary",
      brand: "bg-brand",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      info: "bg-info",
    },
  },
  defaultVariants: { tone: "neutral" },
});
