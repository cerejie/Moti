// TablePagination, the footer of every paged table. On a phone it has no panel to
// rule off from, so it lines up with the cards instead.
export const paginationRoot =
  "flex flex-col items-center justify-between gap-3 border-border md:flex-row md:border-t md:px-4 md:py-3";

export const paginationSummary = "text-sm text-muted-foreground tabular-nums";

export const paginationControls = "flex items-center gap-3";

// A phone has no use for a rows-per-page picker.
export const paginationSizeGroup = "flex items-center gap-2 max-md:hidden";

// With a single page there is nothing to step through on a phone.
export const paginationSinglePage = "max-md:hidden";

export const paginationSizeLabel = "text-sm text-muted-foreground";

export const paginationSizeTrigger = "h-9 w-18";

// Pagination links are buttons, so the disabled state must read as disabled.
export const paginationStep = "cursor-pointer";

export const paginationStepDisabled =
  "pointer-events-none opacity-50";
