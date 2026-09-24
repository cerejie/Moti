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
