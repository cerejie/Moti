// FormField. The single place a field type becomes a control. The shadcn
// Field lays out label, control, description and error; this only stops a
// long value from widening its grid cell.
export const fieldRoot = "min-w-0";

// Touch target on compact screens; the wide height comes from the shadcn default.
export const fieldInput = "min-h-touch wide:min-h-9";

// A select fills its field like the text inputs beside it.
export const fieldSelect = "w-full";

// A reserved error line: takes its height, shows nothing, says nothing.
export const fieldErrorReserved = "invisible";

// A typed quantity beside − and +: thumb-sized, and 16 px text so iOS does not zoom.
export const quantityInput =
  "min-h-touch w-16 px-1 text-center text-base font-bold tabular-nums";
