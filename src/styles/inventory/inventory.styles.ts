// Inventory list and item detail.

export const inventoryToolbar = "flex flex-col gap-3";

// Six status tabs overflow a phone; the row scrolls sideways instead of wrapping.
export const inventoryTabsScroll = "-mx-1 overflow-x-auto px-1 pb-1";

export const inventoryActions = "flex flex-wrap items-center gap-2";

// Item column: the name, then item code, brand and fitment as one muted line.
export const itemCell = "flex min-w-0 flex-col gap-0.5 whitespace-normal";

export const itemName = "font-medium text-foreground";

export const itemMeta = "text-xs text-muted-foreground";

// Phone rows fold stock and status into one right-aligned stack.
export const itemStockStack = "flex flex-col items-end gap-1";

export const itemStockValue = "font-semibold tabular-nums text-foreground";

export const itemStockUnit = "text-xs font-normal text-muted-foreground";

export const itemSummaryHeader = "flex flex-wrap items-center gap-2";

export const itemSummaryMeta = "text-sm text-muted-foreground";

export const itemStats = "grid grid-cols-2 gap-3 md:grid-cols-4";

export const itemDetailStack = "flex flex-col gap-4";

// Names a column for screen readers without a visible header.
export const visuallyHidden = "sr-only";
