// Smart Analyzer: period controls, summary tiles and the two ranking tables.

export const analyzerStack = "flex flex-col gap-4";

// Period on the left, metric on the right from md up; stacked on a phone.
export const analyzerControls =
  "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between";

export const analyzerPeriodGroup = "flex flex-col gap-2 sm:flex-row sm:items-center";

export const periodStepper = "flex items-center gap-1";

export const periodStepButton = "size-touch md:size-9";

export const periodLabel =
  "min-w-0 flex-1 truncate text-center text-sm font-medium tabular-nums md:min-w-44 md:flex-none";

// Two tiles a row on a phone; one row of four on desktop.
export const summaryGrid = "grid grid-cols-2 gap-3 lg:grid-cols-4";

// A lone tile spans the phone row so the grid stays even.
export const summaryWideTile = "col-span-2 lg:col-span-1";

// A name, not a number: smaller than the tile's value type, cut to one line.
export const topItemName = "block truncate text-base";

export const rankValue = "font-semibold tabular-nums text-foreground";

export const analyzerCell = "flex min-w-0 flex-col gap-0.5 whitespace-normal";

export const analyzerName = "font-medium text-foreground";

export const analyzerMeta = "text-xs text-muted-foreground";

// Phone rows fold the number and the status badge into one stack.
// Phone rows fold the number and the status badge into one stack.
export const analyzerEndStack ="flex flex-col items-end gap-1";

export const analyzerValue = "font-semibold tabular-nums text-foreground";

export const analyzerHint = "text-xs font-normal text-muted-foreground";
