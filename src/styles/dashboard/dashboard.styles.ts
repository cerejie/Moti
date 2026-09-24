// Owner dashboard and the stock alerts sheet.

export const dashboardStack = "flex flex-col gap-4";

// Two tiles a row on a phone; the totals and the three statuses on one row on desktop.
export const summaryGrid = "grid grid-cols-2 gap-3 lg:grid-cols-5";

// Low spans the last phone row so the five tiles pair up evenly.
export const summaryWideTile = "col-span-2 lg:col-span-1";

export const alertCell = "flex min-w-0 flex-col gap-0.5 whitespace-normal";

export const alertName = "font-medium text-foreground";

export const alertMeta = "text-xs text-muted-foreground";

export const alertStockStack = "flex flex-col items-end gap-1";

export const alertStockValue = "font-semibold tabular-nums text-foreground";

export const alertStockHint = "text-xs font-normal text-muted-foreground";

export const alertsMore = "text-sm text-muted-foreground";

export const alertsSheetNote = "mt-3 text-sm text-muted-foreground";
