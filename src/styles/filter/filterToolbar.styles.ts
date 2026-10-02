// FilterToolbar. Replaces the inline search + select markup on each list screen.
export const filterToolbarRoot =
  "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center";

export const filterSearch = "min-w-0 flex-1 md:max-w-xs";

export const filterControls = "flex flex-wrap items-center gap-2";

// Touch target on a phone; the desktop height and width are shadcn's.
export const filterSelect = "min-h-touch w-full md:min-h-9 md:w-45";

export const filterReset = "min-h-touch md:min-h-9";

// Phone row: search takes the width, the Filters button sits at its end.
export const filterSearchRow = "flex items-center gap-2";

export const filterSheetTrigger = "min-h-touch shrink-0";

export const filterSheetBadge =
  "flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1 text-xs font-bold text-primary-foreground tabular-nums";

export const filterSheetBody = "flex flex-col gap-3";

export const filterSheetSelect = "w-full";
