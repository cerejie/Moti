// TARTAR's shell. Wide screens: the header, the sidebar and the content are three
// floating panels on the app backdrop. Compact screens (PhoneShell): an app bar,
// the content straight on the backdrop and the floating tab bar as the last row.
// The document never scrolls; the content box is the only scroll box.
export const appShellRoot = "h-dvh-safe flex-col gap-3 overflow-hidden bg-app p-safe-3 text-foreground";

export const appShellBody = "flex min-h-0 flex-1 gap-3";

export const appShellInset =
  "min-h-0 min-w-0 overflow-hidden rounded-panel border bg-panel shadow-panel";

export const appShellContent = "min-h-0 flex-1 overflow-y-auto overscroll-contain";

// A column at least as tall as the scroll box, so a short page can hold a
// footer at its foot. Both shells use it.
export const appShellContentInner =
  "flex min-h-full w-full flex-col px-4 pt-4 pb-6 wide:px-6 wide:pt-6 wide:pb-10 lg:px-8";

// The exact inverse of the column's gutters, for a surface that runs to the
// panel edges and sets its own margin instead (the ContentView card).
export const appShellGutterBleed =
  "-mx-4 -mt-4 -mb-6 wide:-mx-6 wide:-mt-6 wide:-mb-10 lg:-mx-8";

export const phoneShell =
  "fixed inset-0 flex flex-col overflow-hidden bg-app text-foreground";

export const phoneContent =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain";

export const phoneColumnEnter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150";

// The route error stands in for the whole shell, so it centres itself on the backdrop.
export const routeErrorPage =
  "flex min-h-dvh items-center justify-center bg-app p-4 text-foreground";

export const routeErrorPanel = "w-full max-w-md";
