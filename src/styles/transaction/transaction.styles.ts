import { cva } from "class-variance-authority";
import { moneyLevel } from "../common/money.styles";

// Transaction: the item picker, its add / quantity control, the cart bar,
// the cart review and the transaction page.

// The picker leaves room at the bottom so the last row clears the cart bar. Wide fill pages
// give the list the height left, with the bar under it.
export const pickerStack = "flex flex-col gap-3 pb-20 wide:min-h-0 wide:flex-1 wide:pb-0";

// Add button or the − qty + stepper, sized for a thumb.
export const quantityStepper = "flex items-center gap-1";

export const quantityValue = "min-w-8 text-center font-bold tabular-nums";

export const addButton = "min-h-touch wide:min-h-9";

// Sales: the product list, and on wide screens the draft sale beside it.
// Wide: one row the height of the page, so the list and the review panel each scroll alone.
export const saleLayout =
  "flex flex-col gap-4 wide:grid wide:min-h-0 wide:flex-1 wide:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] wide:grid-rows-[minmax(0,1fr)] wide:items-start";

// Phones keep room under the last row for the Review sale bar; wide screens have the panel.
export const salePicker = "flex min-w-0 flex-col gap-3 pb-24 wide:min-h-0 wide:self-stretch wide:pb-0";

// The desktop review surface: always beside the list, so no review dialog is needed.
export const salePanel =
  "flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card wide:max-h-full wide:overflow-y-auto wide:overscroll-contain";

export const salePanelTitle = "text-base font-semibold";

export const salePanelActions = "flex flex-col gap-2";

export const saleBranch = "text-sm text-muted-foreground";

// The phone's one action while products are picked, above the tab bar and the home indicator.
export const reviewBar = "sticky bottom-3 z-10 flex";

export const reviewBarButton = "h-12 w-full text-base shadow-card";

// A line's unit beside the typed quantity, so 20 reads as 20 liters, not just 20.
export const lineUnit = "text-xs font-medium text-muted-foreground";

// Floats above the tab bar while items are picked; the whole bar opens the cart.
export const cartBar =
  "sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-card p-3 shadow-card";

export const cartBarText = "flex min-w-0 flex-col gap-0.5";

export const cartBarTotal = moneyLevel({ level: "amount" });

// Cart review.
export const cartList = "flex flex-col divide-y rounded-xl border";

export const cartRow = "flex flex-col gap-2 px-3 py-3";

export const cartRowTop = "flex items-start justify-between gap-3";

export const cartRowBottom = "flex items-center justify-between gap-3";

export const cartSummary = "flex items-center justify-between gap-3 rounded-xl bg-muted p-3";

// The caption wraps under "Total"; the value on the right never breaks.
export const cartSummaryMeta = "text-xs text-muted-foreground";

export const cartSummaryTotal = `shrink-0 ${moneyLevel({ level: "primary" })}`;

// A count of products, not an amount: read at body size, never as a big total.
export const cartSummaryCount = "shrink-0 text-base font-semibold tabular-nums";

export const cartForm = "flex flex-col gap-4";

// Success prompt: the totals under the message.
export const receiptLine = "text-sm text-muted-foreground tabular-nums";

// Sale page: a voided total stays readable but clearly no longer counts.
export const transactionTotal = cva(moneyLevel({ level: "primary" }), {
  variants: {
    voided: {
      true: "text-muted-foreground line-through",
      false: "",
    },
  },
  defaultVariants: { voided: false },
});

// The quantity sold on a line, at the row's end like a receipt.
export const lineQuantity = `shrink-0 ${moneyLevel({ level: "supporting" })}`;
