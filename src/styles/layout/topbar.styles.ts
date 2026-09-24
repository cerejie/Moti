// Bar over the content on the rail's own surface, closed off below by a
// hairline. It opens with the rail's trigger, names the page, and carries a
// wizard step's back link and the theme toggle.
export const topbarRoot =
  "sticky top-0 z-20 flex min-h-topbar items-center gap-2 border-b bg-sidebar px-4 pt-safe md:gap-3 md:px-6 lg:px-8";

// Set apart from the title by the bar's gap plus this margin.
export const topbarTrigger = "mr-2 md:mr-3 [&_svg:not([class*='size-'])]:size-6";

export const topbarTitle = "truncate text-xl font-bold text-foreground";

export const topbarAction = "[&_svg:not([class*='size-'])]:size-6";

// Sits on the other end of the bar from the actions so a wizard step reads back
// first. It may shrink so a long step name truncates, not the actions.
export const topbarBack =
  "min-w-0 shrink text-base font-medium [&_svg:not([class*='size-'])]:size-6";

export const topbarBackLabel = "truncate";

export const topbarSpacer = "flex-1";
