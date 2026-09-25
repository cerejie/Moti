// TablePagination, the footer of every paged table.
export const paginationRoot =
  "flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 md:flex-row";

export const paginationSummary = "text-sm text-muted-foreground tabular-nums";

export const paginationControls = "flex items-center gap-3";

export const paginationSizeGroup = "flex items-center gap-2";

export const paginationSizeLabel = "text-sm text-muted-foreground";

// Set on the Select root, so it reaches the trigger inside for a full touch target on a phone.
export const paginationSizeTrigger =
  "w-18 max-md:**:data-[slot=select-trigger]:min-h-touch";

// Pagination links are buttons, so the disabled state must read as disabled.
// Icon-only on a phone, where they grow to a full touch target.
export const paginationStep = "cursor-pointer max-md:min-h-touch max-md:min-w-touch";

export const paginationStepDisabled =
  "pointer-events-none opacity-50";
