import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

// Colour-only fills for the two states shadcn's Button has no variant for,
// layered over variant="outline". Every other button is a shadcn variant as
// generated: destructive for danger, secondary for the soft fill.
export const buttonTone = cva("", {
  variants: {
    tone: {
      none: "",
      // The soft indigo fill on in-card actions such as Edit Information.
      brandSoft:
        "border-primary-border bg-primary-soft text-primary hover:bg-primary-soft/70 hover:text-primary-hover",
      dangerSoft:
        "border-danger/35 bg-danger-bg/60 text-danger hover:bg-danger-bg hover:text-danger",
      // The amber "action needed" button on rows waiting on the user.
      warningSoft:
        "border-warning bg-warning-bg text-warning hover:bg-warning-bg/70 hover:text-warning",
    },
  },
  defaultVariants: { tone: "none" },
});

export type IButtonTone = NonNullable<VariantProps<typeof buttonTone>["tone"]>;
