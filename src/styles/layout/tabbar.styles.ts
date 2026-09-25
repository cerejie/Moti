// Phone-only bottom navigation. The desktop rail is the sidebar; this is what
// makes the installed PWA read as a native app.
export const tabbarRoot =
  "fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-safe md:hidden";

export const tabbarRow = "flex h-tabbar items-stretch";

export const tabbarItem =
  "flex flex-1 flex-col items-center justify-center gap-1 px-1 text-xs font-medium text-muted-foreground transition-colors";

export const tabbarItemActive = "text-primary";

export const tabbarLabel = "w-full truncate text-center";

// Nav count on the tab's icon corner, coloured through toneSolid.
export const tabbarIcon = "relative";

export const tabbarBadge =
  "absolute -top-1.5 left-3 flex h-4 min-w-4 items-center justify-center rounded-pill px-1 text-xs leading-none font-semibold tabular-nums";

export const tabbarBadgeLabel = "sr-only";

// The More sheet: the pages that did not fit on the bar, one touch-sized row each.
export const tabbarMoreList = "flex flex-col gap-1";

export const tabbarMoreItem =
  "flex min-h-touch items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

export const tabbarMoreItemActive = "bg-muted text-primary [&_svg]:text-primary";

export const tabbarMoreLabel = "flex-1 truncate";

export const tabbarMoreBadge =
  "flex h-5 min-w-5 items-center justify-center rounded-pill px-1.5 text-xs font-semibold tabular-nums";
