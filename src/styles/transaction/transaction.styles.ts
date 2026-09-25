// Transaction screen: product panel, cart, phone cart bar and the history list.

// Products and cart side by side from md up; phones leave room for the fixed cart bar.
export const newTransactionLayout =
  "grid grid-cols-1 gap-4 max-md:pb-24 md:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] md:items-start";

export const productPanel = "flex min-w-0 flex-col gap-3";

// Category chips overflow a phone; the row scrolls sideways instead of wrapping.
export const categoryChipsScroll = "-mx-1 overflow-x-auto px-1 pb-1";

export const productGrid = "grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4";

// A product tile is one big touch target: name, code, then price and stock.
export const productCard =
  "h-auto min-h-28 w-full flex-col items-stretch justify-between gap-2 whitespace-normal p-3 text-left";

export const productCardText = "flex min-w-0 flex-col gap-0.5";

export const productName = "line-clamp-2 font-medium text-foreground";

export const productMeta = "truncate text-xs text-muted-foreground";

export const productFooter = "flex items-end justify-between gap-2";

export const productPrice = "font-semibold tabular-nums text-foreground";

export const productPriceMissing = "text-xs text-muted-foreground";

export const productStock = "text-xs tabular-nums text-muted-foreground";

// The desktop cart follows the scroll so Confirm stays in reach.
export const cartPanel = "md:sticky md:top-0";

export const cartList = "flex flex-col divide-y divide-border";

export const cartLine = "flex flex-col gap-2 py-3 first:pt-0 last:pb-0";

export const cartLineHeader = "flex items-start justify-between gap-2";

export const cartLineText = "flex min-w-0 flex-col gap-0.5";

export const cartLineName = "font-medium text-foreground";

export const cartLineMeta = "text-xs text-muted-foreground";

export const cartLineFooter = "flex items-center justify-between gap-3";

export const cartLineAmount = "font-semibold tabular-nums text-foreground";

export const cartRemove = "max-md:size-touch";

export const cartFooter = "flex w-full flex-col gap-3";

export const cartTotal = "flex flex-col gap-2";

export const cartSheetBody = "flex flex-col gap-4";

export const cartTotalRow = "flex items-baseline justify-between gap-3";

export const cartTotalLabel = "text-sm text-muted-foreground";

export const cartTotalValue = "text-xl font-semibold tabular-nums text-foreground";

export const cartConfirm = "min-h-touch w-full";

// Phones: pinned above the tab bar, clear of the home indicator.
export const cartBar =
  "fixed inset-x-0 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom,0px))] z-10 border-t border-border bg-background px-4 py-2 md:hidden";

export const cartBarRow = "flex items-center justify-between gap-3";

export const cartBarText = "flex min-w-0 flex-col";

export const cartBarCount = "text-xs text-muted-foreground";

export const cartBarTotal = "text-lg font-semibold tabular-nums text-foreground";

export const cartBarButton = "min-h-touch";

export const historyToolbar = "flex flex-col gap-3";

// History rows: the number, then a muted meta line.
export const historyCell = "flex min-w-0 flex-col gap-0.5 whitespace-normal";

export const historyTitle = "font-medium tabular-nums text-foreground";

export const historyMeta = "text-xs text-muted-foreground";

export const historyAmountStack = "flex flex-col items-end gap-1";

export const historyAmount = "font-semibold tabular-nums text-foreground";

// The detail modal's line list, above the summary sections.
export const detailLines = "flex flex-col gap-2";

export const detailLinesList = "flex flex-col divide-y divide-border rounded-md border border-border";

export const detailLine = "flex items-start justify-between gap-3 px-3 py-2";

export const detailLineText = "flex min-w-0 flex-col gap-0.5";

export const detailLineName = "font-medium text-foreground";

export const detailLineMeta = "text-xs tabular-nums text-muted-foreground";

export const detailLineAmount = "shrink-0 font-semibold tabular-nums text-foreground";

export const detailTotalRow = "flex items-baseline justify-between gap-3 px-3";
