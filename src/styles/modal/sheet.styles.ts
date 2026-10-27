// TARTAR's AppSheet: a bottom sheet with a grab handle on compact screens, a
// right-hand panel on wide ones. The frame (header, footer) comes from modal.styles.
export const appSheetContent = "bg-panel";

export const appSheetBottom = "rounded-t-sheet";

export const appSheetSide = "w-full rounded-l-panel wide:max-w-md";

export const appSheetBody = "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-1";

// Floats in the header's top padding, so the title and the × line up as on a form sheet.
export const appSheetGrabZone =
  "absolute inset-x-0 top-0 z-10 flex h-4 cursor-grab touch-none justify-center pt-2 active:cursor-grabbing";

export const appSheetGrabHandle = "h-1.5 w-10 rounded-pill bg-track";

export const appSheetDragHeader = "touch-none";
