// Phone-only bottom navigation. The desktop rail is the sidebar; this is what
// makes the installed PWA read as a native app.
export const tabbarRoot =
  "fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-safe md:hidden";

export const tabbarRow = "flex h-tabbar items-stretch";

export const tabbarItem =
  "flex flex-1 flex-col items-center justify-center gap-1 px-1 text-xs font-medium text-muted-foreground transition-colors";

export const tabbarItemActive = "text-primary";

export const tabbarLabel = "w-full truncate text-center";
