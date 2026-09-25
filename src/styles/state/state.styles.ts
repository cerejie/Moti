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

// Skeletons hold a region's space while its code or data loads, sized like what replaces them.
export const skeletonAnnounce = "sr-only";

export const skeletonStack = "flex flex-col gap-4";

export const skeletonPageTitle = "h-8 w-48";

export const skeletonPageSubtitle = "h-5 w-72 max-w-full";

export const skeletonBackLink = "mt-4 h-8 w-44";

export const skeletonCardTitle = "h-5 w-36";

export const skeletonLine = "h-4 w-full";

export const skeletonLineShort = "h-4 w-2/3";

export const skeletonField = "flex flex-col gap-2";

export const skeletonFieldLabel = "h-4 w-28";

export const skeletonFieldControl = "h-9 w-full";

export const skeletonToolbar = "h-9 w-full";

export const skeletonTableRows = "flex flex-col gap-2 py-3";

export const skeletonTableRow = "h-12 w-full";

// Two tiles a row on a phone, like every summary grid.
export const statsSkeletonGrid = cva("grid grid-cols-2 gap-3", {
  variants: {
    count: {
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
    },
  },
  defaultVariants: { count: 4 },
});

// The height of a md StatCard: padding, label and value.
export const statsSkeletonTile = "h-19 rounded-lg";
