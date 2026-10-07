// FormField. The single place a field type becomes a control. The shadcn
// Field lays out label, control, description and error; this only stops a
// long value from widening its grid cell.
export const fieldRoot = "min-w-0";

// Touch target on a phone; the desktop height comes from the shadcn default.
export const fieldInput = "min-h-touch md:min-h-9";

// A select fills its field like the text inputs beside it.
export const fieldSelect = "w-full";

// A reserved error line: takes its height, shows nothing, says nothing.
export const fieldErrorReserved = "invisible";
