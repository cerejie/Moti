// What to buy: the period and view switches, one ranked list, the explanation under it.
export const reorderStack = "flex flex-col gap-4";

export const reorderToolbar = "flex flex-wrap items-center gap-x-3 gap-y-2";

export const reorderToolbarLabel = "text-sm font-medium text-foreground";

export const reorderScope = "text-sm text-muted-foreground";

// "Branch: All branches" under the period, so a figure is never read under the wrong branch.
export const reorderScopeName = "font-semibold text-foreground";

export const reorderListHead = "flex flex-wrap items-center justify-between gap-2 pb-3";

export const reorderListTitle = "text-sm text-muted-foreground";

export const reorderRule = "flex flex-col gap-2 text-sm text-muted-foreground";

export const reorderSetting = "flex flex-wrap items-center gap-2 pt-1";

// A ranked row: the position, the product and its facts, the figure, the action.
export const analysisRank =
  "w-6 shrink-0 text-center text-sm font-bold tabular-nums text-muted-foreground";

// Facts wrap onto a second line instead of being cut off at phone width.
export const analysisFacts = "text-xs text-muted-foreground";

// A row's answer under the name: "60 bottles sold", "Suggested: buy 20 bottles".
export const analysisValue = "text-sm font-semibold tabular-nums text-foreground";
