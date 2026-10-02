// Transaction: the item picker, its add / quantity control, the cart bar and
// the cart review.

// The picker leaves room at the bottom so the last row clears the cart bar.
export const pickerStack = "flex flex-col gap-3 pb-20";

// Add button or the − qty + stepper, sized for a thumb.
export const quantityStepper = "flex items-center gap-1";

export const quantityValue = "min-w-8 text-center font-bold tabular-nums";

export const addButton = "min-h-touch md:min-h-9";

// Floats above the tab bar while items are picked; the whole bar opens the cart.
export const cartBar =
  "sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-card p-3 shadow-card-sm";

export const cartBarText = "flex min-w-0 flex-col gap-0.5";

export const cartBarTotal = "text-lg font-bold tabular-nums text-foreground";

// Cart review.
export const cartList = "flex flex-col divide-y rounded-xl border";

export const cartRow = "flex flex-col gap-2 px-3 py-3";

export const cartRowTop = "flex items-start justify-between gap-3";

export const cartRowBottom = "flex items-center justify-between gap-3";

export const cartLineTotal = "font-semibold tabular-nums text-foreground";

export const cartSummary = "flex items-center justify-between gap-3 rounded-xl bg-muted p-3";

export const cartSummaryTotal = "text-xl font-bold tabular-nums text-foreground";

export const cartForm = "flex flex-col gap-4";

// Phone row of the picker.
export const pickCard = "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card-sm";

export const pickCardRow = "flex items-center justify-between gap-3";

// Success prompt: the totals under the message.
export const receiptLine = "text-sm text-muted-foreground tabular-nums";

// History status tabs sit on their own row on phones.
export const historyStatusTabs = "w-full md:w-auto";

// History row on phones.
export const historyCardRow = "flex items-center justify-between gap-3";
