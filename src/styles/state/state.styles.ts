import { cva } from "class-variance-authority";

// StateBox sits on shadcn's Empty and opts into its dashed border; only the
// tone colours are layered on.
export const stateBox = cva("border", {
  variants: {
    tone: {
      default: "bg-card",
      danger: "border-danger/40 bg-danger-bg text-danger",
    },
  },
  defaultVariants: { tone: "default" },
});

// Inline placeholder for a single value that is still loading.
export const loadingBar = "my-1 inline-block h-6 w-25 rounded-sm";
