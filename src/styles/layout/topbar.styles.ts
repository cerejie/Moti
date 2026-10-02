// The app bar on phones (ruled off below, under the status bar) and a floating
// panel on desktop, carrying the brand, the page title and the account actions.
export const topbarRoot =
  "flex min-h-14 shrink-0 items-center gap-2 border-b bg-panel px-4 pt-safe select-none touch-callout-none md:h-16 md:rounded-panel md:border md:px-5 md:pt-0 md:shadow-panel";

export const topbarBrandDesktop = "max-md:hidden";

export const topbarBrandPhone = "md:hidden";

export const topbarDivider = "mx-2 h-6 max-md:hidden";

export const topbarTitle = "min-w-0 truncate text-lg font-semibold text-foreground";

// A wizard step's back action, kept from the original shell.
export const topbarBack =
  "min-w-0 shrink text-base font-medium [&_svg:not([class*='size-'])]:size-5";

export const topbarBackLabel = "truncate";

export const topbarActions = "ml-auto flex shrink-0 items-center gap-1 md:gap-2";
