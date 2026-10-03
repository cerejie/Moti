// TARTAR's shell: on desktop the topbar, the sidebar and the content are three
// floating panels on the app backdrop; on a phone the topbar is an app bar, the
// content sits straight on the backdrop and a tab bar is fixed at the bottom.
// The document never scrolls; the content panel is the only scroll box.
export const appShellRoot =
  "h-dvh-safe flex-col overflow-hidden bg-app text-foreground md:gap-3 md:p-3";

export const appShellBody = "flex min-h-0 flex-1 md:gap-3";

export const appShellInset =
  "min-h-0 min-w-0 overflow-hidden bg-app max-md:pb-tabbar md:rounded-panel md:border md:bg-panel md:shadow-panel";

export const appShellContent = "min-h-0 flex-1 overflow-y-auto overscroll-contain";

// A column at least as tall as the scroll box, so a short page can hold a
// footer at its foot.
export const appShellContentInner =
  "flex min-h-full w-full flex-col px-4 pt-4 pb-10 md:px-6 md:pt-6 lg:px-8";

// The exact inverse of the column's gutters, for a surface that runs to the
// panel edges and sets its own margin instead (the ContentView card).
export const appShellGutterBleed = "-mx-4 -mt-4 -mb-10 md:-mx-6 md:-mt-6 lg:-mx-8";

// The route error stands in for the whole shell, so it centres itself on the backdrop.
export const routeErrorPage =
  "flex min-h-dvh items-center justify-center bg-app p-4 text-foreground";

export const routeErrorPanel = "w-full max-w-md";
