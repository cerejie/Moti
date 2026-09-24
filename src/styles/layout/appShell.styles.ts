// The shell is locked to the viewport so the document never scrolls; the
// only scrolling box is the content region below the topbar.
export const appShellRoot = "h-dvh-safe overflow-hidden";

// The bottom tab bar is fixed, so the content column reserves its height on
// phones. min-h-0 lets it shrink to the viewport instead of growing with the
// page, and overflow-hidden keeps the scrolling content inside it.
export const appShellInset =
  "min-h-0 min-w-0 overflow-hidden max-md:pb-tabbar";

// The app's one scroll container: it spans the panel so the scrollbar hugs
// the panel edge, and the topbar above it stays put.
export const appShellContent = "min-h-0 flex-1 overflow-y-auto";

// Content sits straight on the panel; each section brings its own card. It
// spans the full panel at every width, and the fluid root size in theme.css
// scales it up on large monitors, so there is no cap leaving empty gutters.
// It is a column at least as tall as the scroll box, so a page that closes
// with a footer can hold it at the foot of a short screen.
export const appShellContentInner =
  "flex min-h-full w-full flex-col px-4 pb-10 md:px-6 lg:px-16";

// The exact inverse of the column's gutters, for a surface that runs to the
// panel edges and sets its own margin instead (the ContentView card).
export const appShellGutterBleed = "-mx-4 -mb-10 md:-mx-6 lg:-mx-16";
