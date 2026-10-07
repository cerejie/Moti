import { cva } from "class-variance-authority";

// FilterToolbar, ported from TARTAR. data-compact (set when there are actions) keeps the
// row on one line on compact; toolbar-searching shrinks its buttons to icons while searching.
export const filterToolbar = "flex flex-wrap items-center gap-2 compact:data-compact:flex-nowrap";

export const filterToolbarStart =
  "flex min-w-0 flex-auto flex-wrap items-center gap-2 compact:in-data-compact:flex-none compact:in-data-compact:flex-nowrap compact:in-data-compact:[&>[data-slot=button]]:h-10 compact:in-data-compact:[&>[data-slot=button]]:rounded-full compact:in-data-compact:[&>[data-slot=button]]:px-4 has-[[data-toolbar-search]]:flex-1 toolbar-searching:[&>[data-slot=button]]:size-10 toolbar-searching:[&>[data-slot=button]]:px-0!";

export const filterToolbarActions =
  "ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 compact:in-data-compact:flex-nowrap compact:in-data-compact:[&>[data-slot=button]]:h-10 compact:in-data-compact:[&>[data-slot=button]]:rounded-full compact:in-data-compact:[&>[data-slot=button]]:px-4 toolbar-searching:[&>[data-slot=button]]:size-10 toolbar-searching:[&>[data-slot=button]]:px-0!";

export const filterSearch = cva("w-full", {
  variants: {
    toolbar: {
      true: "min-w-0 flex-1 rounded-full compact:h-10",
      false: "wide:w-56",
    },
  },
  defaultVariants: { toolbar: false },
});

export const filterSelect = "w-full wide:w-40";

export const filterReset = "rounded-full";

// The compact Filters button: its label hides while the search is in use, the count stays.
export const filterPill = "relative rounded-full";

export const filterPillLabel = "toolbar-searching:sr-only";

export const filterPillBadge =
  "flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1 text-xs font-bold text-primary-foreground tabular-nums toolbar-searching:absolute toolbar-searching:-top-1 toolbar-searching:-right-1";

export const filterSheetBody = "flex flex-col gap-3";

export const filterSheetSelect = "w-full";
