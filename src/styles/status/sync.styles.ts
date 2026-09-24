// Topbar sync indicator and the Sync issues sheet.

// The count pill rides the icon button's corner.
export const syncButton = "relative [&_svg:not([class*='size-'])]:size-6";

export const syncCount =
  "absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-pill bg-primary px-1 text-xs font-semibold tabular-nums text-primary-foreground";

export const syncCountFailed = "bg-danger text-white";

export const syncList = "flex flex-col divide-y divide-border rounded-md border border-border";

export const syncRow = "flex min-h-touch items-start justify-between gap-3 px-3 py-2";

export const syncRowText = "flex min-w-0 flex-col gap-1";

export const syncLabel = "font-medium text-foreground";

export const syncMeta = "text-xs text-muted-foreground";

export const syncError = "text-sm text-danger";

export const syncIntro = "mb-3";
