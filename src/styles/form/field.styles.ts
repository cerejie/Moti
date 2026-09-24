// FormField. The single place a field type becomes a control. The shadcn
// Field lays out label, control, description and error; this only stops a
// long value from widening its grid cell.
export const fieldRoot = "min-w-0";

// Touch target on a phone; the desktop height comes from the shadcn default.
export const fieldInput = "min-h-touch md:min-h-9";

// SearchInput's wrapper: the anchor its results hang under, and where the
// caller's layout classes land.
export const searchAnchor = "min-w-0";

// SearchInput's floating results: as wide as the box, and the list inside
// brings its own padding.
export const searchResultsPanel =
  "w-(--trigger-width) gap-0 overflow-hidden p-0";

// A select fills its field like the text inputs beside it.
export const fieldSelect = "w-full";

// A reserved error line: takes its height, shows nothing, says nothing.
export const fieldErrorReserved = "invisible";
