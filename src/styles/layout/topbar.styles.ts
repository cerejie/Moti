// Bar over the content on the rail's own surface, closed off below by a
// hairline. It opens with the rail's trigger, names the page, and carries a
// wizard step's back link and the theme toggle.
export const topbarRoot =
  "sticky top-0 z-20 flex min-h-topbar items-center gap-2 border-b bg-sidebar px-4 pt-safe md:gap-3 md:px-6 lg:px-8";

// Set apart from the title by the bar's gap plus this margin.
// Icon buttons here grow from the shadcn icon-lg size to a full touch target on a phone.
export const topbarTrigger =
  "mr-2 max-md:size-touch md:mr-3 [&_svg:not([class*='size-'])]:size-6";

export const topbarTitle = "truncate text-xl font-bold text-foreground";

export const topbarAction = "max-md:size-touch [&_svg:not([class*='size-'])]:size-6";

// Sits on the other end of the bar from the actions so a wizard step reads back
// first. It may shrink so a long step name truncates, not the actions.
export const topbarBack =
  "min-w-0 shrink text-base font-medium [&_svg:not([class*='size-'])]:size-6";

export const topbarBackLabel = "truncate";

export const topbarSpacer = "flex-1";

// Superadmin's shop picker. It may shrink before the theme toggle does, and the
// page title truncates first.
export const topbarShopSwitcher = "w-40 min-w-0 shrink md:w-56";

// Stock alerts bell. The count pill rides the corner, coloured by the most urgent
// alert through toneSolid.
export const topbarAlertsButton =
  "relative max-md:size-touch [&_svg:not([class*='size-'])]:size-6";

export const topbarAlertsCount =
  "absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-pill px-1 text-xs font-semibold tabular-nums";
