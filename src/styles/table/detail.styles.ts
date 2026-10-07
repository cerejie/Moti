// RecordDetailSheet: the whole record behind a compact DataTableList row. A centred
// hero (title, subtitle, amount, status), the row's labelled metas, then the sections.
export const recordSheet = "flex flex-col gap-5 pb-4";

export const recordHero = "flex flex-col items-center gap-2 pt-2 pb-5 text-center";

export const recordHeroHeading = "flex max-w-full flex-col items-center gap-0.5";

export const recordHeroName = "max-w-full truncate text-sm font-medium text-muted-foreground";

export const recordHeroSubtitle = "max-w-full truncate text-caption text-muted-foreground";

export const recordHeroAmount = "text-2xl font-bold tabular-nums text-foreground";

export const recordHeroTags = "flex flex-wrap items-center justify-center gap-1.5";

export const recordSheetSection = "flex flex-col gap-1.5";

export const recordSheetSectionTitle =
  "flex items-center gap-1.5 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase [&_svg]:size-3.5";

export const recordSheetSectionToggle =
  "group/section-toggle flex min-h-11 w-full items-center gap-1.5 rounded-control px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5";

export const recordSheetSectionChevron =
  "ml-auto transition-transform group-aria-expanded/section-toggle:rotate-180";

export const detailRows =
  "flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border";

export const detailRow = "flex items-start justify-between gap-4 px-4 py-3 text-sm";

export const detailRowLabel = "shrink-0 text-muted-foreground";

export const detailRowValue = "min-w-0 text-right font-medium break-words text-foreground";

// The sheet footer: a primary button, outline secondaries and a "more" menu in one
// row, destructive actions stacked full width below.
export const sheetActions =
  "flex w-full flex-col gap-2 [&_[data-slot=button]]:h-12 [&>[data-slot=button]]:w-full [&_[data-slot=button][data-size^=icon]]:size-12 [&_[data-slot=button][data-size^=icon]]:shrink-0 [&_[data-slot=button][data-size^=icon]]:px-0";

export const sheetActionsRow =
  "flex w-full items-center gap-2 [&>[data-slot=button]:not([data-size^=icon])]:min-w-0 [&>[data-slot=button]:not([data-size^=icon])]:flex-1";
