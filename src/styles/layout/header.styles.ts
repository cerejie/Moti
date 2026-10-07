// TARTAR's wide-screen header: a floating panel carrying the brand, the page
// title and the account actions.
export const headerRoot =
  "flex h-16 shrink-0 items-center gap-3 rounded-panel border bg-panel px-4 shadow-panel select-none touch-callout-none";

export const headerDivider = "mx-1 h-6";

export const headerTitle = "min-w-0 truncate font-heading text-lg font-semibold text-foreground";

// A wizard step's back action, kept from the original shell.
export const headerBack =
  "min-w-0 shrink text-base font-medium [&_svg:not([class*='size-'])]:size-5";

export const headerBackLabel = "truncate";

export const headerActions = "ml-auto flex shrink-0 items-center gap-2";
