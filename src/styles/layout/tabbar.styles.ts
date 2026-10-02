// Phone-only bottom navigation, the native-app feel of the installed PWA. The
// active tab is the brand colour with a bar above it, as in TARTAR.
export const tabbarRoot =
  "fixed inset-x-0 bottom-0 z-30 border-t bg-panel pb-safe shadow-panel select-none touch-callout-none md:hidden";

export const tabbarRow = "mx-auto flex h-tabbar max-w-xl items-stretch";

export const tabbarItem =
  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-xs font-medium text-muted-foreground transition-colors";

export const tabbarItemActive = "font-semibold text-primary";

export const tabbarIndicator =
  "absolute top-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-b-full bg-primary";

export const tabbarLabel = "w-full truncate text-center";
