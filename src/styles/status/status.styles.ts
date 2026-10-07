import { cva } from "class-variance-authority";

export const emptyState = "min-h-56 p-6";

// One quiet line for an empty state that must not push real content down.
export const emptyLine =
  "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-success";

export const errorState = cva("", {
  variants: {
    compact: { true: "gap-3 p-4", false: "min-h-56 p-6" },
  },
  defaultVariants: { compact: false },
});

// Being offline is not the user's mistake, so it keeps the softer warning chip.
export const errorStateMedia = cva("", {
  variants: {
    offline: {
      true: "bg-warning-bg text-warning",
      false: "bg-danger-bg text-danger",
    },
  },
  defaultVariants: { offline: false },
});

export const refreshBar = cva(
  "pointer-events-none absolute inset-x-0 z-10 h-0.5 overflow-hidden rounded-pill bg-brand-soft",
  {
    variants: {
      placement: {
        edge: "top-0",
        above: "-top-1.5",
      },
    },
  },
);

export const refreshBarFill =
  "h-full w-1/3 bg-brand motion-safe:animate-route-progress motion-reduce:w-full motion-reduce:opacity-60";
